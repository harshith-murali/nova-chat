"use client";

import React, { useRef } from "react";
import ModelSelector from "./model-selector";
import { AIModel } from "../hooks/use-ai-models";
import { Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  PromptInput, 
  PromptInputBody, 
  PromptInputTextarea, 
  PromptInputFooter, 
  PromptInputTools, 
  PromptInputSubmit 
} from "@/components/ai-elements/prompt-input";
import { 
  Attachments as AIAttachments, 
  Attachment as AIAttachment, 
  AttachmentPreview, 
  AttachmentInfo, 
  AttachmentRemove 
} from "@/components/ai-elements/attachments";

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface ChatMessageFormProps {
  inputValue: string;
  onChangeValue: (value: string) => void;
  onSubmit: () => void;
  isTyping: boolean;
  selectedModel: AIModel | null;
  onSelectModel: (model: AIModel) => void;
  attachments: Attachment[];
  onAddAttachments: (files: FileList) => void;
  onRemoveAttachment: (id: string) => void;
}

export default function ChatMessageForm({
  inputValue,
  onChangeValue,
  onSubmit,
  isTyping,
  selectedModel,
  onSelectModel,
  attachments,
  onAddAttachments,
  onRemoveAttachment,
}: ChatMessageFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddAttachments(e.target.files);
      e.target.value = ""; // Reset file picker value
    }
  };

  const handleSubmit = () => {
    onSubmit();
  };

  const isDisabled = (!inputValue.trim() && attachments.length === 0) || isTyping;

  // Map the local Attachment shape to what the shadcn AI Attachment expects:
  // It expects `filename`, `mediaType`, `type` and `url`.
  const mappedAttachments = attachments.map(att => ({
    id: att.id,
    filename: att.name,
    mediaType: att.type,
    type: "file" as const,
    url: att.url,
  }));

  return (
    <div className="max-w-2xl mx-auto w-full font-sans select-none px-4 sm:px-6 relative">
      {/* Hidden File Picker Input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        id="composer-file-picker"
        aria-label="Upload file attachments"
      />

      {/* Main Composer Box wrapped in shadcn AI PromptInput element */}
      <PromptInput 
        onSubmit={handleSubmit}
        className="relative flex flex-col bg-white/95 dark:bg-zinc-900/85 border border-zinc-200/70 dark:border-zinc-800/80 rounded-2xl shadow-lg dark:shadow-[0_22px_60px_rgba(0,0,0,0.38)] focus-within:border-zinc-350 dark:focus-within:border-zinc-700 focus-within:ring-4 focus-within:ring-indigo-500/5 dark:focus-within:ring-indigo-400/10 transition-all duration-200 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.035),0_22px_60px_rgba(0,0,0,0.38)]"
      >
        <PromptInputBody className="flex flex-col w-full">
          {/* Horizontal Uploaded Attachments Preview Bar using AIAttachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 py-2 border-b border-zinc-150/40 dark:border-zinc-850/30 shrink-0">
              <AIAttachments variant="inline" className="ml-0 w-full gap-2">
                {mappedAttachments.map((file) => (
                  <AIAttachment 
                    key={file.id} 
                    data={file} 
                    onRemove={() => onRemoveAttachment(file.id)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/20 dark:border-zinc-850/60 rounded-xl pr-2 shadow-sm font-sans"
                  >
                    <AttachmentPreview className="rounded-md object-cover bg-zinc-100 dark:bg-zinc-900" />
                    <AttachmentInfo className="font-bold text-zinc-700 dark:text-zinc-350 truncate leading-none text-[10px]" />
                    <AttachmentRemove className="hover:bg-red-50 hover:text-red-500 rounded p-0 text-zinc-400 dark:text-zinc-550 shrink-0 select-none cursor-pointer" />
                  </AIAttachment>
                ))}
              </AIAttachments>
            </div>
          )}

          {/* Composer Input Area using PromptInputTextarea */}
          <PromptInputTextarea
            value={inputValue}
            onChange={(e) => onChangeValue(e.target.value)}
            placeholder="Ask Nova AI anything..."
            className="flex-1 bg-transparent border-0 ring-0 focus:ring-0 text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none px-3.5 py-3 resize-none max-h-32 min-h-[42px] scrollbar-none font-medium leading-relaxed"
          />

          {/* Form Bottom Controls Row using PromptInputFooter & PromptInputTools */}
          <PromptInputFooter className="flex items-center justify-between px-2 pb-2 pt-1 shrink-0 bg-transparent border-0 w-full">
            <PromptInputTools className="flex items-center gap-2">
              <ModelSelector 
                selectedModelId={selectedModel?.id || ""} 
                onSelectModel={onSelectModel} 
              />

              {/* Paperclip File Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/70 bg-zinc-50 dark:bg-zinc-950/35 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850/85 transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                title="Add attachments"
                aria-label="Add attachments"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
            </PromptInputTools>

            {/* Submit button using PromptInputSubmit */}
            <PromptInputSubmit
              disabled={isDisabled}
              status={isTyping ? "streaming" : "ready"}
              className={cn(
                "h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all duration-150 shrink-0 shadow-sm cursor-pointer border border-zinc-200/20 dark:border-zinc-800/10",
                !isDisabled
                  ? "bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                  : "bg-zinc-100/50 dark:bg-zinc-900/40 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
              )}
            />
          </PromptInputFooter>
        </PromptInputBody>
      </PromptInput>

      <div className="text-[10px] font-bold text-center text-zinc-400 dark:text-zinc-650 mt-2 select-none">
        Nova AI can make mistakes. Consider checking important developer metrics.
      </div>
    </div>
  );
}
