import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
const url = new URL(request.url);
const { searchParams, origin } = url;

const code = searchParams.get("code");
const next = searchParams.get("next") ?? "/";
const flow = searchParams.get("flow");

const safeNext =
next.startsWith("/") && !next.startsWith("//") ? next : "/";

if (!code) {
const destination =
flow === "recovery"
? "/forgot-password?error=missing_code"
: "/login?error=missing_code";


return NextResponse.redirect(new URL(destination, origin));


}

const supabase = await createClient();

const { error } = await supabase.auth.exchangeCodeForSession(code);

if (error) {
console.error("Supabase callback error:", error.message);


const destination =
  flow === "recovery"
    ? "/forgot-password?error=recovery_failed"
    : `/login?error=verification_failed&reason=${encodeURIComponent(
        error.message
      )}`;

return NextResponse.redirect(new URL(destination, origin));


}

return NextResponse.redirect(new URL(safeNext, origin));
}
