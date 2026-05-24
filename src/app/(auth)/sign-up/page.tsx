import React, { Suspense } from "react";
import { Loader2, MessageSquare, Shield, Sparkles, Zap } from "lucide-react";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-zinc-50 font-sans dark:bg-zinc-950 lg:flex-row">
      <div className="relative hidden overflow-hidden border-r border-zinc-800/40 bg-zinc-900 p-12 text-white dark:bg-black lg:flex lg:w-1/2 lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="pointer-events-none absolute -left-40 -top-40 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/20"
          style={{ height: 600, width: 600 }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/15"
          style={{ height: 600, width: 600 }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/25">
            <span className="text-base font-semibold tracking-wider text-white">
              N
            </span>
          </div>
          <span className="text-xl font-semibold tracking-tight">Nova</span>
        </div>

        <div className="relative z-10 mx-auto my-8 flex w-full max-w-lg flex-1 flex-col justify-center">
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Personal AI workspace
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-100">
              Build a searchable memory for every AI conversation.
            </h2>
            <p className="text-base leading-relaxed text-zinc-400">
              Create an account to save threads, switch models, and keep your
              work ready whenever you return.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-1.5 border-b border-zinc-900 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-500/70" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <span className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs font-medium text-zinc-600">
                nova-chat-onboarding
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl rounded-tl-none border border-zinc-800/50 bg-zinc-900/80 p-3 text-xs leading-relaxed text-zinc-300">
                Save this thread and compare the answer against Claude Sonnet
                and OpenRouter free models.
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-none bg-indigo-600 p-3 text-xs leading-relaxed text-zinc-50 shadow-md shadow-indigo-600/10">
                Account created. Your workspace, chats, and model preferences
                are ready.
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-850/40 bg-zinc-900/35 p-3">
              <Zap className="h-4.5 w-4.5 shrink-0 text-indigo-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">Fast</p>
                <p className="text-[10px] text-zinc-500">Streaming chat</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-850/40 bg-zinc-900/35 p-3">
              <Shield className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">Private</p>
                <p className="text-[10px] text-zinc-500">User-owned chats</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-zinc-850/40 bg-zinc-900/35 p-3">
              <MessageSquare className="h-4.5 w-4.5 shrink-0 text-violet-400" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">Saved</p>
                <p className="text-[10px] text-zinc-500">Thread history</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto bg-zinc-50 px-6 py-16 dark:bg-zinc-950 lg:px-12">
        <Suspense
          fallback={
            <div
              className="flex flex-col items-center justify-center"
              style={{ minHeight: 300 }}
            >
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
