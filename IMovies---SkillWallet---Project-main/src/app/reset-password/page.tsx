"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Film,
  LoaderCircle,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RecoveryStatus = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [recoveryStatus, setRecoveryStatus] =
    useState<RecoveryStatus>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkRecoverySession() {
      const url = new URL(window.location.href);

      // Supabase may return an error in the query string or URL fragment.
      const urlError =
        url.searchParams.get("error") ||
        new URLSearchParams(url.hash.replace(/^#/, "")).get("error");

      if (urlError) {
        if (active) {
          setRecoveryStatus("invalid");
          setError(
            "This password-reset link is invalid or has expired. Please request a new one.",
          );
        }
        return;
      }

      // PKCE recovery links usually provide a code query parameter.
      const code = url.searchParams.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          if (active) {
            setRecoveryStatus("invalid");
            setError(
              "This password-reset link is invalid or has expired. Please request a new one.",
            );
          }
          return;
        }

        // Remove the one-time code from the visible URL after exchanging it.
        window.history.replaceState(
          window.history.state,
          "",
          "/reset-password",
        );
      } else {
        // Some Supabase email templates return tokens in the URL fragment.
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, ""),
        );

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const tokenType = hashParams.get("type");

        if (accessToken && refreshToken && tokenType === "recovery") {
          const { error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) {
            if (active) {
              setRecoveryStatus("invalid");
              setError(
                "This password-reset link is invalid or has expired. Please request a new one.",
              );
            }
            return;
          }

          window.history.replaceState(
            window.history.state,
            "",
            "/reset-password",
          );
        }
      }

      // A valid recovery session must exist before a password can be changed.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !session) {
        setRecoveryStatus("invalid");
        setError(
          "We couldn't verify your password-reset session. Please request a new reset link.",
        );
        return;
      }

      setRecoveryStatus("ready");
    }

    void checkRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Use at least one letter and one number in your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setRecoveryStatus("invalid");
        setError(
          "Your reset session has expired. Please request a new password-reset link.",
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // Sign out after changing the password so the user can sign in again.
      await supabase.auth.signOut();
    } catch {
      setError("Something went wrong. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101014] px-5 py-12 text-[#F5F3F7]">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-white"
        >
          <Film size={25} className="text-violet-400" />
          <span className="text-xl tracking-tight">
            IMovies<span className="text-violet-400">.</span>
          </span>
        </Link>

        <section className="rounded-3xl border border-white/[0.09] bg-[#17171D]/95 p-7 shadow-2xl shadow-black/30 sm:p-9">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[#A5A1AD] transition hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to Sign In
          </Link>

          <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <LockKeyhole size={25} />
          </div>

          <h1 className="mt-6 text-3xl font-black tracking-tight">
            Reset Password
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#A5A1AD]">
            Choose a new password for your IMovies account. Make sure it is
            secure and easy for you to remember.
          </p>

          {success ? (
            <div
              role="status"
              className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5"
            >
              <CheckCircle2 size={25} className="text-emerald-300" />

              <h2 className="mt-3 font-semibold text-emerald-200">
                Password updated successfully
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#C8C4D0]">
                Your password has been changed. You can now sign in using your
                new password.
              </p>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="mt-5 w-full rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-400"
              >
                Continue to Sign In
              </button>
            </div>
          ) : recoveryStatus === "checking" ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-8 text-center">
              <LoaderCircle
                size={28}
                className="animate-spin text-violet-400"
              />
              <p className="mt-4 text-sm text-[#A5A1AD]">
                Verifying your reset link...
              </p>
            </div>
          ) : recoveryStatus === "invalid" ? (
            <div
              role="alert"
              className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5"
            >
              <ShieldAlert size={25} className="text-red-300" />

              <h2 className="mt-3 font-semibold text-red-200">
                Reset link unavailable
              </h2>

              <p className="mt-2 break-words text-sm leading-6 text-[#C8C4D0]">
                {error ||
                  "This password-reset link is invalid or has expired."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="mt-5 w-full rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-400"
              >
                Request a New Reset Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-[#D6D2DF]"
                >
                  New Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your new password"
                    className="w-full rounded-xl border border-white/10 bg-[#101014] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-[#77727F] focus:border-violet-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A1AD] transition hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-[#D6D2DF]"
                >
                  Confirm New Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full rounded-xl border border-white/10 bg-[#101014] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-[#77727F] focus:border-violet-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A1AD] transition hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs leading-5 text-[#8E8998]">
                Use at least 8 characters, including a letter and a number.
              </p>

              {error && (
                <p
                  role="alert"
                  className="break-words rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-300"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          )}

          <p className="mt-7 text-center text-xs leading-5 text-[#77727F]">
            If your reset link has expired, request a new one from the Forgot
            Password page.
          </p>
        </section>

        <p className="mt-6 text-center text-xs text-[#77727F]">
          &copy; {new Date().getFullYear()} IMovies. All rights reserved.
        </p>
      </div>
    </main>
  );
}

