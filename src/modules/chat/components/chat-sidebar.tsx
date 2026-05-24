"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import UserButton from "@/modules/authentication/components/user-button";
import { useChats, useRenameChat, useTogglePinChat, useToggleArchiveChat, useDeleteChat } from "@/hooks/use-chats";
import { isToday, isYesterday, subDays, isAfter } from "date-fns";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Sparkles,
  PanelLeft,
  MoreHorizontal,
  Share2,
  Pencil,
  Pin,
  Archive,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  initialChats?: {
    id: string;
    title: string;
    updatedAt: Date | string;
    isPinned: boolean;
    isArchived: boolean;
  }[];
}

// Group chats by calendar date dynamically
const groupChatsByDate = (chats: any[]) => {
  const groups: { [key: string]: any[] } = {
    "Today": [],
    "Yesterday": [],
    "Last Week": [],
    "Older": []
  };

  const now = new Date();
  const sevenDaysAgo = subDays(now, 7);

  chats.forEach(chat => {
    const date = new Date(chat.updatedAt);
    if (isToday(date)) {
      groups["Today"].push(chat);
    } else if (isYesterday(date)) {
      groups["Yesterday"].push(chat);
    } else if (isAfter(date, sevenDaysAgo)) {
      groups["Last Week"].push(chat);
    } else {
      groups["Older"].push(chat);
    }
  });

  return groups;
};

