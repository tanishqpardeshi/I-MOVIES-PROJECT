import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AccountSettingsClient from "@/components/AccountSettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const emailVerified = Boolean(user.email_confirmed_at);

  return (
    <main className="min-h-screen bg-[#101014] px-5 py-10 text-[#F5F3F7] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#A5A1AD] transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
            Account Preferences
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Account Settings
          </h1>

          <p className="mt-4 max-w-xl text-[#A5A1AD]">
            Manage your security and personalize your IMovies experience.
          </p>
        </header>

        <div className="mt-10 grid gap-6">
          <section className="rounded-3xl border border-white/[0.08] bg-[#17171D] p-6 sm:p-9">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Security & Authentication
                </h2>
                <p className="mt-1 text-sm text-[#A5A1AD]">
                  Manage your password and email verification.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">Email Verification</p>
                    <p className="mt-1 text-sm text-[#A5A1AD]">
                      {user.email}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      emailVerified
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {emailVerified ? "Verified" : "Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-[#17171D] p-6 sm:p-9">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <SlidersHorizontal size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Movie Preferences</h2>
                <p className="mt-1 text-sm text-[#A5A1AD]">
                  Customize your preferred genres and movie language.
                </p>
              </div>
            </div>

            <AccountSettingsClient
  userId={user.id}
  userEmail={user.email ?? ""}
/>
          </section>
        </div>

        <p className="mt-8 text-xs leading-5 text-[#77727F]">
          Your account security is managed through IMovies authentication.
        </p>
      </div>
    </main>
  );
}

