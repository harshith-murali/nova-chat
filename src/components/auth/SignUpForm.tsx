"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const disabled = loading || Boolean(socialLoading);

  const validateName = (value: string) => {
    if (!value.trim()) return "Name is required";
    if (value.trim().length < 2) return "Name must be at least 2 characters";
    return null;
  };

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return null;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return null;
  };

  const nameError = touched.name ? validateName(name) : null;
  const emailError = touched.email ? validateEmail(email) : null;
  const passwordError = touched.password ? validatePassword(password) : null;
  const confirmPasswordError = touched.confirmPassword
    ? validateConfirmPassword(confirmPassword)
    : null;

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-zinc-50/50 px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 transition-all duration-200 focus:bg-white focus:outline-none focus:ring-2 dark:bg-zinc-950/50 dark:text-white dark:placeholder-zinc-600 dark:focus:bg-zinc-950 ${
      hasError
        ? "border-red-400 focus:ring-red-100 dark:border-red-950 dark:focus:ring-red-950/50"
        : "border-zinc-200 focus:border-indigo-500 focus:ring-indigo-100 dark:border-zinc-800 dark:focus:border-indigo-400 dark:focus:ring-indigo-950/50"
    }`;

  const markTouched = (key: keyof typeof touched) => {
    setTouched((current) => ({ ...current, [key]: true }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const validationErrors = [
      validateName(name),
      validateEmail(email),
      validatePassword(password),
      validateConfirmPassword(confirmPassword),
    ].filter(Boolean);

    if (validationErrors.length > 0) {
      setError("Please fix the validation errors below.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authClient.signUp.email(
        {
          name: name.trim(),
          email,
          password,
          callbackURL: callbackUrl,
        },
        {
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
            setError(
              ctx.error.message ||
                "Could not create your account. Please try again.",
            );
          },
        },
      );
    } catch {
      setLoading(false);
      setError("An unexpected network error occurred.");
    }
  };

  const handleSocialSignUp = async () => {
    setError(null);
    setSocialLoading("github");

    try {
      await authClient.signIn.social(
        {
          provider: "github",
          callbackURL: callbackUrl,
          requestSignUp: true,
        },
        {
          onRequest: () => {
            setSocialLoading("github");
          },
          onSuccess: () => {
            setSocialLoading(null);
          },
          onError: (ctx) => {
            setSocialLoading(null);
            setError(ctx.error.message || "Failed to sign up with GitHub.");
          },
        },
      );
    } catch {
      setSocialLoading(null);
      setError("An unexpected network error occurred.");
    }
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-0 animate-fade-in">
      <div className="mb-8 flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 dark:bg-indigo-500">
            <span className="text-lg font-semibold tracking-wider text-white">
              N
            </span>
          </div>
          <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Nova
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Start a private AI workspace with persistent chat history.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-100/40 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:shadow-none sm:p-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Sign up failed</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => markTouched("name")}
                placeholder="Your name"
                className={`${fieldClass(Boolean(nameError))} pl-10`}
                disabled={disabled}
              />
            </div>
            {nameError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {nameError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => markTouched("email")}
                placeholder="you@example.com"
                className={`${fieldClass(Boolean(emailError))} pl-10`}
                disabled={disabled}
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => markTouched("password")}
                placeholder="At least 8 characters"
                className={`${fieldClass(Boolean(passwordError))} pl-10 pr-11`}
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none dark:text-zinc-500 dark:hover:text-zinc-300"
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
              <p className="text-xs text-red-500 dark:text-red-400">
                {passwordError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                onBlur={() => markTouched("confirmPassword")}
                placeholder="Repeat your password"
                className={`${fieldClass(Boolean(confirmPasswordError))} pl-10 pr-11`}
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 transition-colors hover:text-zinc-600 focus:outline-none dark:text-zinc-500 dark:hover:text-zinc-300"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-transparent bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-all duration-150 hover:bg-zinc-850 focus:outline-none focus:ring-2 focus:ring-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-zinc-100 dark:border-zinc-800/80" />
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
            <span className="bg-white px-3 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSocialSignUp}
          disabled={disabled}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-750 transition-all duration-150 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-100 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:focus:ring-zinc-800"
        >
          {socialLoading === "github" ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          ) : (
            <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          )}
          Continue with GitHub
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-650 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus:outline-none focus:underline dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
