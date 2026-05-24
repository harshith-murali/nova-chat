"use client";

import {
  Bell,
  CheckCircle2,
  Monitor,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ChatTopbarActions() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="relative border-zinc-200/70 bg-white/80 text-zinc-500 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700/70 dark:bg-zinc-900/75 dark:text-zinc-400 dark:shadow-black/25 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/85 dark:hover:text-zinc-100"
            aria-label="Open notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-zinc-900" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" sideOffset={10} className="w-80 gap-0 p-0">
          <PopoverHeader className="gap-1 border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70">
            <PopoverTitle className="text-sm font-bold tracking-tight">
              Notifications
            </PopoverTitle>
            <PopoverDescription className="text-xs">
              Workspace updates and model events will appear here.
            </PopoverDescription>
          </PopoverHeader>
          <div className="p-4">
            <div className="flex items-start gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3 dark:border-zinc-800/70 dark:bg-zinc-950/45">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-200/50 bg-indigo-50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  You are all caught up
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
                  No unread alerts for this workspace.
                </p>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="border-zinc-200/70 bg-white/80 text-zinc-500 shadow-sm hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700/70 dark:bg-zinc-900/75 dark:text-zinc-400 dark:shadow-black/25 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/85 dark:hover:text-zinc-100"
            aria-label="Open settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-zinc-200/70 px-5 py-4 text-left dark:border-zinc-800/70">
            <DialogTitle className="text-base font-bold tracking-tight">
              Workspace Settings
            </DialogTitle>
            <DialogDescription>
              Lightweight preferences for this Nova workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800/70 dark:bg-zinc-950/45">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Nova Assistant
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
                    Model selection is stored locally and restored when you return.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "System", icon: Monitor },
                { label: "Light", icon: Sun },
                { label: "Dark", icon: Moon },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setTheme(item.label.toLowerCase())}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30",
                    theme === item.label.toLowerCase()
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-zinc-200/70 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800/70 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-850/80",
                  )}
                  aria-pressed={theme === item.label.toLowerCase()}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800/70">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Secure workspace session
                </p>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Account settings remain available from the profile menu.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
