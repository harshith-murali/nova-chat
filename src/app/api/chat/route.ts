import { streamText, UIMessage, convertToModelMessages } from "ai";
import type { ModelMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import {
  DEFAULT_ANTHROPIC_MODEL_ID,
  DEFAULT_OPENROUTER_MODEL_ID,
  ModelProvider,
  normalizeModelSelection,
} from "@/modules/chat/lib/models";

// Convert DB-stored message records into AI SDK UIMessage objects.
export function dbMessageToUIMessage(dbMessage: {
  id: string;
  role: string;
  content: string;
  createdAt?: Date | string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
}): UIMessage {
  let parsedParts: UIMessage["parts"] | null = null;

  try {
    if (
      dbMessage.content &&
      (dbMessage.content.startsWith("[") || dbMessage.content.startsWith("{"))
    ) {
      const parsed = JSON.parse(dbMessage.content);
      if (Array.isArray(parsed)) {
        parsedParts = parsed as UIMessage["parts"];
      }
    }
  } catch {
    // Keep the raw text content if parsing fails.
  }

  const role = (
    dbMessage.role === "user" ||
    dbMessage.role === "assistant" ||
    dbMessage.role === "system"
      ? dbMessage.role
      : "user"
  ) as "user" | "assistant" | "system";

  const parts: UIMessage["parts"] = [];

  if (parsedParts) {
    parts.push(...parsedParts);
  } else {
    parts.push({ type: "text", text: dbMessage.content });
  }

  if (!parsedParts && dbMessage.attachments?.length) {
    for (const attachment of dbMessage.attachments) {
      parts.push({
        type: "file",
        mediaType: attachment.type,
        filename: attachment.name,
        url: attachment.url,
      });
    }
  }

  return {
    id: dbMessage.id,
    role,
    parts,
  };
}

async function fallbackConvertToModelMessages(messages: UIMessage[]) {
  try {
    return await convertToModelMessages(messages);
  } catch (err) {
    console.warn(
      "[nova/chat] convertToModelMessages failed, using text-only fallback:",
      err,
    );

    return messages.map((msg) => {
      const role =
        msg.role === "user"
          ? "user"
          : msg.role === "system"
            ? "system"
            : "assistant";
      const text = msg.parts
        ? msg.parts
            .filter((part) => part.type === "text")
            .map((part) => (part as { type: "text"; text: string }).text)
            .join("\n")
        : "";

      return { role, content: text } as const;
    }) as ModelMessage[];
  }
}

function extractTextFromUIMessage(message: UIMessage): string {
  return (message.parts || [])
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n");
}

function toOpenRouterMessages(messages: UIMessage[]) {
  const openRouterMessages = messages
    .map((message) => {
      const role =
        message.role === "system"
          ? "system"
          : message.role === "assistant"
            ? "assistant"
            : "user";

      return {
        role,
        content: extractTextFromUIMessage(message),
      };
    })
    .filter((message) => message.content.trim().length > 0);

  return [{ role: "system", content: SYSTEM_PROMPT }, ...openRouterMessages];
}

function createUIMessageSsePart(part: unknown): string {
  return `data: ${JSON.stringify(part)}\n\n`;
}

function getOpenRouterErrorText(errorBody: string): string {
  if (!errorBody) {
    return "";
  }

  try {
    const parsed = JSON.parse(errorBody) as {
      error?: {
        message?: unknown;
        metadata?: {
          raw?: unknown;
          provider_name?: unknown;
        };
      };
    };
    const parts = [
      parsed.error?.message,
      parsed.error?.metadata?.provider_name
        ? `provider: ${parsed.error.metadata.provider_name}`
        : null,
      parsed.error?.metadata?.raw,
    ].filter((part): part is string => typeof part === "string" && part.length > 0);

    return parts.join(" - ");
  } catch {
    return errorBody;
  }
}

function isOpenRouterModelUnavailable(status: number, errorText: string): boolean {
  const normalizedError = errorText.toLowerCase();

  return (
    status === 404 ||
    normalizedError.includes("model not found") ||
    normalizedError.includes("not available") ||
    normalizedError.includes("not a valid model")
  );
}

function createOpenRouterErrorResponse({
  status,
  statusText,
  errorBody,
  modelId,
  didTryFallback,
}: {
  status: number;
  statusText: string;
  errorBody: string;
  modelId: string;
  didTryFallback: boolean;
}) {
  const providerMessage = getOpenRouterErrorText(errorBody);
  const fallbackMessage = didTryFallback
    ? ` Nova also tried ${DEFAULT_OPENROUTER_MODEL_ID}, but OpenRouter rejected that request too.`
    : "";
  const detail = providerMessage ? ` (${providerMessage})` : "";
  const message = `OpenRouter could not use "${modelId}" right now.${fallbackMessage} Please pick another model and try again.${detail}`;

  console.warn("[nova/chat] OpenRouter request failed:", {
    modelId,
    status,
    statusText,
    providerMessage,
    didTryFallback,
  });

  return Response.json({ error: true, message }, { status: 502 });
}

async function fetchOpenRouterChatCompletion({
  apiKey,
  messages,
  modelId,
}: {
  apiKey: string;
  messages: UIMessage[];
  modelId: string;
}) {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://novachat.app",
      "X-Title": "Nova Chat",
    },
    body: JSON.stringify({
      model: modelId,
      messages: toOpenRouterMessages(messages),
      stream: true,
    }),
  });
}

