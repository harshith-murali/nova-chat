"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  User, 
  MessageSquare,
  File,
  Info
} from "lucide-react";
import MessageViewForm from "../messages/message-view-form";
import { Message as AIMessage, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { 
  Attachments as AIAttachments, 
  Attachment as AIAttachment, 
  AttachmentPreview, 
  AttachmentInfo 
} from "@/components/ai-elements/attachments";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent
} from "@/components/ai-elements/reasoning";

// Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date;
  status?: "streaming" | "sent" | "error";
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
}

export interface ChatMessageViewProps {
  messages: Message[];
  isTyping?: boolean;
  userAvatar?: string | null;
  userNameInitials?: string;
  onEditMessage?: (messageId: string, content: string) => Promise<any>;
  onDeleteMessage?: (messageId: string) => Promise<any>;
}

// Format message timestamp in runtime-safe local format
const formatMessageTime = (date?: string | Date) => {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch (e) {
    return "";
  }
};

// Custom light-weight markdown formatting component for inline text parsing
const NormalText = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split("\n");

  const parseInlineFormatting = (line: string): React.ReactNode[] => {
    // Split by inline code: `code`
    const codeParts = line.split(/`/g);
    
    return codeParts.map((part, partIndex) => {
      // Odd indexes are inline code blocks
      if (partIndex % 2 === 1) {
        return (
          <code 
            key={partIndex} 
            className="px-1.5 py-0.5 bg-zinc-150/60 dark:bg-zinc-850/80 border border-zinc-200/40 dark:border-zinc-750/30 rounded font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold"
          >
            {part}
          </code>
        );
      }
      
      // Process bold and italic: **bold**, *italic*
      const segments: React.ReactNode[] = [];
      // Match **bold** first, then *italic*, then [text](url) links
      const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\))/g;
      let lastIndex = 0;
      let match;
      let segIndex = 0;
      
      while ((match = regex.exec(part)) !== null) {
        // Push text before this match
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        
        if (match[2]) {
          // **bold**
          segments.push(
            <strong key={`b-${partIndex}-${segIndex}`} className="font-extrabold text-zinc-950 dark:text-white">
              {match[2]}
            </strong>
          );
        } else if (match[3]) {
          // *italic*
          segments.push(
            <em key={`i-${partIndex}-${segIndex}`} className="italic text-zinc-700 dark:text-zinc-300">
              {match[3]}
            </em>
          );
        } else if (match[4] && match[5]) {
          // [text](url)
          segments.push(
            <a key={`a-${partIndex}-${segIndex}`} href={match[5]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              {match[4]}
            </a>
          );
        }
        
        lastIndex = match.index + match[0].length;
        segIndex++;
      }
      
      // Push remaining text
      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }
      
      return segments.length > 0 ? segments : [part];
    }).flat();
  };

  // Collect table rows for batch rendering
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // --- Heading support: # H1, ## H2, ### H3, #### H4 ---
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4 key={i} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-1.5 tracking-tight">
          {parseInlineFormatting(trimmed.slice(5))}
        </h4>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 mt-5 mb-2 tracking-tight">
          {parseInlineFormatting(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-extrabold text-zinc-950 dark:text-white mt-6 mb-2.5 tracking-tight border-b border-zinc-200/50 dark:border-zinc-800/50 pb-1.5">
          {parseInlineFormatting(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-lg font-extrabold text-zinc-950 dark:text-white mt-5 mb-3 tracking-tight">
          {parseInlineFormatting(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // --- Horizontal rule ---
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <hr key={i} className="my-4 border-zinc-200/60 dark:border-zinc-800/60" />
      );
      i++;
      continue;
    }

    // --- Blockquote ---
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="border-l-3 border-indigo-500/60 pl-4 py-1.5 my-3 text-zinc-600 dark:text-zinc-400 italic bg-indigo-50/30 dark:bg-indigo-500/5 rounded-r-lg">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="my-0.5">{parseInlineFormatting(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // --- Table detection (markdown pipe tables) ---
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableRows: string[][] = [];
      let hasHeader = false;
      
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const row = lines[i].trim();
        // Check if this is a separator row (e.g. | --- | --- |)
        if (/^\|[\s\-:]+\|/.test(row) && row.includes("---")) {
          hasHeader = true;
          i++;
          continue;
        }
        const cells = row.split("|").filter(Boolean).map(c => c.trim());
        tableRows.push(cells);
        i++;
      }

      if (tableRows.length > 0) {
        const headerRow = hasHeader ? tableRows[0] : null;
        const bodyRows = hasHeader ? tableRows.slice(1) : tableRows;
        
        elements.push(
          <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
            <table className="w-full text-xs text-left">
              {headerRow && (
                <thead>
                  <tr className="bg-zinc-100/70 dark:bg-zinc-900/60 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    {headerRow.map((cell, ci) => (
                      <th key={ci} className="px-3.5 py-2.5 font-bold text-zinc-900 dark:text-zinc-100 text-[11px] uppercase tracking-wider">
                        {parseInlineFormatting(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className={cn(
                    "border-b border-zinc-100/50 dark:border-zinc-850/50 transition-colors",
                    ri % 2 === 0 ? "bg-white dark:bg-zinc-950/20" : "bg-zinc-50/40 dark:bg-zinc-900/20"
                  )}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3.5 py-2 text-zinc-700 dark:text-zinc-300 text-[12px]">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // --- Bullet list (group consecutive items) ---
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* ") || lines[i].trim().startsWith("• "))) {
        listItems.push(lines[i].trim().replace(/^[-*•]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 my-2.5 space-y-1.5">
          {listItems.map((item, li) => (
            <li key={li} className="text-zinc-750 dark:text-zinc-300 text-sm leading-relaxed">
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // --- Numbered list (group consecutive items) ---
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      const startNum = parseInt(trimmed.match(/^(\d+)\./)![1]);
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 my-2.5 space-y-1.5" start={startNum}>
          {listItems.map((item, li) => (
            <li key={li} className="text-zinc-750 dark:text-zinc-300 text-sm leading-relaxed">
              {parseInlineFormatting(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // --- Blank line (paragraph spacing) ---
    if (trimmed === "") {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // --- Normal paragraph ---
    elements.push(
      <p key={i} className="my-1 text-sm text-zinc-850 dark:text-zinc-150 leading-relaxed select-text">
        {parseInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-0.5 text-zinc-850 dark:text-zinc-150 text-sm leading-relaxed tracking-normal select-text">
      {elements}
    </div>
  );
};

// Premium Custom Code Block Subcomponent
const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-zinc-950/98 dark:bg-zinc-950/50 border border-zinc-200/5 dark:border-zinc-850/50 rounded-xl my-4 overflow-hidden text-left shadow-md flex flex-col font-mono select-text">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 dark:bg-zinc-950/40 border-b border-zinc-800/60 text-zinc-400 text-[10px] font-bold tracking-wider uppercase select-none">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3 w-3 text-indigo-400/80" />
          <span>{language || "code"}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-[11px] text-zinc-200 leading-relaxed max-w-full font-mono bg-zinc-950/40 select-all">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Render full markdown message structure
const renderMarkdown = (text: string) => {
  if (!text) return null;

  const parts = text.split(/```/g);

  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const lines = part.split("\n");
      const language = lines[0].trim() || "code";
      const code = lines.slice(1).join("\n").replace(/\n$/, "");
      return <CodeBlock key={index} language={language} code={code} />;
    }
    return <NormalText key={index} text={part} />;
  });
};

