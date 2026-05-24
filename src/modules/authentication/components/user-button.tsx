"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Sun, 
  Moon, 
  Laptop,
  Loader2,
  Lock,
  Mail,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserButtonProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

export default function UserButton({ user }: UserButtonProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  // Fetch session on client-side if no pre-fetched user prop is passed
  const { data: session, isPending } = authClient.useSession();
  
  const activeUser = user || session?.user;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setLoading(false);
            router.push("/sign-in");
            router.refresh();
          },
          onError: () => {
            setLoading(false);
          }
        },
      });
    } catch {
      setLoading(false);
    }
  };

  if (isPending && !user) {
    return (
      <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-400 dark:text-zinc-600" />
      </div>
    );
  }

  if (!activeUser) {
    return (
      <button
        onClick={() => router.push("/sign-in")}
        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md shadow-indigo-600/10 transition-all duration-150 active:scale-[0.98] cursor-pointer"
      >
        <Lock className="h-3.5 w-3.5" />
        Sign in
      </button>
    );
  }

  const name = activeUser.name || "User";
  const email = activeUser.email || "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative group rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 cursor-pointer">
            <Avatar className="h-8 w-8 transition-transform group-hover:scale-[1.02] border border-zinc-200 dark:border-zinc-800">
              {activeUser.image && (
                <AvatarImage 
                  src={activeUser.image} 
                  alt={name} 
                  className="object-cover"
                />
              )}
              <AvatarFallback className="font-semibold text-xs text-zinc-650 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-56 p-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg"
      >
        {/* User Info Label */}
        <DropdownMenuLabel className="px-2.5 py-2.5">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-none">
              {name}
            </p>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 font-medium leading-none truncate">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800/80 my-1" />

        {/* Dropdown Items Group */}
        <DropdownMenuGroup className="space-y-0.5">
          <DropdownMenuItem
            onSelect={() => setProfileOpen(true)}
            className="rounded-lg px-2.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
          >
            <UserIcon className="mr-2 h-4 w-4 text-zinc-450 dark:text-zinc-500" />
            Profile settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setWorkspaceOpen(true)}
            className="rounded-lg px-2.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4 text-zinc-450 dark:text-zinc-500" />
            Workspace settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800/80 my-1" />

        {/* Theme Switcher Group */}
        <DropdownMenuLabel className="px-2.5 py-1.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Appearance
        </DropdownMenuLabel>
        
        <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-850/60">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-md border text-[10px] font-semibold gap-1 transition-all duration-150 cursor-pointer",
              theme === "light"
                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "border-transparent text-zinc-650 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
            title="Light Mode"
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>
          
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-md border text-[10px] font-semibold gap-1 transition-all duration-150 cursor-pointer",
              theme === "dark"
                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "border-transparent text-zinc-650 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
            title="Dark Mode"
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>
          
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "flex flex-col items-center justify-center py-1.5 rounded-md border text-[10px] font-semibold gap-1 transition-all duration-150 cursor-pointer",
              theme === "system"
                ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "border-transparent text-zinc-650 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
            title="System Preference"
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Sys</span>
          </button>
        </div>

        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800/80 my-1" />

        {/* Logout Item */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
          variant="destructive"
          className="rounded-lg px-2.5 py-2 text-red-650 dark:text-red-400 font-bold focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Sign out
        </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-zinc-200/70 px-5 py-4 text-left dark:border-zinc-800/70">
            <DialogTitle className="text-base font-bold tracking-tight">
              Profile Settings
            </DialogTitle>
            <DialogDescription>
              Your Nova account identity for this workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-5">
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800/70 dark:bg-zinc-950/45">
              <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800">
                {activeUser.image && <AvatarImage src={activeUser.image} alt={name} />}
                <AvatarFallback className="font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {name}
                </p>
                <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-500">
                  {email}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800/70">
              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                <Mail className="h-4 w-4 text-indigo-500" />
                <span className="font-semibold">Email managed by your sign-in provider</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-zinc-200/70 px-5 py-4 text-left dark:border-zinc-800/70">
            <DialogTitle className="text-base font-bold tracking-tight">
              Workspace Settings
            </DialogTitle>
            <DialogDescription>
              Preferences for this Nova Chat workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-4 dark:border-zinc-800/70 dark:bg-zinc-950/45">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Appearance
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
                Use the theme controls in this menu to switch between light, dark, and system mode.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-zinc-200/70 p-4 dark:border-zinc-800/70">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Workspace session active
                </p>
                <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-500">
                  Chats and model choices stay scoped to your signed-in account.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
