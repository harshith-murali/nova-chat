"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAIModels, AIModel } from "../hooks/use-ai-models";
import { 
  Sparkles, 
  ChevronDown, 
  Check, 
  Loader2, 
  Search, 
  Info, 
  X, 
  Compass, 
  Shield, 
  HardDrive, 
  HelpCircle,
  Activity,
  Cpu,
  Zap,
  DollarSign,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelProvider } from "../lib/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (model: AIModel) => void;
}

// Helper to dynamically extract rich developer metadata based on OpenRouter Model IDs
const deriveModelMetadata = (model: AIModel) => {
  const id = model.id.toLowerCase();
  
  // 1. Release Family & Provider
  let provider = model.provider === "anthropic" ? "Anthropic" : "OpenRouter";
  let family = "Transformer Core";
  if (id.includes("claude")) {
    provider = "Anthropic";
    family = "Claude Series";
  } else if (id.includes("google/")) {
    provider = "Google";
    family = "Gemini Suite";
  } else if (id.includes("meta/") || id.includes("meta-llama/")) {
    provider = "Meta AI";
    family = "Llama Series";
  } else if (id.includes("mistralai/") || id.includes("pixtral")) {
    provider = "Mistral AI";
    family = "Mistral Core";
  } else if (id.includes("deepseek/")) {
    provider = "DeepSeek";
    family = "DeepSeek R1/V3";
  } else if (id.includes("openai/")) {
    provider = "OpenAI";
    family = "GPT Foundation";
  } else if (id.includes("qwen/")) {
    provider = "Alibaba Qwen";
    family = "Qwen Family";
  }

  // 2. Modalities (Text vs Multimodal)
  let inputModalities = "Text Only";
  const outputModalities = "Text, Code";
  if (id.includes("gemini-2.5") || id.includes("pixtral") || id.includes("vision") || id.includes("vision-free")) {
    inputModalities = "Text, Image";
  }

  // 3. Capabilities
  const toolCalling = (id.includes("gemini") || id.includes("mistral") || id.includes("llama-3.1") || id.includes("llama-3.3") || id.includes("gpt")) 
    ? "Fully Supported" 
    : "Unsupported / Limited";
  
  const reasoning = (id.includes("reasoning") || id.includes("r1") || id.includes("o1") || id.includes("o3"))
    ? "Advanced (Chain of Thought)"
    : "Standard Prompt Completion";

  // 4. Performance & Latency Speed Tier
  const latency = (id.includes("flash") || id.includes("speed") || id.includes("haiku") || id.includes("fast"))
    ? "Ultra-Fast (Low Latency)"
    : "Balanced / Standard";

  // 5. Strengths, Limitations, and Use Cases
  let bestUseCases = "General knowledge, code compiling, text drafting, translation.";
  let strengths = "High accessibility, balanced reasoning, low network overhead.";
  let limitations = "Rate limitations under peak load, session boundary constraints.";

  if (id.includes("gemini")) {
    bestUseCases = "Multi-language processing, high-frequency chat, vision translation, general coding.";
    strengths = "Massive context limit, extremely low latency responses, vision inputs.";
    limitations = "Minor instructions drift under extremely long query sequences.";
  } else if (id.includes("deepseek")) {
    bestUseCases = "Complex algorithmic logic, math theorem solver, detailed systems debugging.";
    strengths = "Chain-of-thought mathematical reasoning, superior structured code extraction.";
    limitations = "Response generation time is longer due to deep reasoning steps.";
  } else if (id.includes("llama")) {
    bestUseCases = "Agent routing, conversational roleplay, text summaries, code structuring.";
    strengths = "Highly natural dialog flow, excellent JSON format parsing capabilities.";
    limitations = "Vulnerable to rate throttle limitations under free-tier caps.";
  }

  // Claude-specific use-case overrides
  if (id.includes("claude")) {
    bestUseCases = "Advanced coding, complex reasoning, long document analysis, agentic tasks.";
    strengths = "Extremely large context window, nuanced instruction-following, safe and reliable outputs.";
    limitations = "Paid API — costs apply per token; no free tier.";
  }

  return {
    provider,
    family,
    inputModalities,
    outputModalities,
    toolCalling,
    reasoning,
    latency,
    bestUseCases,
    strengths,
    limitations
  };
};

