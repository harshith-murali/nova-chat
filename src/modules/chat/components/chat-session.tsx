"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ChatWelcomeTabs from "./chat-welcome-tabs";
import ChatMessageView, { Message } from "./chat-message-view";
import ChatMessageForm from "./chat-message-form";
import { AIModel, useAIModels } from "../hooks/use-ai-models";
import {
  OPENROUTER_FREE_FALLBACK_MODEL,
  normalizeModelSelection,
} from "../lib/models";
import { HelpCircle, Wand2, Compass, Code2, Terminal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCreateChat, useChatMessages } from "@/hooks/use-chats";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Suggestions data populated with verified Lucide icons
const TABS_SUGGESTIONS_DATA = [
  {
    id: "ask",
    label: "Ask",
    items: [
      {
        id: "ask-1",
        title: "Explain quantum computing",
        prompt:
          "Explain quantum computing in simple terms for a high school student.",
        description: "Translate complex concepts into clean analogies.",
        icon: <HelpCircle className="h-4 w-4" />,
      },
      {
        id: "ask-2",
        title: "Brainstorm app ideas",
        prompt:
          "Brainstorm 5 unique web application ideas for modern developers.",
        description: "Generate creative startup or product concepts.",
        icon: <Wand2 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "create",
    label: "Create",
    items: [
      {
        id: "create-1",
        title: "Draft a welcome email",
        prompt:
          "Write a welcoming, professional onboarding email for new team members.",
        description: "Craft polite and friendly communications.",
        icon: <Wand2 className="h-4 w-4" />,
      },
      {
        id: "create-2",
        title: "Design a landing layout",
        prompt:
          "Describe the structural sections and styling for a modern SaaS landing page.",
        description: "Plan component flows and visual structures.",
        icon: <Compass className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "explore",
    label: "Explore",
    items: [
      {
        id: "explore-1",
        title: "Compare SQL vs NoSQL",
        prompt:
          "What are the trade-offs between PostgreSQL and MongoDB for a chat application?",
        description: "Analyze database paradigms and features.",
        icon: <Compass className="h-4 w-4" />,
      },
      {
        id: "explore-2",
        title: "Optimize API routes",
        prompt:
          "Explain standard patterns for caching API responses in Next.js applications.",
        description: "Learn about performant web architectures.",
        icon: <HelpCircle className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "code",
    label: "Code",
    items: [
      {
        id: "code-1",
        title: "Write a React hook",
        prompt:
          "Write a custom React hook in TypeScript that handles window resize events with debouncing.",
        description: "Generate production-ready frontend logic.",
        icon: <Code2 className="h-4 w-4" />,
      },
      {
        id: "code-2",
        title: "Fix a prisma connection",
        prompt:
          "How do I resolve a prisma database connection timeout issue in serverless functions?",
        description: "Debug database connection pooling in serverless.",
        icon: <Terminal className="h-4 w-4" />,
      },
    ],
  },
];

interface ChatSessionProps {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
  chatId?: string;
}

export default function ChatSession({ user, chatId }: ChatSessionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [inputAttachments, setInputAttachments] = useState<Attachment[]>([]);

  const { data: models = [], isLoading: isLoadingModels } = useAIModels();

  // Restore user selection or set default model on mount / load
  useEffect(() => {
    if (isLoadingModels || models.length === 0) return;

    const savedSelection = normalizeModelSelection(
      localStorage.getItem("nova-selected-model-id"),
      localStorage.getItem("nova-selected-model-provider"),
    );
    let modelToSelect: AIModel | null = null;

    modelToSelect =
      models.find(
        (m) =>
          m.id === savedSelection.modelId &&
          m.provider === savedSelection.provider,
      ) || null;

    if (!modelToSelect) {
      // Find a default model: Claude Sonnet if available, or Gemini, or first available
      modelToSelect =
        models.find((m) => m.id.toLowerCase().includes("sonnet")) ||
        models.find((m) => m.id.toLowerCase().includes("gemma")) ||
        models[0] ||
        null;
    }

    if (modelToSelect) {
      setSelectedModel(modelToSelect);
      localStorage.setItem("nova-selected-model-id", modelToSelect.id);
      localStorage.setItem(
        "nova-selected-model-provider",
        modelToSelect.provider,
      );
    }
  }, [models, isLoadingModels]);

  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
    if (model?.id) {
      localStorage.setItem("nova-selected-model-id", model.id);
      localStorage.setItem("nova-selected-model-provider", model.provider);
    }
  };

  const searchParams = useSearchParams();
  const autoTrigger = searchParams.get("autoTrigger") === "true";

  const {
    messages: dbMessages,
    sendMessage: sendDbMessage,
    generateAI,
    editMessage,
    deleteMessage,
  } = useChatMessages(chatId);
  const { createChat } = useCreateChat();

  // Sync with DB messages on load/update
  useEffect(() => {
    if (chatId && dbMessages && Array.isArray(dbMessages)) {
      const mapped = (dbMessages as any[]).map((msg: any) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        createdAt: new Date(msg.createdAt),
        status: "sent" as const,
        attachments: msg.attachments || [],
      }));
      setMessages(mapped);
    } else if (!chatId) {
      setMessages([]);
    }
  }, [chatId, dbMessages]);

  // Keep a ref of active attachments for unmount cleanup
  const attachmentsRef = useRef<Attachment[]>(inputAttachments);
  useEffect(() => {
    attachmentsRef.current = inputAttachments;
  }, [inputAttachments]);

  // Safely clean up local object URLs when the component is destroyed
  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((att) => {
        if (att.url.startsWith("blob:")) {
          URL.revokeObjectURL(att.url);
        }
      });
    };
  }, []);

  const hasTriggeredRef = useRef(false);

  // Custom streaming helper for AI response
  const streamAIResponse = useCallback(
    async (chatMessages: Message[], selectedModel: AIModel) => {
      setIsTyping(true);

      const assistantMessageId = `msg-assistant-${Date.now()}`;
      const newAssistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
        status: "streaming",
      };
      setStreamingMessage(newAssistantMessage);

      let fullContent = "";
      let didSaveAssistantMessage = false;

      try {
        // Map historical messages to UIMessage format for `/api/chat`
        const uiMessages = chatMessages.map((msg) => {
          const parts: any[] = [{ type: "text", text: msg.content }];
          if (msg.attachments && msg.attachments.length > 0) {
            msg.attachments.forEach((att) => {
              parts.push({
                type: "file",
                mediaType: att.type,
                filename: att.name,
                url: att.url,
              });
            });
          }
          return {
            id: msg.id,
            role: msg.role,
            parts,
          };
        });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: uiMessages,
            modelId: selectedModel.id,
            provider: selectedModel.provider,
          }),
        });

        console.debug(
          "/api/chat response status:",
          response.status,
          response.statusText,
        );

        if (!response.ok) {
          let errorMessage = response.statusText || "AI provider error";
          try {
            const errorBody = await response.json();
            errorMessage = errorBody?.message || errorMessage;
          } catch {
            try {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            } catch {
              // Keep the status text if the body cannot be read.
            }
          }
          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error("No response body received");
        }

        // Parse the SSE stream manually.
        // response.body is ReadableStream<Uint8Array> (raw bytes), NOT parsed chunks.
        // readUIMessageStream expects pre-parsed UIMessageChunk objects, so we must
        // decode + parse the SSE format ourselves.
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        let reasoningText = "";
        let mainText = "";

        outer: while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") break outer;

            let chunk: any;
            try {
              chunk = JSON.parse(data);
            } catch {
              continue;
            }

            // Support wrapped shapes like { part: { type: 'text-delta', delta: '...' } }
            if (chunk && chunk.part) {
              chunk = chunk.part;
            }

            if (chunk?.type === "error") {
              throw new Error(
                chunk.errorText ||
                  chunk.message ||
                  "Nova could not generate a response.",
              );
            }

            // Support both `delta` and `text` fields depending on provider transforms
            const deltaText = chunk?.delta ?? chunk?.text ?? "";

            if (chunk?.type === "text-delta") {
              mainText += deltaText;
            } else if (chunk?.type === "reasoning-delta") {
              reasoningText += deltaText;
            }

            fullContent = reasoningText
              ? `<thought>\n${reasoningText}\n</thought>\n${mainText}`
              : mainText;

            try {
              console.debug("stream chunk:", {
                chunkType: chunk.type,
                deltaPreview: String(chunk.delta ?? "").slice(0, 120),
              });
              console.debug(
                "assembled assistant content length:",
                fullContent.length,
                "preview:",
                fullContent.slice(0, 200),
              );
            } catch (e) {
              /* ignore logging errors */
            }

            setStreamingMessage((prev) =>
              prev ? { ...prev, content: fullContent } : null,
            );
          }
        }

        // Mark streaming as done — keep bubble visible with "sent" status
        // while DB persists (avoids flash-of-empty between stream end and DB sync)
        setStreamingMessage((prev) =>
          prev
            ? { ...prev, status: "sent" as const, content: fullContent }
            : null,
        );

        console.debug(
          "streaming finished — final assistant content length:",
          fullContent.length,
          "preview:",
          fullContent.slice(0, 300),
        );

        // Before saving, ensure we have non-empty content. If empty, mark as error instead
        if (!fullContent || fullContent.trim().length === 0) {
          console.warn(
            "No assistant content produced by stream; marking as error.",
          );
          setStreamingMessage((prev) =>
            prev
              ? {
                  ...prev,
                  status: "error" as const,
                  content: "Failed to generate response.",
                }
              : null,
          );
        } else {
          // Save complete reply to DB to trigger TanStack Query sync
          await sendDbMessage({
            role: "assistant",
            content: fullContent,
          });
          didSaveAssistantMessage = true;
        }

        // DB is now updated — clear the local streaming copy (DB copy will render instead).
        // Keep error bubbles local and visible instead of clearing them into an empty thread.
        if (didSaveAssistantMessage) {
          setStreamingMessage(null);
        }
      } catch (error) {
        console.error("Error streaming AI response:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Nova could not generate a response.";
        setStreamingMessage((prev) =>
          prev
            ? {
                ...prev,
                status: "error" as const,
                content: fullContent || message,
              }
            : null,
        );
      } finally {
        setIsTyping(false);
      }
    },
    [chatId, sendDbMessage],
  );

  // Reset trigger state when chatId changes
  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [chatId]);

  // Handle first message redirect auto-triggering AI response.
  // Tracks messages so it re-evaluates once the DB message loads,
  // while hasTriggeredRef prevents double-firing even if other deps change.
  useEffect(() => {
    if (
      chatId &&
      autoTrigger &&
      !hasTriggeredRef.current &&
      !isLoadingModels &&
      selectedModel
    ) {
      // Only trigger when exactly 1 user message is present (no AI reply yet)
      if (messages.length !== 1) return;

      hasTriggeredRef.current = true;

      const fetchCompletion = async () => {
        try {
          await streamAIResponse(messages, selectedModel);

          // Remove autoTrigger parameter from URL history
          window.history.replaceState({}, "", window.location.pathname);
        } catch (err) {
          console.error("Error generating AI reply:", err);
        }
      };

      fetchCompletion();
    }
  }, [
    chatId,
    autoTrigger,
    isLoadingModels,
    selectedModel,
    messages,
    streamAIResponse,
  ]);

  const userNameInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : undefined;

  const handleSelectPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleAddAttachments = (files: FileList) => {
    const newAttachments = Array.from(files).map((file) => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }));
    setInputAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setInputAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content && inputAttachments.length === 0) return;

    setInputValue("");
    const currentAttachments = [...inputAttachments];
    setInputAttachments([]);

    const attachmentInputs = currentAttachments.map((att) => ({
      name: att.name,
      url: att.url,
      type: att.type,
      size: att.size,
    }));

    if (chatId) {
      // Local User message instant render
      const userMessage: Message = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: content || "Sent attachment(s)",
        createdAt: new Date(),
        status: "sent",
        attachments: currentAttachments,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        await sendDbMessage({
          role: "user",
          content: content || "Sent attachment(s)",
          attachments: attachmentInputs,
        });

        const messagesForAI = [...messages, userMessage];
        await streamAIResponse(
          messagesForAI,
          selectedModel || OPENROUTER_FREE_FALLBACK_MODEL,
        );
      } catch (error) {
        console.error("Failed to send message/reply:", error);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Start a new conversation thread in the database
      const userMessage: Message = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: content || "Sent attachment(s)",
        createdAt: new Date(),
        status: "sent",
        attachments: currentAttachments,
      };
      setMessages([userMessage]);
      setIsTyping(true);

      try {
        const title = content.slice(0, 40) || "New Conversation";
        await createChat({
          title,
          content: content || "Sent attachment(s)",
          attachments: attachmentInputs,
        });
      } catch (error) {
        setIsTyping(false);
        console.error("Failed to start new chat:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground relative overflow-hidden font-sans dark:bg-[oklch(0.105_0.006_250)]">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_0.8px,transparent_0.8px)] bg-size-[16px_16px] opacity-30 pointer-events-none dark:bg-[radial-gradient(rgba(255,255,255,0.055)_0.6px,transparent_0.6px)] dark:opacity-25" />
      <div className="absolute inset-0 pointer-events-none dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_24%,rgba(0,0,0,0.16))]" />

      {/* Scrollable conversation / welcome body */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative z-10">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <ChatWelcomeTabs
              data={TABS_SUGGESTIONS_DATA}
              onSelectPrompt={handleSelectPrompt}
            />
          </div>
        ) : (
          <ChatMessageView
            messages={
              streamingMessage ? [...messages, streamingMessage] : messages
            }
            isTyping={isTyping && !streamingMessage}
            userAvatar={user?.image}
            userNameInitials={userNameInitials}
            onEditMessage={(messageId, content) =>
              editMessage({ messageId, content })
            }
            onDeleteMessage={deleteMessage}
          />
        )}
      </div>

      {/* Sticky Bottom Glass Input Bar */}
      <div className="shrink-0 p-4 sm:p-6 bg-linear-to-t from-background via-background/95 to-transparent dark:from-[oklch(0.105_0.006_250)] dark:via-[oklch(0.105_0.006_250)/0.96] relative z-20">
        <ChatMessageForm
          inputValue={inputValue}
          onChangeValue={setInputValue}
          onSubmit={handleSendMessage}
          isTyping={isTyping}
          selectedModel={selectedModel}
          onSelectModel={handleSelectModel}
          attachments={inputAttachments}
          onAddAttachments={handleAddAttachments}
          onRemoveAttachment={handleRemoveAttachment}
        />
      </div>
    </div>
  );
}
