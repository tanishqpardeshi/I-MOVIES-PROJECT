import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/EditProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Movie Lover";

  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0].toUpperCase())
    .join("");

  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
            Your Account
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            My Profile
          </h1>

          <p className="mt-4 max-w-xl text-[#A5A1AD]">
            Manage your personal information and account details.
          </p>
        </header>

        <section className="mt-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#17171D]">
          <div className="relative overflow-hidden border-b border-white/[0.08] p-6 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-violet-300/20 bg-gradient-to-br from-violet-500 to-purple-800 text-2xl font-bold shadow-lg shadow-violet-950/30">
                {initials || <UserRound size={30} />}
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-2xl font-bold">
                  {fullName}
                </h2>

                <p className="mt-2 break-all text-sm text-[#A5A1AD]">
                  {user.email}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#D6D2DF]">
                    <Clapperboard size={13} />
                    IMovies Member
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                      emailVerified
                        ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border border-amber-400/20 bg-amber-400/10 text-amber-300"
                    }`}
                  >
                    {emailVerified ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <Mail size={13} />
                    )}

                    {emailVerified ? "Email Verified" : "Email Not Verified"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:grid-cols-[1fr_1.2fr] sm:p-9">
            <div>
              <div className="flex items-center gap-2">
                <UserRound size={18} className="text-violet-300" />

                <h3 className="text-lg font-semibold">
                  Personal Information
                </h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#A5A1AD]">
                Keep your profile information up to date.
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs text-[#A5A1AD]">
                    <Mail size={14} />
                    Email Address
                  </div>

                  <p className="mt-2 break-all text-sm font-medium">
                    {user.email}
                  </p>

                  <p className="mt-2 text-xs text-[#A5A1AD]">
                    Email changes require a separate verification process.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs text-[#A5A1AD]">
                    <CalendarDays size={14} />
                    Member Since
                  </div>

                  <p className="mt-2 text-sm font-medium">{memberSince}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-violet-300" />

                <h3 className="text-lg font-semibold">Edit Profile</h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-[#A5A1AD]">
                Update the name displayed on your IMovies account.
              </p>

              <div className="mt-6">
                <EditProfileForm initialName={fullName} />
              </div>
            </div>
          </div>
        </section>

        <p className="mt-8 text-xs leading-5 text-[#77727F]">
          Your profile information is managed through your IMovies account.
        </p>
      </div>
    </main>
  );
}

