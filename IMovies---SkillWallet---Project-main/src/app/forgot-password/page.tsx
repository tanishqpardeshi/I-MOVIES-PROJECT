"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
ArrowLeft,
CheckCircle2,
Film,
LoaderCircle,
Mail,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);
const [error, setError] = useState("");
const router = useRouter();

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();
setLoading(true);
setError("");
setSuccess(false);


try {
  const supabase = createClient();

  const redirectTo = new URL(
    "/auth/callback",
    window.location.origin
  );
  redirectTo.searchParams.set("next", "/reset-password");
  redirectTo.searchParams.set("flow", "recovery");

  const { error: resetError } =
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectTo.toString(),
    });

  if (resetError) {
    console.error("Supabase password reset error:", resetError);
    setError(resetError.message);
    return;
  }

  setSuccess(true);
} catch (err) {
  console.error("Password reset request failed:", err);
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}


}

return ( <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101014] px-5 py-12 text-[#F5F3F7]"> <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" /> <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />


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
        <Mail size={25} />
      </div>

      <h1 className="mt-6 text-3xl font-black tracking-tight">
        Forgot Password?
      </h1>

      <p className="mt-3 text-sm leading-6 text-[#A5A1AD]">
        No worries. Enter the email address associated with your IMovies
        account, and we&apos;ll send you a link to reset your password.
      </p>

      {success ? (
        <div
          role="status"
          className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5"
        >
          <CheckCircle2 size={24} className="text-emerald-300" />

          <h2 className="mt-3 font-semibold text-emerald-200">
            Check your email
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-[#C8C4D0]">
            If an account exists for{" "}
            <span className="font-medium text-white">
              {email.trim()}
            </span>
            , you&apos;ll receive a password-reset link. Check your inbox
            and spam folder.
          </p>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-5 w-full rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="reset-email"
              className="text-sm font-medium text-[#D6D2DF]"
            >
              Email Address
            </label>

            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#101014] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#77727F] focus:border-violet-400"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      )}

      <p className="mt-7 text-center text-xs leading-5 text-[#77727F]">
        For your security, the confirmation message doesn&apos;t reveal
        whether an account exists for the email address.
      </p>
    </section>

    <p className="mt-6 text-center text-xs text-[#77727F]">
      &copy; {new Date().getFullYear()} IMovies. All rights reserved.
    </p>
  </div>
</main>


);
}
