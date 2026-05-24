export type ModelProvider = "anthropic" | "openrouter";

export interface AIModel {
  id: string;
  label: string;
  provider: ModelProvider;
  isFree?: boolean;
  contextLength?: number;
  description?: string;
  supportsStreaming?: boolean;

  // Backward-compatible fields used by the existing selector UI.
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture?: string | Record<string, unknown>;
  top_provider?: {
    is_moderated: boolean;
    context_length: number;
  };
}

export const DEFAULT_ANTHROPIC_MODEL_ID = "claude-sonnet-4-20250514";
export const DEFAULT_OPENROUTER_MODEL_ID = "openrouter/free";

export const OPENROUTER_FREE_FALLBACK_MODEL: AIModel = {
  id: DEFAULT_OPENROUTER_MODEL_ID,
  label: "OpenRouter Free",
  name: "OpenRouter Free",
  provider: "openrouter",
  isFree: true,
  supportsStreaming: true,
  description:
    "OpenRouter's free fallback router. Availability depends on OpenRouter's currently free capacity.",
  contextLength: 0,
  context_length: 0,
  pricing: { prompt: "0", completion: "0" },
  architecture: "openrouter",
  top_provider: { is_moderated: false, context_length: 0 },
};

export const CLAUDE_MODELS: AIModel[] = [
  {
    id: DEFAULT_ANTHROPIC_MODEL_ID,
    label: "Claude Sonnet 4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    isFree: false,
    supportsStreaming: true,
    description:
      "Anthropic's best balance of speed and intelligence. Ideal for professional work, coding, and complex reasoning.",
    contextLength: 200000,
    context_length: 200000,
    pricing: { prompt: "3.00", completion: "15.00" },
    architecture: "claude4",
    top_provider: { is_moderated: false, context_length: 200000 },
  },
];

const VALID_ANTHROPIC_MODEL_IDS = new Set(CLAUDE_MODELS.map((model) => model.id));

const STALE_ANTHROPIC_MODEL_ALIASES: Record<string, string> = {
  "claude-sonnet-4-6": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-haiku-4-5-20251001": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-opus-4-7": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-3-5-sonnet-latest": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-3-5-haiku-20241022": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-3-5-haiku-latest": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-3-opus-latest": DEFAULT_ANTHROPIC_MODEL_ID,
  "claude-opus-4-1-20250805": DEFAULT_ANTHROPIC_MODEL_ID,
};

const STALE_OPENROUTER_MODEL_ALIASES: Record<string, string> = {
  "minimax/m2.5": "minimax/minimax-m2.5:free",
};

export function normalizeAnthropicModelId(modelId?: string | null): string {
  if (!modelId) {
    return DEFAULT_ANTHROPIC_MODEL_ID;
  }

  const normalizedModelId = STALE_ANTHROPIC_MODEL_ALIASES[modelId] || modelId;

  if (VALID_ANTHROPIC_MODEL_IDS.has(normalizedModelId)) {
    return normalizedModelId;
  }

  return DEFAULT_ANTHROPIC_MODEL_ID;
}

export function normalizeOpenRouterModelId(modelId?: string | null): string {
  if (!modelId || modelId.includes("claude")) {
    return DEFAULT_OPENROUTER_MODEL_ID;
  }

  return STALE_OPENROUTER_MODEL_ALIASES[modelId] || modelId;
}

export function inferModelProvider(modelId?: string | null): ModelProvider {
  if (modelId?.includes("claude")) {
    return "anthropic";
  }

  return "openrouter";
}

export function normalizeModelSelection(
  modelId?: string | null,
  provider?: ModelProvider | string | null,
): { provider: ModelProvider; modelId: string } {
  const inferredProvider =
    provider === "anthropic" || provider === "openrouter"
      ? provider
      : inferModelProvider(modelId);

  if (inferredProvider === "anthropic") {
    return {
      provider: "anthropic",
      modelId: normalizeAnthropicModelId(modelId),
    };
  }

  return {
    provider: "openrouter",
    modelId: normalizeOpenRouterModelId(modelId),
  };
}

export function normalizeModelId(modelId?: string | null): string | null {
  if (!modelId) {
    return null;
  }

  return normalizeModelSelection(modelId).modelId;
}

export function isSupportedAnthropicModelId(modelId: string): boolean {
  return VALID_ANTHROPIC_MODEL_IDS.has(modelId);
}
