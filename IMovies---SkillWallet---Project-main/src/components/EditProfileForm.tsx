"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EditProfileFormProps {
initialName: string;
}

export default function EditProfileForm({
initialName,
}: EditProfileFormProps) {
const [name, setName] = useState(initialName);
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);
const router = useRouter();

async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
event.preventDefault();


setMessage("");
setError("");

const normalizedName = name.trim();

if (!normalizedName) {
  setError("Please enter your name.");
  return;
}

if (normalizedName.length > 80) {
  setError("Your name must be 80 characters or fewer.");
  return;
}

setLoading(true);

try {
  const supabase = createClient();

  const { data, error: updateError } = await supabase.auth.updateUser({
    data: {
      full_name: normalizedName,
    },
  });

  if (updateError) {
    setError(updateError.message);
    return;
  }

  const updatedName =
    data.user.user_metadata?.full_name || normalizedName;

  setName(updatedName);
  setMessage("Your profile has been updated successfully.");

  router.refresh();
} catch {
  setError("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}


}

return ( <form onSubmit={handleSubmit} className="space-y-5"> <div> <label
       htmlFor="profile-name"
       className="mb-2 block text-sm font-medium text-[#D6D2DF]"
     >
Full Name </label>

```
    <input
      id="profile-name"
      type="text"
      autoComplete="name"
      maxLength={80}
      value={name}
      onChange={(event) => {
        setName(event.target.value);
        setMessage("");
        setError("");
      }}
      placeholder="Enter your full name"
      required
      className="w-full rounded-xl border border-white/10 bg-[#101014] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#77727F] focus:border-violet-400"
    />
  </div>

  {error && (
    <p
      role="alert"
      className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
    >
      {error}
    </p>
  )}

  {message && (
    <p
      role="status"
      className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300"
    >
      <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      {message}
    </p>
  )}

  <button
    type="submit"
    disabled={loading || !name.trim()}
    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
  >
    {loading ? (
      <>
        <LoaderCircle size={17} className="animate-spin" />
        Saving...
      </>
    ) : (
      <>
        <Save size={17} />
        Save Changes
      </>
    )}
  </button>
</form>


);
}
