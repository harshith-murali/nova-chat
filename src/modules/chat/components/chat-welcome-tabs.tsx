"use client";

import React, { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export interface WelcomePromptItem {
  id: string;
  title: string;
  prompt: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface WelcomeCategory {
  id: string;
  label: string;
  items: WelcomePromptItem[];
}

export interface ChatWelcomeTabsProps {
  data: WelcomeCategory[];
  onSelectPrompt: (prompt: string) => void;
  title?: string;
  subtitle?: string;
}

export default function ChatWelcomeTabs({
  data,
  onSelectPrompt,
  title = "Start a Conversation",
  subtitle = "Choose a category below and select a suggested prompt to kick off the thread instantly."
}: ChatWelcomeTabsProps) {
  const [activeTabId, setActiveTabId] = useState<string>(data[0]?.id || "");
  const triggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  // Keyboard navigation for accessibity compliance (Tabs Pattern WAI-ARIA)
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;
    const count = data.length;

    if (e.key === "ArrowRight") {
      newIndex = (index + 1) % count;
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      newIndex = (index - 1 + count) % count;
      e.preventDefault();
    } else if (e.key === "Home") {
      newIndex = 0;
      e.preventDefault();
    } else if (e.key === "End") {
      newIndex = count - 1;
      e.preventDefault();
    } else {
      return;
    }

    const targetTabId = data[newIndex].id;
    setActiveTabId(targetTabId);
    triggerRefs.current[targetTabId]?.focus();
  };

  const activeCategory = data.find((cat) => cat.id === activeTabId);

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 flex flex-col space-y-7 select-none font-sans">
      
      {/* Welcome Heading Header */}
      <div className="flex flex-col space-y-2 text-left shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-650 dark:text-indigo-400 tracking-widest uppercase">
          <Sparkles className="h-3 w-3 stroke-[2.2] text-indigo-500" />
          <span>Nova AI Assistant</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-550 leading-relaxed max-w-xl">
          {subtitle}
        </p>
      </div>

      {/* Accessible Tab List Trigger Container */}
      <div className="shrink-0 border-b border-zinc-200/40 dark:border-zinc-800/70 pb-2">
        <div 
          role="tablist" 
          aria-label="Prompt Suggestions Categories" 
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1"
        >
          {data.map((category, index) => {
            const isActive = category.id === activeTabId;
            return (
              <button
                key={category.id}
                ref={(el) => {
                  triggerRefs.current[category.id] = el;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${category.id}`}
                id={`tab-${category.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(category.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={cn(
                  "px-3.5 py-1.8 text-xs font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 whitespace-nowrap cursor-pointer",
                  isActive
                    ? "text-indigo-650 dark:text-indigo-300 bg-white dark:bg-zinc-900/75 shadow-sm border border-zinc-200/60 dark:border-zinc-700/70 font-extrabold"
                    : "text-zinc-500 dark:text-zinc-500 hover:bg-zinc-150/40 dark:hover:bg-zinc-900/55 hover:text-zinc-900 dark:hover:text-zinc-250 font-semibold"
                )}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {data.map((category) => {
        const isActive = category.id === activeTabId;
        if (!isActive) return null;

        return (
          <div
            key={category.id}
            id={`panel-${category.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${category.id}`}
            tabIndex={0}
            className="flex-1 focus:outline-none rounded-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="w-full flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900/45 border border-zinc-200/60 dark:border-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/75 text-left transition-all duration-250 shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_16px_38px_rgba(0,0,0,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] group focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {item.icon && (
                    <div className="h-7.5 w-7.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-850/50 flex items-center justify-center text-zinc-500 dark:text-zinc-500 shrink-0 shadow-sm group-hover:text-indigo-650 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-950/20 group-hover:border-indigo-100/30 dark:group-hover:border-indigo-900/30 transition-all duration-250">
                      {item.icon}
                    </div>
                  )}
                  <div className="flex flex-col space-y-1 min-w-0">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium">
                        {item.description}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

    </div>
  );
}
