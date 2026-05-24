import React from "react";
import { requireAuth } from "@/modules/authentication/actions";
import ChatSidebar from "@/modules/chat/components/chat-sidebar";
import UserButton from "@/modules/authentication/components/user-button";
import { getChats } from "@/modules/chat/actions";
import ChatTopbarActions from "@/modules/chat/components/chat-topbar-actions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce authentication on all routes under this group
  const user = await requireAuth();
  const chatsResult = await getChats();
  const chats = chatsResult.success ? chatsResult.chats : [];

  return (
    <div className="flex h-screen w-full bg-zinc-50 text-zinc-950 dark:bg-[oklch(0.095_0.006_250)] dark:text-zinc-50 overflow-hidden font-sans">
      
      {/* 1. Left Sidebar Navigation - Desktop only */}
      <div className="hidden md:block md:w-64 shrink-0 h-full">
        <ChatSidebar user={user} initialChats={chats} />
      </div>

      {/* 2. Main content container */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        
        {/* Mobile Header - Top Nav */}
        <header className="md:hidden h-16 w-full px-6 flex items-center justify-between border-b border-zinc-150 bg-white dark:border-zinc-800/70 dark:bg-[oklch(0.13_0.007_250/0.96)] relative z-25">
          <div className="flex items-center gap-3">
            <div className="h-8.5 w-8.5 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-600/10">
              <span className="text-white font-extrabold text-sm tracking-wider">N</span>
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white">
              Nova
            </span>
          </div>

          <div className="flex items-center gap-3">
            <UserButton user={user} />
          </div>
        </header>

        {/* Sub-header / Path indicators (Desktop) */}
        <div className="hidden md:flex h-16 w-full px-8 items-center justify-between border-b border-zinc-150 bg-white/95 dark:border-zinc-800/70 dark:bg-[oklch(0.13_0.007_250/0.94)] relative z-20 backdrop-blur-xl shadow-sm dark:shadow-[0_1px_0_rgba(255,255,255,0.025),0_12px_34px_rgba(0,0,0,0.22)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-500">
            <span>Workspace</span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="text-zinc-900 dark:text-zinc-100">Chat</span>
          </div>

          <ChatTopbarActions />
        </div>

        {/* Render child elements */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          {children}
        </main>
      </div>

    </div>
  );
}