const MODEL_PROVIDER_LABELS: Record<ModelProvider, string> = {
  anthropic: "Claude",
  openrouter: "OpenRouter Free",
};

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
}: ModelSelectorProps) {
  const { data: models = [], isLoading, isError } = useAIModels();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailedModel, setDetailedModel] = useState<AIModel | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close specs modal on click outside
  useEffect(() => {
    const handleClickOutsideModal = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setDetailedModel(null);
      }
    };
    if (detailedModel) {
      document.addEventListener("mousedown", handleClickOutsideModal);
    }
    return () => document.removeEventListener("mousedown", handleClickOutsideModal);
  }, [detailedModel]);

  // Default to Claude Sonnet if available (Anthropic key), then Gemma (OpenRouter), then first model
  const defaultModel = models.find(m => m.id.toLowerCase().includes("sonnet")) 
    || models.find(m => m.id.toLowerCase().includes("gemma")) 
    || models[0];
  const selectedModel = models.find((m) => m.id === selectedModelId) || defaultModel;

  // Filter models by search text query
  const filteredModels = models.filter((model) =>
    (model.label || model.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedModels = (["anthropic", "openrouter"] as ModelProvider[])
    .map((provider) => ({
      provider,
      models: filteredModels.filter((model) => model.provider === provider),
    }))
    .filter((group) => group.models.length > 0);

  const meta = detailedModel ? deriveModelMetadata(detailedModel) : null;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      
      {/* Model Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.8 rounded-xl border border-zinc-200/60 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-950/35 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-850/85 transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        <span className="truncate max-w-[120px] sm:max-w-[160px]">
          {isLoading ? "Loading models..." : selectedModel?.label || selectedModel?.name || "Select Model"}
        </span>
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
        ) : (
          <ChevronDown 
            className="h-3 w-3 text-zinc-450 dark:text-zinc-550 transition-transform duration-200" 
            style={{ transform: isOpen ? "rotate(180deg)" : "none" }} 
          />
        )}
      </button>

      {/* Model Selection Dropdown Popup list */}
      {isOpen && !isLoading && (
        <div className="absolute bottom-full mb-2 left-0 w-72 bg-white dark:bg-zinc-900/95 border border-zinc-200/70 dark:border-zinc-700/70 rounded-2xl shadow-xl backdrop-blur-md z-50 flex flex-col max-h-72 overflow-hidden animate-fade-in shadow-[0_12px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_22px_70px_rgba(0,0,0,0.52)] select-none">
          
          {/* Top Search bar */}
          <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 sticky top-0 bg-white/95 dark:bg-zinc-900/95 z-10 shrink-0 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-455 dark:text-zinc-650 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="w-full bg-transparent border-0 ring-0 focus:ring-0 text-xs text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none font-medium"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="p-0.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Model items container */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {isError && (
              <div className="text-[10px] text-red-500 font-bold p-3 text-center">
                Failed to load models. Using fallback.
              </div>
            )}
            {filteredModels.length === 0 ? (
              <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold p-3 text-center">
                No matching models found.
              </div>
            ) : (
              groupedModels.map((group) => (
                <div key={group.provider} className="space-y-1">
                  <div className="px-2.5 pt-2 pb-1 text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                    {MODEL_PROVIDER_LABELS[group.provider]}
                  </div>
                  {group.models.map((model) => {
                    const isSelected =
                      selectedModel?.id === model.id &&
                      selectedModel?.provider === model.provider;
                    return (
                      <div
                        key={`${model.provider}:${model.id}`}
                        className={cn(
                          "w-full flex items-center justify-between gap-1.5 px-3 py-2 rounded-xl text-left transition-all group relative cursor-pointer",
                          isSelected
                            ? "bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-650 dark:text-indigo-300 ring-1 ring-indigo-500/10"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-850/65 text-zinc-800 dark:text-zinc-300"
                        )}
                        onClick={() => {
                          onSelectModel(model);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate leading-none">
                              {model.label || model.name}
                            </span>
                            {model.isFree && (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
                                Free
                              </span>
                            )}
                            {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-850/80 text-zinc-550 dark:text-zinc-400 px-1 py-0.5 rounded font-mono font-semibold">
                              Context: {model.context_length ? `${Math.round(model.context_length / 1024)}k` : "Auto"}
                            </span>
                            {model.top_provider?.is_moderated && (
                              <span className="text-[9px] text-red-505 dark:text-red-400 font-bold">
                                Mod
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Pre-selection Info Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent selection trigger
                            setDetailedModel(model);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 shrink-0 transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                          title="Model Specifications Info"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Central Fixed Modal Overlay showing detailed specifications (Model Inspector Panel) */}
      {detailedModel && meta && (
        <div className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/65 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in select-text">
          <div 
            ref={modalRef}
            className="w-full max-w-md bg-white dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-700/70 rounded-3xl shadow-2xl dark:shadow-[0_28px_90px_rgba(0,0,0,0.56)] flex flex-col max-h-[85vh] sm:max-h-[600px] overflow-hidden text-left animate-scale-in"
          >
            {/* 1. STICKY HEADER */}
            <div className="px-6 py-4.5 border-b border-zinc-250/20 dark:border-zinc-900/50 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-20 flex items-start justify-between min-w-0">
              <div className="flex flex-col min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {detailedModel.label || detailedModel.name}
                  </span>
                  <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/40 dark:border-indigo-900/20 text-indigo-650 dark:text-indigo-400 font-extrabold px-1.5 py-0.5 rounded-lg select-none uppercase">
                    {meta.provider}
                  </span>
                </div>
                <span className="text-[9.5px] font-mono text-zinc-400 dark:text-zinc-550 truncate mt-1 select-all">
                  {detailedModel.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailedModel(null)}
                className="p-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 text-zinc-450 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 shrink-0 transition-all cursor-pointer"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 2. SCROLLABLE DETAILS AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scroll-smooth select-text relative">
              
              {/* SECTION: Overview */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest select-none">
                  Overview
                </h4>
                {detailedModel.description ? (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {detailedModel.description}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">
                    No model description provided by OpenRouter.
                  </p>
                )}
                
                {/* Release details tag */}
                <div className="flex items-center gap-2 pt-1 font-bold text-[10px] text-zinc-500 select-none">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/30 dark:border-zinc-850/30">
                    Family: {meta.family}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/30 dark:border-zinc-850/30">
                    Engine: {detailedModel.architecture && typeof detailedModel.architecture === "object"
                      ? ((detailedModel.architecture as any).instruct_type || (detailedModel.architecture as any).tokenizer || "Transformer")
                      : (detailedModel.architecture || "Transformer")}
                  </span>
                </div>
              </div>

              {/* SECTION: Capabilities Card */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest select-none">
                  Capabilities & Modalities
                </h4>
                
                <div className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/20 dark:border-zinc-850/20 rounded-2xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5 select-none">
                      <Compass className="h-3.8 w-3.8 text-indigo-500" />
                      Context Window
                    </span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200 font-mono text-[11.5px]">
                      {detailedModel.context_length.toLocaleString()} tokens
                    </span>
                  </div>

                  <div className="w-full border-t border-zinc-200/20 dark:border-zinc-900/40" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5 select-none">
                      <Cpu className="h-3.8 w-3.8 text-indigo-500" />
                      Input Modalities
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {meta.inputModalities}
                    </span>
                  </div>

                  <div className="w-full border-t border-zinc-200/20 dark:border-zinc-900/40" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5 select-none">
                      <Cpu className="h-3.8 w-3.8 text-indigo-500" />
                      Output Modalities
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {meta.outputModalities}
                    </span>
                  </div>

                  <div className="w-full border-t border-zinc-200/20 dark:border-zinc-900/40" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5 select-none">
                      <HelpCircle className="h-3.8 w-3.8 text-indigo-500" />
                      Tool / Function Calling
                    </span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {meta.toolCalling}
                    </span>
                  </div>

                  <div className="w-full border-t border-zinc-200/20 dark:border-zinc-900/40" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5 select-none">
                      <Sparkles className="h-3.8 w-3.8 text-indigo-500" />
                      Reasoning Tier
                    </span>
                    <span className="font-semibold text-zinc-805 dark:text-zinc-200">
                      {meta.reasoning}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Performance & Latency */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest select-none">
                  Performance & Latency
                </h4>
                
                <div className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/20 dark:border-zinc-850/20 rounded-2xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-550 flex items-center gap-1.5 select-none">
                      <Zap className="h-3.8 w-3.8 text-indigo-500" />
                      Response Speed
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {meta.latency}
                    </span>
                  </div>

                  <div className="w-full border-t border-zinc-200/20 dark:border-zinc-900/40" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-550 flex items-center gap-1.5 select-none">
                      <Activity className="h-3.8 w-3.8 text-indigo-500" />
                      Streaming Support
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      Live Streams (SSE)
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Pricing & Free status */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest select-none">
                  Pricing Rate
                </h4>
                
                <div className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/20 dark:border-zinc-850/20 rounded-2xl p-4.5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-550 flex items-center gap-1.5 select-none">
                      <DollarSign className="h-3.8 w-3.8 text-indigo-500" />
                      Prompt Cost
                    </span>
                    <span className={cn(
                      "font-mono font-extrabold text-xs",
                      Number(detailedModel.pricing.prompt) === 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-zinc-800 dark:text-zinc-200"
                    )}>
                      {Number(detailedModel.pricing.prompt) === 0
                        ? "Free"
                        : `$${Number(detailedModel.pricing.prompt).toFixed(2)} / 1M tokens`}
                    </span>
                  </div>

                  <div className="w-full border-t border-zinc-200/20 dark:border-zinc-900/40" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-450 dark:text-zinc-550 flex items-center gap-1.5 select-none">
                      <DollarSign className="h-3.8 w-3.8 text-indigo-500" />
                      Completion Cost
                    </span>
                    <span className={cn(
                      "font-mono font-extrabold text-xs",
                      Number(detailedModel.pricing.completion) === 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-zinc-800 dark:text-zinc-200"
                    )}>
                      {Number(detailedModel.pricing.completion) === 0
                        ? "Free"
                        : `$${Number(detailedModel.pricing.completion).toFixed(2)} / 1M tokens`}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION: Strengths & Best Use cases */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest select-none">
                  Use Cases & Analysis
                </h4>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="flex flex-col space-y-1">
                    <span className="font-extrabold text-zinc-900 dark:text-white">Best for:</span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">{meta.bestUseCases}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="font-extrabold text-zinc-900 dark:text-white">Strengths:</span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">{meta.strengths}</span>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <span className="font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-zinc-400" />
                      Limitations:
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-500 font-medium">{meta.limitations}</span>
                  </div>
                </div>
              </div>

              {/* Spacing bottom pad for clean scroll fade cue */}
              <div className="h-4 w-full" />
            </div>

            {/* 3. STICKY OPERATIONAL FOOTER */}
            <div className="px-6 py-4.5 border-t border-zinc-250/20 dark:border-zinc-900/50 sticky bottom-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-20 flex items-center justify-between text-[9px] font-bold text-zinc-450 dark:text-zinc-550 select-none">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                {detailedModel.top_provider?.is_moderated 
                  ? "Operational & Moderated" 
                  : "Operational & Standard"}
              </span>
              <span>API v1</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
