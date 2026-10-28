"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
UserRound,
Settings,
Ticket,
LogOut,
LoaderCircle,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AccountNav() {
const [user, setUser] = useState<User | null>(null);
const [menuOpen, setMenuOpen] = useState(false);
const [loading, setLoading] = useState(true);
const router = useRouter();

useEffect(() => {
const supabase = createClient();
let mounted = true;


async function loadUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (mounted) {
    setUser(user);
    setLoading(false);
  }
}

loadUser();

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
  if (mounted) {
    setUser(session?.user ?? null);
    setLoading(false);
  }
});

return () => {
  mounted = false;
  subscription.unsubscribe();
};


}, []);

async function handleSignOut() {
const supabase = createClient();


setLoading(true);

const { error } = await supabase.auth.signOut();

if (error) {
  console.error("Sign-out failed:", error.message);
  setLoading(false);
  return;
}

setUser(null);
setMenuOpen(false);
setLoading(false);
router.push("/");
router.refresh();


}

if (loading) {
return ( <div
     className="flex h-10 w-10 items-center justify-center"
     aria-label="Loading account"
   > <LoaderCircle
       size={18}
       className="animate-spin text-violet-300"
     /> </div>
);
}

// Logged-out state: display both authentication buttons.
if (!user) {
return ( <div className="flex items-center gap-2"> <Link
       href="/login"
       className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold transition hover:border-violet-400 hover:bg-white/[0.04]"
     >
Sign In </Link>


    <Link
      href="/signup"
      className="rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-400"
    >
      Sign Up
    </Link>
  </div>
);


}

// Logged-in state: show only the circular profile icon.
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

return ( <div className="relative">
<button
  type="button"
  onClick={() => setMenuOpen((open) => !open)}
  aria-expanded={menuOpen}
  aria-haspopup="menu"
  aria-label="Open account menu"
  title={fullName}
  className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-violet-400/30 bg-violet-500 text-sm font-bold leading-none text-white transition hover:bg-violet-400"
>
  <span className="block leading-none">
    {initials || <UserRound size={20} />}
  </span>
</button>


  {menuOpen && (
    <>
      <button
        type="button"
        aria-label="Close account menu"
        className="fixed inset-0 z-40 cursor-default"
        onClick={() => setMenuOpen(false)}
      />

      <div
        role="menu"
        className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#1B1A22] p-2 shadow-2xl shadow-black/40"
      >
        <div className="border-b border-white/[0.08] px-3 py-3">
          <p className="truncate text-sm font-semibold text-white">
            {fullName}
          </p>
          <p className="mt-1 truncate text-xs text-[#A5A1AD]">
            {user.email}
          </p>
        </div>

        <div className="space-y-1 py-2">
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#D6D2DF] transition hover:bg-white/[0.06] hover:text-white"
          >
            <UserRound size={17} />
            View Profile
          </Link>

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#D6D2DF] transition hover:bg-white/[0.06] hover:text-white"
          >
            <Settings size={17} />
            Account Settings
          </Link>

          <Link
            href="/watchlist"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#D6D2DF] transition hover:bg-white/[0.06] hover:text-white"
          >
            <Ticket size={17} />
            My Watchlist
          </Link>

          <Link
            href="/my-bookings"
            role="menuitem"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#D6D2DF] transition hover:bg-white/[0.06] hover:text-white"
          >
            <Ticket size={17} />
            My Bookings
          </Link>
        </div>

        <div className="border-t border-white/[0.08] pt-2">
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )}
</div>


);
}
