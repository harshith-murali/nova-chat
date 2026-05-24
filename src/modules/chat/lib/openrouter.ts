import {
  AIModel,
  OPENROUTER_FREE_FALLBACK_MODEL,
} from "@/modules/chat/lib/models";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const OPENROUTER_CACHE_MS = 60 * 60 * 1000;

type OpenRouterModel = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  context_length?: unknown;
  architecture?: unknown;
  pricing?: {
    prompt?: unknown;
    completion?: unknown;
  };
  top_provider?: {
    is_moderated?: unknown;
    context_length?: unknown;
  };
};

type CachedOpenRouterModels = {
  fetchedAt: number;
  models: AIModel[];
};

let cachedOpenRouterModels: CachedOpenRouterModels | null = null;

function isZeroPrice(value: unknown): boolean {
  if (value === undefined || value === null || value === "") {
    return false;
  }

  return Number(value) === 0;
}

function isChatTextModel(model: OpenRouterModel): boolean {
  if (typeof model.id !== "string") {
    return false;
  }

  const id = model.id.toLowerCase();
  const architecture =
    model.architecture && typeof model.architecture === "object"
      ? (model.architecture as Record<string, unknown>)
      : null;
  const inputModalities = Array.isArray(architecture?.input_modalities)
    ? architecture.input_modalities
    : [];
  const outputModalities = Array.isArray(architecture?.output_modalities)
    ? architecture.output_modalities
    : [];

  const hasTextOutput =
    outputModalities.length === 0 || outputModalities.includes("text");
  const hasTextInput =
    inputModalities.length === 0 || inputModalities.includes("text");
  const looksNonChat =
    id.includes("embed") ||
    id.includes("tts") ||
    id.includes("whisper") ||
    id.includes("moderation") ||
    id.includes("image") ||
    id.includes("rerank");

  return hasTextInput && hasTextOutput && !looksNonChat;
}

function toAIModel(model: OpenRouterModel): AIModel | null {
  if (typeof model.id !== "string") {
    return null;
  }

  const contextLength =
    typeof model.context_length === "number" ? model.context_length : 0;
  const prompt = String(model.pricing?.prompt ?? "0");
  const completion = String(model.pricing?.completion ?? "0");
  const topProviderContextLength =
    typeof model.top_provider?.context_length === "number"
      ? model.top_provider.context_length
      : contextLength;

  return {
    id: model.id,
    label: typeof model.name === "string" ? model.name : model.id,
    name: typeof model.name === "string" ? model.name : model.id,
    provider: "openrouter",
    isFree: true,
    supportsStreaming: true,
    description:
      typeof model.description === "string" ? model.description : "",
    contextLength,
    context_length: contextLength,
    pricing: { prompt, completion },
    architecture:
      typeof model.architecture === "string" ||
      (model.architecture && typeof model.architecture === "object")
        ? (model.architecture as AIModel["architecture"])
        : undefined,
    top_provider: {
      is_moderated: Boolean(model.top_provider?.is_moderated),
      context_length: topProviderContextLength,
    },
  };
}

function sortModelsForSelector(models: AIModel[]): AIModel[] {
  return [...models].sort((a, b) => {
    const aProvider = a.id.split("/")[0] || "";
    const bProvider = b.id.split("/")[0] || "";
    return (
      aProvider.localeCompare(bProvider) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id)
    );
  });
}

export async function fetchOpenRouterFreeModels(): Promise<AIModel[]> {
  const now = Date.now();
  if (
    cachedOpenRouterModels &&
    now - cachedOpenRouterModels.fetchedAt < OPENROUTER_CACHE_MS
  ) {
    return cachedOpenRouterModels.models;
  }

  const headers: Record<string, string> = {
    "HTTP-Referer": "https://novachat.app",
    "X-Title": "Nova Chat",
  };

  if (process.env.OPENROUTER_API_KEY) {
    headers.Authorization = `Bearer ${process.env.OPENROUTER_API_KEY}`;
  }

  const response = await fetch(OPENROUTER_MODELS_URL, {
    method: "GET",
    headers,
    next: { revalidate: OPENROUTER_CACHE_MS / 1000 },
  });

  if (!response.ok) {
    throw new Error(
      `OpenRouter models fetch failed: ${response.status} ${response.statusText}`,
    );
  }

  const data: unknown = await response.json();
  const models = Array.isArray((data as { data?: unknown }).data)
    ? ((data as { data: OpenRouterModel[] }).data)
    : [];

  if (models.length === 0) {
    throw new Error("OpenRouter models response did not include a data array.");
  }

  const freeModels = sortModelsForSelector(
    models
      .filter(
        (model) =>
          isZeroPrice(model.pricing?.prompt) &&
          isZeroPrice(model.pricing?.completion) &&
          isChatTextModel(model),
      )
      .map(toAIModel)
      .filter((model): model is AIModel => Boolean(model)),
  );

  const withFallback = freeModels.some(
    (model) => model.id === OPENROUTER_FREE_FALLBACK_MODEL.id,
  )
    ? freeModels
    : [OPENROUTER_FREE_FALLBACK_MODEL, ...freeModels];

  cachedOpenRouterModels = {
    fetchedAt: now,
    models: withFallback,
  };

  return withFallback;
}

export function getOpenRouterFallbackModels(): AIModel[] {
  return [OPENROUTER_FREE_FALLBACK_MODEL];
}