async function streamOpenRouterResponse({
  messages,
  modelId,
}: {
  messages: UIMessage[];
  modelId: string;
}): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: true,
        message: "OpenRouter API key is not configured.",
      },
      { status: 500 },
    );
  }

  let response = await fetchOpenRouterChatCompletion({
    apiKey,
    messages,
    modelId,
  });

  if (!response.ok || !response.body) {
    let errorBody = "";
    try {
      errorBody = await response.text();
    } catch {
      // Keep an empty body.
    }

    const shouldTryFallback =
      modelId !== DEFAULT_OPENROUTER_MODEL_ID &&
      isOpenRouterModelUnavailable(response.status, getOpenRouterErrorText(errorBody));

    if (shouldTryFallback) {
      console.warn("[nova/chat] retrying unavailable OpenRouter model with fallback:", {
        requested: modelId,
        fallback: DEFAULT_OPENROUTER_MODEL_ID,
      });

      response = await fetchOpenRouterChatCompletion({
        apiKey,
        messages,
        modelId: DEFAULT_OPENROUTER_MODEL_ID,
      });

      if (response.ok && response.body) {
        modelId = DEFAULT_OPENROUTER_MODEL_ID;
      } else {
        let fallbackErrorBody = "";
        try {
          fallbackErrorBody = await response.text();
        } catch {
          // Keep an empty body.
        }

        return createOpenRouterErrorResponse({
          status: response.status,
          statusText: response.statusText,
          errorBody: fallbackErrorBody || errorBody,
          modelId,
          didTryFallback: true,
        });
      }
    } else {
      return createOpenRouterErrorResponse({
        status: response.status,
        statusText: response.statusText,
        errorBody,
        modelId,
        didTryFallback: false,
      });
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const enqueue = (part: unknown) => {
        controller.enqueue(encoder.encode(createUIMessageSsePart(part)));
      };

      enqueue({ type: "start" });
      enqueue({ type: "start-step" });
      enqueue({ type: "text-start", id: "0" });

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            const dataLines = event
              .split("\n")
              .filter((line) => line.startsWith("data: "))
              .map((line) => line.slice(6).trim());

            for (const data of dataLines) {
              if (!data || data === "[DONE]") continue;

              let parsed: {
                choices?: Array<{
                  delta?: { content?: string };
                  finish_reason?: string | null;
                }>;
                error?: { message?: string };
              };

              try {
                parsed = JSON.parse(data);
              } catch {
                continue;
              }

              if (parsed.error?.message) {
                enqueue({ type: "error", errorText: parsed.error.message });
                continue;
              }

              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                enqueue({ type: "text-delta", id: "0", delta });
              }
            }
          }
        }

        enqueue({ type: "text-end", id: "0" });
        enqueue({ type: "finish-step" });
        enqueue({ type: "finish", finishReason: "stop" });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("OpenRouter stream error:", error);
        enqueue({
          type: "error",
          errorText: "OpenRouter could not generate a response.",
        });
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "x-vercel-ai-ui-message-stream": "v1",
    },
  });
}

export async function POST(req: Request) {
  const {
    messages,
    modelId,
    provider,
  }: { messages: UIMessage[]; modelId?: string; provider?: ModelProvider } =
    await req.json();

  try {
    console.debug("/api/chat POST received messages count:", messages?.length);
    console.debug(
      "/api/chat first message preview:",
      messages && messages.length > 0
        ? JSON.stringify(messages[0]).slice(0, 400)
        : null,
    );
  } catch {
    // ignore
  }

  const selection = normalizeModelSelection(modelId, provider);

  if (selection.provider === "openrouter") {
    if (selection.modelId !== modelId) {
      console.warn("[nova/chat] normalized OpenRouter model id:", {
        requested: modelId || null,
        resolved: selection.modelId,
        defaultModel: DEFAULT_OPENROUTER_MODEL_ID,
      });
    }

    return streamOpenRouterResponse({
      messages,
      modelId: selection.modelId,
    });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error: true,
        message: "Anthropic API key is not configured.",
      },
      { status: 500 },
    );
  }

  const anthropicModel = selection.modelId;

  if (!anthropicModel) {
    return Response.json(
      {
        error: true,
        message: "No supported Anthropic model is configured.",
      },
      { status: 500 },
    );
  }

  try {
    const convertedMessages = await fallbackConvertToModelMessages(messages);

    if (anthropicModel !== modelId) {
      console.warn("[nova/chat] normalized Anthropic model id:", {
        requested: modelId || null,
        resolved: anthropicModel,
        defaultModel: DEFAULT_ANTHROPIC_MODEL_ID,
      });
    }

    const result = streamText({
      model: anthropic(anthropicModel),
      system: SYSTEM_PROMPT,
      messages: convertedMessages,
      onError: ({ error }) => {
        console.error("Anthropic stream error:", error);
      },
    });
    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("Anthropic UI stream error:", error);
        return "Nova could not generate a response. Please try again.";
      },
    });
  } catch (err: unknown) {
    console.error("streamText execution error:", err);
    // Surface a clear non-OK response so the client can handle the error
    const body = {
      error: true,
      message: err instanceof Error ? err.message : "AI provider error",
    };
    return Response.json(body, { status: 502 });
  }
}