export default function ChatSidebar({ user, initialChats = [] }: ChatSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingTitle, setRenamingTitle] = useState("");

  const { chats: queryChats } = useChats();
  const chats = queryChats.length > 0 ? queryChats : initialChats;

  const { renameChat } = useRenameChat();
  const { togglePin } = useTogglePinChat();
  const { toggleArchive } = useToggleArchiveChat();
  const { deleteChat } = useDeleteChat();

  const currentChatId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  const handleActiveThread = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleStartRename = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenamingTitle(title);
    setActiveMenuId(null);
  };

  const handleSaveRename = async (id: string) => {
    if (renamingTitle.trim()) {
      await renameChat({ chatId: id, title: renamingTitle.trim() });
    }
    setRenamingId(null);
  };

  // Filter threads by search query
  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedChats = groupChatsByDate(filteredChats);
  const categories = ["Today", "Yesterday", "Last Week", "Older"];

  const name = user?.name || "User";

  return (
    <aside className="w-full h-full flex flex-col bg-zinc-50/75 dark:bg-[oklch(0.11_0.006_250)] backdrop-blur-xl border-r border-zinc-200/60 dark:border-zinc-800/70 overflow-hidden font-sans shadow-[inset_-1px_0_0_rgba(255,255,255,0.45)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.025)]">
      
      {/* 1. Header with custom Nova Chat Branding & Glassy Icons */}
      <div className="h-16 px-5 flex items-center justify-between shrink-0">
        <button className="p-1.5 rounded-xl text-zinc-500 dark:text-zinc-500 hover:bg-zinc-150/60 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25 cursor-pointer">
          <PanelLeft className="h-4.5 w-4.5" />
        </button>

        <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-90 transition-opacity select-none cursor-pointer">
          Nova Chat
        </span>

        <button className="p-1.5 rounded-xl text-zinc-550 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/25 cursor-pointer">
          <Sparkles className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* 2. Glass-accented Indigo "New Chat" Button */}
      <div className="px-4 py-2 shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500/90 dark:hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs tracking-wide shadow-md shadow-indigo-600/10 dark:shadow-[0_10px_24px_rgba(79,70,229,0.16)] flex items-center justify-center gap-2 border border-indigo-700/10 dark:border-indigo-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/35 transition-all duration-200 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[3]" />
          New Chat
        </button>
      </div>

      {/* 3. Thread Search Bar with Glass background */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-450 dark:text-zinc-650 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search your threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white/70 dark:bg-zinc-950/35 border border-zinc-200/70 dark:border-zinc-800/70 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 dark:focus:border-indigo-400/40 focus:ring-4 focus:ring-indigo-500/5 dark:focus:ring-indigo-500/10 transition-all duration-200 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="px-4 shrink-0">
        <div className="w-full border-t border-zinc-200/50 dark:border-zinc-800/60"></div>
      </div>

      {/* 4. Grouped Threads List with Premium Glass Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
        {categories.map(category => {
          const categoryThreads = groupedChats[category];
          if (!categoryThreads || categoryThreads.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <p className="px-2.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest select-none">
                {category}
              </p>
              
              <div className="space-y-1">
                {categoryThreads.map(thread => {
                  const isActive = thread.id === currentChatId;
                  const isRenaming = thread.id === renamingId;
                  const isMenuOpen = thread.id === activeMenuId;

                  return (
                    <div 
                      key={thread.id} 
                      className="group relative flex items-center w-full"
                    >
                      {isRenaming ? (
                        <div className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                          <input
                            type="text"
                            value={renamingTitle}
                            onChange={(e) => setRenamingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(thread.id);
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-900 dark:text-zinc-200 px-1 py-0.5 font-medium"
                            autoFocus
                            onBlur={() => handleSaveRename(thread.id)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => handleActiveThread(thread.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-3 rounded-2xl text-xs border text-left transition-all duration-150 active:scale-[0.99] cursor-pointer relative pr-10",
                            isActive
                              ? "bg-white dark:bg-zinc-900/75 border-zinc-200/80 dark:border-zinc-700/70 text-indigo-650 dark:text-indigo-300 font-bold shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.22)] before:absolute before:left-0 before:top-3.5 before:h-4 before:w-0.8 before:rounded-r-md before:bg-indigo-600 dark:before:bg-indigo-400"
                              : "border-transparent text-zinc-650 dark:text-zinc-500 hover:bg-zinc-150/50 dark:hover:bg-zinc-900/45 hover:text-zinc-900 dark:hover:text-zinc-200"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pl-1">
                            <MessageSquare className={cn("h-4 w-4 shrink-0 stroke-[2.2]", isActive ? "text-indigo-650 dark:text-indigo-400" : "text-zinc-450 dark:text-zinc-550")} />
                            <span className="truncate pr-1">{thread.title}</span>
                            {thread.isPinned && (
                              <Pin className="h-3 w-3 text-indigo-500 shrink-0 rotate-45 fill-indigo-500" />
                            )}
                          </div>
                        </button>
                      )}

                      {/* Dropdown Options Trigger (Hover state) */}
                      {!isRenaming && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : thread.id);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-905 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer z-30"
                          title="Thread Options"
                        >
                          <MoreHorizontal className="h-3.8 w-3.8" />
                        </button>
                      )}

                      {/* Dropdown Options List Dialog Overlay */}
                      {isMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40 cursor-default" 
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-3 top-[80%] mt-1 w-44 bg-white dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-700/70 rounded-xl shadow-xl dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)] z-50 p-1 flex flex-col backdrop-blur-md animate-scale-in">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${window.location.origin}/chat/${thread.id}`);
                                toast.success("Conversation link copied!");
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-zinc-750 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                            >
                              <Share2 className="h-3.8 w-3.8 text-zinc-450 dark:text-zinc-550" />
                              Share
                            </button>

                            <button
                              onClick={(e) => handleStartRename(e, thread.id, thread.title)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-zinc-750 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                            >
                              <Pencil className="h-3.8 w-3.8 text-zinc-450 dark:text-zinc-550" />
                              Rename
                            </button>

                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await togglePin(thread.id);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-zinc-750 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                            >
                              <Pin className={cn("h-3.8 w-3.8", thread.isPinned ? "text-indigo-500 fill-indigo-500" : "text-zinc-450 dark:text-zinc-550")} />
                              {thread.isPinned ? "Unpin chat" : "Pin chat"}
                            </button>

                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await toggleArchive(thread.id);
                                setActiveMenuId(null);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-zinc-750 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-850 cursor-pointer"
                            >
                              <Archive className="h-3.8 w-3.8 text-zinc-450 dark:text-zinc-550" />
                              Archive
                            </button>

                            <div className="h-px bg-zinc-100 dark:bg-zinc-850/60 my-1" />

                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await deleteChat(thread.id);
                                setActiveMenuId(null);
                                router.push("/chat");
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-955/20 cursor-pointer font-semibold"
                            >
                              <Trash2 className="h-3.8 w-3.8 text-red-500" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Footer user panel */}
      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/70 bg-zinc-50/80 dark:bg-zinc-950/35 backdrop-blur-xl flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserButton user={user} />
          
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-zinc-900 dark:text-white truncate leading-none">
              {name}
            </span>
            <span className="text-[9px] text-zinc-455 dark:text-zinc-550 truncate leading-none mt-1.5 flex items-center font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1 shrink-0 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>

        <div className="h-8 w-8 shrink-0 rounded-xl border border-zinc-200/60 bg-white/70 text-indigo-600 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-900/60 dark:text-indigo-300 flex items-center justify-center">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>

    </aside>
  );
}
