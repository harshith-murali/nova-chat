import React, { Suspense } from "react";
import SignInForm from "@/components/auth/SignInForm";
import { MessageSquare, Sparkles, Shield, Zap, Loader2 } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Left side: Premium Branding & Mockup Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-zinc-900 dark:bg-black text-white border-r border-zinc-800/40 overflow-hidden">
        {/* Background grids and glowing elements */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(#334155 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div
          className="absolute -top-40 -left-40 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] pointer-events-none"
          style={{ height: 600, width: 600 }}
        ></div>
        <div
          className="absolute -bottom-40 -right-40 rounded-full bg-violet-500/10 dark:bg-violet-500/15 blur-[120px] pointer-events-none"
          style={{ height: 600, width: 600 }}
        ></div>

        {/* Top header: Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-white font-semibold text-base tracking-wider">
              N
            </span>
          </div>
          <span className="font-semibold text-xl tracking-tight">Nova</span>
        </div>

        {/* Center: Premium Glassmorphic Chat Mockup */}
        <div className="relative z-10 flex flex-col justify-center flex-1 max-w-lg mx-auto w-full my-8">
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              Introducing Nova Chat 2.0
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-100">
              The intelligent space where your teams connect.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Experience absolute speed, stunning design, and robust security in
              one modern workspace.
            </p>
          </div>

          {/* Interactive CSS Mockup of Chat Client */}
          <div className="relative bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:scale-[1.01] hover:border-zinc-700/60 group">
            {/* Window controls */}
            <div className="flex items-center gap-1.5 mb-5 pb-3 border-b border-zinc-900">
              <span className="h-3 w-3 rounded-full bg-zinc-800 group-hover:bg-red-500/70 transition-colors duration-300"></span>
              <span className="h-3 w-3 rounded-full bg-zinc-800 group-hover:bg-yellow-500/70 transition-colors duration-300"></span>
              <span className="h-3 w-3 rounded-full bg-zinc-800 group-hover:bg-green-500/70 transition-colors duration-300"></span>
              <span className="ml-2 text-xs font-medium text-zinc-600">
                nova-chat-workspace
              </span>
            </div>

            {/* Mock messages */}
            <div className="space-y-4">
              {/* Message 1 */}
              <div className="flex gap-3.5 items-start">
                <div className="h-8.5 w-8.5 rounded-full bg-linear-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-xs shadow-md">
                  JD
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-200">
                      Jane Doe
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      10:24 AM
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 rounded-2xl rounded-tl-none p-3 border border-zinc-800/50 text-xs leading-relaxed text-zinc-300 max-w-[85%]">
                    Hey team! I just shipped the new onboarding layout. The
                    animations feel incredibly fluid now. 🚀
                  </div>
                </div>
              </div>

              {/* Message 2 */}
              <div className="flex gap-3.5 items-start">
                <div className="h-8.5 w-8.5 rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-xs shadow-md">
                  AH
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-200">
                      Alex Harris
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      10:25 AM
                    </span>
                  </div>
                  <div className="bg-indigo-600 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed text-zinc-50 max-w-[85%] shadow-md shadow-indigo-600/10">
                    Wow, outstanding work! Let's schedule the production rollout
                    for 2:00 PM today.
                  </div>
                </div>
              </div>

              {/* Typing indicator */}
              <div className="flex gap-3.5 items-center pl-12 text-[10px] font-semibold text-indigo-400">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Sarah is typing...
              </div>
            </div>
          </div>

          {/* Quick value badges */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/35 border border-zinc-850/40">
              <Zap className="h-4.5 w-4.5 text-indigo-450 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">Speed</p>
                <p className="text-[10px] text-zinc-500">Sub-millisecond</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/35 border border-zinc-850/40">
              <Shield className="h-4.5 w-4.5 text-emerald-450 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">Security</p>
                <p className="text-[10px] text-zinc-500">End-to-end</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/35 border border-zinc-850/40">
              <MessageSquare className="h-4.5 w-4.5 text-violet-450 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-200">Channels</p>
                <p className="text-[10px] text-zinc-500">Structured layout</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="space-y-2 border-l border-indigo-500 pl-4">
            <p className="text-sm italic leading-relaxed text-zinc-300">
              "The interface is gorgeous, and our team velocity increased by 40%
              in our first month."
            </p>
            <footer className="text-xs font-semibold text-zinc-400">
              — Sarah Jenkins, VP of Product
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right side: Auth Form container */}
      <div className="flex-1 flex flex-col justify-center items-center py-16 px-6 lg:px-12 relative bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
        {/* Glowing background elements for mobile layout */}
        <div
          className="lg:hidden absolute top-1/4 left-1/4 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none"
          style={{ height: 250, width: 250 }}
        ></div>
        <div
          className="lg:hidden absolute bottom-1/4 right-1/4 rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-3xl pointer-events-none"
          style={{ height: 250, width: 250 }}
        ></div>

        {/* Support URL parameters gracefully via Suspense */}
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
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