// Empty Workspace Slate
export function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-auto space-y-5 select-none animate-fade-in">
      <div className="h-13 w-13 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-250/20 dark:border-zinc-850/50 flex items-center justify-center text-zinc-400 dark:text-zinc-550 shadow-sm">
        <Sparkles className="h-5 w-5 stroke-[1.8] text-indigo-605 dark:text-indigo-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
          Meet Nova AI Workspace
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-[280px] mx-auto">
          Start a new conversation thread using our model list. Nova is ready to help compile code, draft ideas, or solve complex challenges.
        </p>
      </div>
    </div>
  );
}

// Bouncing Typing Dots Card
export function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-3.5 my-4">
      {/* Bot Avatar Icon */}
      <div className="h-8 w-8 shrink-0 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-zinc-850/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm select-none">
        <Sparkles className="h-4 w-4 stroke-[2.2]" />
      </div>

      {/* Bouncing Dots Card */}
      <div className="bg-white/60 dark:bg-zinc-900/70 border border-zinc-150/40 dark:border-zinc-800/70 rounded-2xl rounded-tl-sm px-4.5 py-3.5 shadow-sm max-w-[150px] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_10px_30px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-1.5 py-1">
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

const parseReasoning = (content: string) => {
  if (!content) return { reasoning: null, cleanContent: "" };

  // 1. Matches <thought>...</thought> or <thinking>...</thinking>
  let match = content.match(/<(thought|thinking)>([\s\S]*?)<\/\1>/i);
  if (match) {
    const reasoning = match[2].trim();
    const cleanContent = content.replace(match[0], "").trim();
    return { reasoning, cleanContent };
  }

  // 2. Matches "Thinking Process:\n..."
  match = content.match(/(Thinking Process|Thinking):\n([\s\S]*?)(?=\n\n|$)/i);
  if (match) {
    const reasoning = match[2].trim();
    const cleanContent = content.replace(match[0], "").trim();
    return { reasoning, cleanContent };
  }

  return { reasoning: null, cleanContent: content };
};

