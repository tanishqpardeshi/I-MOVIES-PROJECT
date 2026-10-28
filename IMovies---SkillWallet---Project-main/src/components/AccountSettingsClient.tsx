"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AccountSettingsClientProps = {
  userId: string;
  userEmail?: string;
};

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
];

export default function AccountSettingsClient({
  userId,
  userEmail = "",
}: AccountSettingsClientProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("preferred_genres, preferred_language")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError("Couldn't load your preferences. Please refresh the page.");
      } else if (data) {
        const genreIds = (data.preferred_genres ?? [])
          .map((value: string | number) => Number(value))
          .filter((value: number) => Number.isFinite(value));

        setSelectedGenres(genreIds);
        setSelectedLanguage(data.preferred_language || "en");
      }

      setLoading(false);
    }

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function toggleGenre(genreId: number) {
    setSelectedGenres((current) =>
      current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId],
    );

    setMessage("");
    setError("");
  }

  async function savePreferences() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || authData.user?.id !== userId) {
        setError("Your session couldn't be verified. Please sign in again.");
        return;
      }

      const { error: saveError } = await supabase
        .from("user_preferences")
        .upsert(
          {
            user_id: userId,
            preferred_genres: selectedGenres.map(String),
            preferred_language: selectedLanguage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (saveError) {
        setError("Couldn't save your preferences. Please try again.");
      } else {
        setMessage("Your movie preferences have been saved.");
      }
    } catch {
      setError("Something went wrong while saving your preferences.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!userEmail) {
      setPasswordError(
        "Your account email couldn't be found. Please sign in again.",
      );
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const supabase = createClient();

      // Verify the current password by re-authenticating.
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: userEmail,
          password: currentPassword,
        });

      if (authError || authData.user?.id !== userId) {
        setPasswordError("Your current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Your password has been changed successfully.");
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  const inputClassName =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#101014] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#77727F] focus:border-violet-400";

  return (
    <div className="mt-6 space-y-10">
      {/* Change Password */}
      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <LockKeyhole size={19} />
          </div>

          <div>
            <h3 className="font-semibold">Change Password</h3>
            <p className="mt-1 text-sm text-[#A5A1AD]">
              Choose a strong password to protect your account.
            </p>
          </div>
        </div>

        <form onSubmit={changePassword} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="text-sm font-medium text-[#D6D2DF]"
            >
              Current Password
            </label>

            <input
              id="current-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={inputClassName}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="text-sm font-medium text-[#D6D2DF]"
            >
              New Password
            </label>

            <input
              id="new-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClassName}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="text-sm font-medium text-[#D6D2DF]"
            >
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
              placeholder="Re-enter your new password"
              minLength={8}
              required
            />
          </div>

          <label className="mr-4 inline-flex cursor-pointer items-center gap-2 text-sm text-[#A5A1AD]">
  <input
    type="checkbox"
    checked={showPasswords}
    onChange={(event) => setShowPasswords(event.target.checked)}
    className="accent-violet-500"
  />
  Show passwords
</label>

          {passwordMessage && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm text-emerald-300"
            >
              <CheckCircle2 size={16} />
              {passwordMessage}
            </p>
          )}

          {passwordError && (
            <p role="alert" className="text-sm text-red-300">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <LockKeyhole size={16} />
            )}
            {changingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </form>
      </section>

      <div className="border-t border-white/[0.08]" />

      {/* Movie Preferences */}
      <section>
        <h3 className="font-semibold">Preferred Genres</h3>
        <p className="mt-1 text-sm text-[#A5A1AD]">
          Select the genres you enjoy. You can choose more than one.
        </p>

        {loading ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-[#A5A1AD]">
            <LoaderCircle size={16} className="animate-spin" />
            Loading preferences...
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRES.map((genre) => {
              const active = selectedGenres.includes(genre.id);

              return (
                <button
                  key={genre.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleGenre(genre.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    active
                      ? "border-violet-400 bg-violet-500/20 text-violet-200"
                      : "border-white/10 bg-white/[0.02] text-[#C8C4D0] hover:border-violet-400/50 hover:text-white"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <label
            htmlFor="preferred-language"
            className="font-semibold"
          >
            Preferred Movie Language
          </label>

          <p className="mt-1 text-sm text-[#A5A1AD]">
            Choose the language you'd prefer for movie discovery.
          </p>

          <select
            id="preferred-language"
            value={selectedLanguage}
            onChange={(event) => {
              setSelectedLanguage(event.target.value);
              setMessage("");
              setError("");
            }}
            disabled={loading}
            className="mt-4 w-full rounded-xl border border-white/10 bg-[#101014] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 disabled:opacity-50 sm:max-w-sm"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={savePreferences}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Preferences"}
          </button>

          {message && (
            <p
              role="status"
              className="inline-flex items-center gap-2 text-sm text-emerald-300"
            >
              <CheckCircle2 size={16} />
              {message}
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}