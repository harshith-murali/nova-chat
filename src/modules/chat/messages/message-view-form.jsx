"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  User, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MessageViewForm({ 
  message, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  isDeleting = false 
}) {
  const [content, setContent] = useState(message?.content || "");
  const [isCopied, setIsCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !message || typeof document === "undefined") return null;

  const isUser = message.role === "user";
  const charCount = message.content?.length || 0;
  const wordCount = message.content?.split(/\s+/).filter(Boolean).length || 0;
  const createdDate = message.createdAt ? new Date(message.createdAt) : new Date();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim() || content.trim() === message.content) return;
    
    setIsSaving(true);
    try {
      await onEdit(message.id, content.trim());
      onClose();
    } catch (err) {
      console.error("Error editing message", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(message.id);
      onClose();
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/45 dark:bg-black/70 backdrop-blur-md animate-fade-in select-none font-sans">
      {/* Background click dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main dialog wrapper */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[min(760px,calc(100vh-48px))] overflow-hidden animate-scale-in text-zinc-900 dark:text-zinc-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm shrink-0",
              isUser 
                ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300" 
                : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400"
            )}>
              {isUser ? <User className="h-4.5 w-4.5 stroke-[2.2]" /> : <Sparkles className="h-4.5 w-4.5 stroke-[2.2]" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-normal text-zinc-950 dark:text-white">Message Inspector</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-semibold uppercase mt-0.5">
                {isUser ? "User Message" : "Assistant Response"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close message inspector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/55 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">Words</span>
              <span className="text-2xl font-semibold tracking-normal">{wordCount}</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/55 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">Characters</span>
              <span className="text-2xl font-semibold tracking-normal">{charCount}</span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/55 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</span>
              <span className="text-sm font-semibold leading-tight mt-1">
                {createdDate.toLocaleDateString([], { month: "short", day: "numeric" })}
              </span>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/55 border border-zinc-200/80 dark:border-zinc-800 rounded-xl flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</span>
              <span className="text-sm font-semibold leading-tight mt-1">
                {createdDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Form field for edit (User only) or view only (Assistant) */}
          <form onSubmit={handleSave} className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="message-inspector-content" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Raw Content
              </label>
              
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            {isUser ? (
              <div className="relative">
                <textarea
                  id="message-inspector-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[220px] p-4 text-sm font-medium rounded-xl border border-zinc-200 focus:border-indigo-500/80 dark:border-zinc-800 dark:focus:border-indigo-500/50 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none leading-relaxed select-text resize-y"
                  placeholder="Enter message content..."
                />
                
                {/* Save button visible only when changed */}
                {content.trim() !== message.content && content.trim() !== "" && (
                  <div className="flex justify-end mt-2.5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                id="message-inspector-content"
                className="w-full max-h-[min(360px,42vh)] overflow-y-auto p-4 text-sm rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 leading-7 font-mono whitespace-pre-wrap select-text scrollbar-thin"
              >
                {message.content}
              </div>
            )}
          </form>

          {/* Attachments Section */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                Attachments ({message.attachments.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {message.attachments.map((file) => (
                  <div 
                    key={file.id} 
                    className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-sm text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate leading-none">
                          {file.name}
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-1 uppercase">
                          {Math.round(file.size / 1024)} KB
                        </span>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      className="p-1.5 rounded-lg text-zinc-450 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all shrink-0 cursor-pointer"
                      title="Download attachment"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete controls */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-5 mt-1">
            {!showDeleteConfirm ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/60 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded-xl">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-white dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <Trash2 className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">
                      Delete Message
                  </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium leading-relaxed">
                      Permanently remove this message from the conversation.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-xs font-semibold text-red-700 hover:bg-white dark:text-red-400 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg transition-all cursor-pointer shrink-0"
                >
                  Delete Message
                </button>
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl flex flex-col gap-3 animate-fade-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 leading-tight">Delete this message?</h4>
                    <p className="text-xs text-red-700 dark:text-red-300/80 mt-1 leading-relaxed font-medium">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>,
    document.body,
  );
}