// Individual Message Row
export function ChatMessageItem({ 
  message, 
  userAvatar, 
  userNameInitials,
  onEdit,
  onDelete
}: { 
  message: Message; 
  userAvatar?: string | null; 
  userNameInitials?: string;
  onEdit?: (messageId: string, content: string) => Promise<any>;
  onDelete?: (messageId: string) => Promise<any>;
}) {
  const isUser = message.role === "user";
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const { reasoning, cleanContent } = parseReasoning(message.content);

  return (
    <AIMessage from={message.role} className="w-full max-w-full">
      <div className={cn("flex w-full items-start gap-3.5", isUser ? "justify-end" : "justify-start")}>
        {/* Left Avatar for Assistant */}
        {!isUser && (
          <div className="h-8 w-8 shrink-0 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/30 dark:border-zinc-850/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm select-none">
            <Sparkles className="h-4 w-4 stroke-[2.2]" />
          </div>
        )}

        {/* Bubble with Text & Status details */}
        <div className={cn("flex flex-col max-w-[85%] sm:max-w-[75%] space-y-1.5", isUser ? "items-end" : "items-start")}>
          <div className="flex items-center gap-2 max-w-full">
            {isUser && onEdit && onDelete && (
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-150/40 dark:hover:bg-zinc-850/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer shrink-0"
                title="Inspect Message"
              >
                <Info className="h-4 w-4" />
              </button>
            )}

            <MessageContent
              className={cn(
                "rounded-2xl px-4.5 py-3 text-sm border leading-relaxed select-text break-words overflow-hidden max-w-full shadow-sm ml-0 group-[.is-user]:ml-0",
                isUser
                  ? "bg-zinc-200/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border-zinc-300/40 dark:border-zinc-700/70 rounded-tr-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  : "bg-white dark:bg-zinc-900/78 text-zinc-900 dark:text-zinc-100 border-zinc-200/65 dark:border-zinc-800/80 rounded-tl-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.01)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.028),0_12px_34px_rgba(0,0,0,0.22)]"
              )}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap select-text">{message.content}</p>
              ) : (
                <div className="flex flex-col w-full">
                  {reasoning && (
                    <Reasoning isStreaming={message.status === "streaming"}>
                      <ReasoningTrigger className="py-1 focus:outline-none focus:ring-0 select-none cursor-pointer" />
                      <ReasoningContent className="border-l border-zinc-200 dark:border-zinc-800 pl-3.5 my-2 italic text-zinc-500/90 leading-relaxed font-sans select-text">
                        {reasoning}
                      </ReasoningContent>
                    </Reasoning>
                  )}
                  {cleanContent && (
                    <MessageResponse
                      className="markdown-body select-text"
                      isAnimating={message.status === "streaming"}
                    >
                      {cleanContent}
                    </MessageResponse>
                  )}
                </div>
              )}
            </MessageContent>

            {!isUser && onEdit && onDelete && (
              <button
                onClick={() => setIsInspectorOpen(true)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-150/40 dark:hover:bg-zinc-850/30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer shrink-0"
                title="Inspect Response"
              >
                <Info className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Render Attachments using shadcn AIAttachments */}
          {message.attachments && message.attachments.length > 0 && (
            <AIAttachments variant="inline" className="mt-1.5 ml-0 max-w-full gap-2 justify-start select-none">
              {message.attachments.map((file) => {
                const mappedFile = {
                  id: file.id,
                  filename: file.name,
                  mediaType: file.type,
                  type: "file" as const,
                  url: file.url,
                };
                return (
                  <AIAttachment 
                    key={file.id} 
                    data={mappedFile} 
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-250/20 dark:border-zinc-850/60 rounded-xl pr-2 shadow-sm font-sans flex items-center gap-1.5 h-8"
                  >
                    <AttachmentPreview className="rounded object-cover bg-zinc-100 dark:bg-zinc-900 size-5" />
                    <AttachmentInfo className="font-bold text-zinc-700 dark:text-zinc-350 truncate leading-none text-[10px]" />
                  </AIAttachment>
                );
              })}
            </AIAttachments>
          )}

        {/* Time Stamp & Streaming State Tag */}
        {message.createdAt && (
          <span className="text-[10px] font-semibold text-zinc-400/80 dark:text-zinc-550 select-none px-1">
            {formatMessageTime(message.createdAt)}
            {message.status === "error" && (
              <span className="text-red-500 font-bold ml-1.5">• Error</span>
            )}
            {message.status === "streaming" && (
              <span className="text-indigo-500 font-bold ml-1.5 animate-pulse">• Streaming</span>
            )}
          </span>
        )}
      </div>

      {/* Right Avatar for User */}
      {isUser && (
        <div className="h-8 w-8 shrink-0 rounded-xl bg-zinc-200/80 dark:bg-zinc-800/60 border border-zinc-300/40 dark:border-zinc-700/30 flex items-center justify-center text-zinc-650 dark:text-zinc-400 shadow-sm select-none font-bold text-xs overflow-hidden">
          {userAvatar ? (
            <img src={userAvatar} alt="User profile" className="h-full w-full object-cover" />
          ) : userNameInitials ? (
            <span>{userNameInitials}</span>
          ) : (
            <User className="h-4 w-4 stroke-[2.2]" />
          )}
        </div>
      )}

      {/* Message Inspector Dialog Overlay */}
      {isInspectorOpen && onEdit && onDelete && (
        <MessageViewForm
          message={message}
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
      </div>
    </AIMessage>
  );
}

// Default Scrollable Thread view container
export default function ChatMessageView({ 
  messages, 
  isTyping, 
  userAvatar, 
  userNameInitials,
  onEditMessage,
  onDeleteMessage
}: ChatMessageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll behavior without page layout jank
  const scrollContainerToBottom = () => {
    const container = containerRef.current;
    if (!container) return;

    const lastMessage = messages[messages.length - 1];
    const isUserLast = lastMessage && lastMessage.role === "user";
    
    const threshold = 150; // pixels
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;

    if (isUserLast || isAtBottom || isTyping) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollContainerToBottom();
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex flex-col bg-background text-foreground">
        <EmptyChatState />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 scrollbar-thin flex flex-col bg-transparent text-foreground focus:outline-none"
      tabIndex={0}
      aria-label="Chat messages history list"
    >
      {/* Messages Feed */}
      {messages.map((message) => (
        <ChatMessageItem 
          key={message.id} 
          message={message} 
          userAvatar={userAvatar}
          userNameInitials={userNameInitials}
          onEdit={onEditMessage}
          onDelete={onDeleteMessage}
        />
      ))}

      {/* Loading state indicator — only show dots while waiting for first chunk */}
      {isTyping && <ChatTypingIndicator />}

      {/* Spacer padding at the bottom so the last message is never cut off or cramped against inputs */}
      <div className="h-10 shrink-0 w-full" />
    </div>
  );
}
