"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock,
  ArrowRight,
  AlertCircle
} from "lucide-react";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // UX / Interaction states
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  // Email regex validation
  const validateEmail = (val: string) => {
    if (!val) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return "Please enter a valid email address";
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const emailError = touchedEmail ? validateEmail(email) : null;
  const passwordError = touchedPassword ? validatePassword(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);

    const isEmailInvalid = validateEmail(email);
    const isPasswordInvalid = validatePassword(password);

    if (isEmailInvalid || isPasswordInvalid) {
      setError("Please fix the validation errors below.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: callbackUrl,
      }, {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          router.push(callbackUrl);
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message || "Invalid email or password. Please try again.");
        }
      });
    } catch (err: any) {
      setLoading(false);
      setError("An unexpected network error occurred.");
    }
  };

  const handleSocialSignIn = async (provider: "github") => {
    setError(null);
    setSocialLoading(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
      }, {
        onRequest: () => {
          setSocialLoading(provider);
        },
        onSuccess: () => {
          setSocialLoading(null);
        },
        onError: (ctx) => {
          setSocialLoading(null);
          setError(ctx.error.message || `Failed to sign in with ${provider}.`);
        }
      });
    } catch (err: any) {
      setSocialLoading(null);
      setError("An unexpected network error occurred.");
    }
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-0 animate-fade-in">
      {/* Brand logo & header */}
      <div className="flex flex-col items-center sm:items-start mb-8 text-center sm:text-left">
        <div className="flex items-center gap-2 mb-4 group">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <span className="text-white font-semibold text-lg tracking-wider">N</span>
          </div>
          <span className="font-semibold text-2xl tracking-tight text-zinc-900 dark:text-white">
            Nova
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
          Please enter your credentials to access your account.
        </p>
      </div>

      {/* Auth card */}
      <div className="bg-white dark:bg-zinc-900/60 dark:border-zinc-800/80 border border-zinc-100 shadow-xl shadow-zinc-100/40 dark:shadow-none rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Error message panel */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm animate-shake">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Sign in failed</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block"
            >
              Email address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touchedEmail) setTouchedEmail(true);
                }}
                onBlur={() => setTouchedEmail(true)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 ${
                  emailError 
                    ? "border-red-400 dark:border-red-950 focus:ring-red-100 dark:focus:ring-red-950/50" 
                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 focus:border-indigo-500 dark:focus:border-indigo-400"
                }`}
                disabled={loading || !!socialLoading}
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                {emailError}
              </p>
            )}
          </div>

          {/* Password input field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Password
              </label>
              <a 
                href="/forgot-password" 
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:underline"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touchedPassword) setTouchedPassword(true);
                }}
                onBlur={() => setTouchedPassword(true)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-zinc-950 transition-all duration-200 ${
                  passwordError 
                    ? "border-red-400 dark:border-red-950 focus:ring-red-100 dark:focus:ring-red-950/50" 
                    : "border-zinc-200 dark:border-zinc-800 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 focus:border-indigo-500 dark:focus:border-indigo-400"
                }`}
                disabled={loading || !!socialLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1.5">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center">
            <label className="relative flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
                disabled={loading || !!socialLoading}
              />
              <div className="h-4.5 w-4.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md transition-all duration-200 flex items-center justify-center peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500 peer-checked:border-indigo-600 dark:peer-checked:border-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-100 dark:peer-focus-visible:ring-indigo-950/50">
                <svg
                  className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="ml-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !!socialLoading}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 border border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-800 dark:focus:ring-indigo-950 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-100 dark:border-zinc-800/80"></div>
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
            <span className="px-3 bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social auth button */}
        <div className="flex flex-col">
          {/* GitHub button */}
          <button
            type="button"
            onClick={() => handleSocialSignIn("github")}
            disabled={loading || !!socialLoading}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/60 text-zinc-750 dark:text-zinc-300 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {socialLoading === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            )}
            Continue with GitHub
          </button>
        </div>
      </div>

      {/* Footer link */}
      <p className="mt-8 text-center text-sm text-zinc-650 dark:text-zinc-400">
        Don’t have an account?{" "}
        <a 
          href="/sign-up" 
          className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-none focus:underline"
        >
          Sign up for free
        </a>
      </p>
    </div>
  );
}
