import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMovieDetails } from "@/lib/tmdb";

interface ConfirmationPageProps {
  searchParams: Promise<{
    bookingId?: string;
  }>;
}

const paymentMethodLabels: Record<string, string> = {
  upi: "UPI",
  card: "Credit / Debit Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
};

export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  const { bookingId } = await searchParams;

  // Validate the booking ID.
  if (!bookingId) {
    notFound();
  }

  // Connect to Supabase.
  const supabase = await createClient();

  // Verify the authenticated user.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/booking/confirmation?bookingId=${bookingId}`
      )}`
    );
  }

  // Retrieve the booking belonging to the authenticated user.
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_reference,
      user_id,
      movie_id,
      cinema_id,
      cinema_name,
      showtime_id,
      show_date,
      total_amount,
      payment_method,
      booking_status,
      created_at
    `)
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (bookingError) {
    console.error("Supabase booking query failed:", {
      message: bookingError.message,
      code: bookingError.code,
      details: bookingError.details,
      hint: bookingError.hint,
    });

    throw new Error(
      `Unable to load booking: ${bookingError.message}`
    );
  }

  // Do not expose bookings belonging to other users.
  if (!booking) {
    notFound();
  }

  // Retrieve the seats separately to avoid relying on a nested relationship.
  const { data: seatRows, error: seatsError } = await supabase
    .from("booking_seats")
    .select("seat_number")
    .eq("booking_id", booking.id);

  if (seatsError) {
    console.error("Supabase booking seats query failed:", {
      message: seatsError.message,
      code: seatsError.code,
      details: seatsError.details,
      hint: seatsError.hint,
    });

    throw new Error(
      `Unable to load booking seats: ${seatsError.message}`
    );
  }

  // Use database values instead of trusting URL parameters.
  const movieId = booking.movie_id;
  const cinemaName = booking.cinema_name;
  const showtimeId = booking.showtime_id;
  const date = booking.show_date;
  const totalAmount = Number(booking.total_amount);
  const bookingReference = booking.booking_reference;

  const selectedSeats = (seatRows ?? [])
    .map((seat) => seat.seat_number)
    .sort((a, b) => {
      const rowA = a.match(/^[A-P]/)?.[0] ?? "";
      const rowB = b.match(/^[A-P]/)?.[0] ?? "";

      if (rowA !== rowB) {
        return rowA.localeCompare(rowB);
      }

      return Number(a.slice(1)) - Number(b.slice(1));
    });

  const paymentMethod =
    paymentMethodLabels[
      booking.payment_method?.toLowerCase() ?? ""
    ] ?? "Not specified";

  const isCancelled = booking.booking_status === "cancelled";

  // Fetch movie details from TMDB.
  let movie: Awaited<ReturnType<typeof getMovieDetails>> | null = null;

  if (/^\d+$/.test(movieId)) {
    try {
      movie = await getMovieDetails(movieId);
    } catch (error) {
      console.error(
        "Unable to fetch movie details for confirmation:",
        error
      );
    }
  }

  const movieTitle =
    movie?.title || movie?.name || "Movie details unavailable";

  const backdropUrl = movie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not selected";

  const formattedBookingDate = new Date(
    booking.created_at
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#101014] px-5 py-10 text-[#F5F3F7] sm:px-8 sm:py-14">
      {/* Movie backdrop */}
      {backdropUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${backdropUrl}")`,
          }}
        />
      )}

      {/* Cinematic overlays */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[#101014]/60"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#101014]/40 via-[#101014]/75 to-[#101014]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-[#101014]/40 via-transparent to-[#101014]/40"
      />

      {/* Purple ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]"
      />

      <div className="mx-auto max-w-2xl">
        {/* Success header */}
        <section className="text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border text-4xl shadow-[0_0_40px_rgba(52,211,153,0.12)] ${
              isCancelled
                ? "border-red-400/30 bg-red-400/10 text-red-400"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
            }`}
          >
            {isCancelled ? "×" : "✓"}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
            IMovies · Demo Checkout
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {isCancelled
              ? "Booking Cancelled"
              : "Demo Payment Complete!"}
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-300 sm:text-base">
            {isCancelled
              ? "This booking has been cancelled."
              : "Your booking has been saved successfully. Review your booking details below."}
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide ${
              isCancelled
                ? "border-red-400/25 bg-red-400/10 text-red-300"
                : "border-amber-400/25 bg-amber-400/10 text-amber-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isCancelled ? "bg-red-400" : "bg-amber-400"
              }`}
            />

            {isCancelled ? "CANCELLED" : "SIMULATED BOOKING"}
          </div>
        </section>

        {/* Movie card */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-white/15 bg-[#17171D]/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
            {posterUrl && (
              <div className="w-24 shrink-0 sm:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={posterUrl}
                  alt={`${movieTitle} poster`}
                  className="aspect-[2/3] w-full rounded-xl border border-white/10 object-cover shadow-lg"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                Your movie
              </p>

              <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                {movieTitle}
              </h2>

              {movie?.release_date && (
                <p className="mt-2 text-sm text-gray-400">
                  {movie.release_date.slice(0, 4)}
                </p>
              )}

              <p className="mt-3 text-sm leading-6 text-gray-300">
                {cinemaName}
              </p>
            </div>
          </div>
        </section>

        {/* Booking details */}
        <section className="mt-6 rounded-2xl border border-white/15 bg-[#17171D]/85 p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Booking details</h2>

            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
              Demo
            </span>
          </div>

          <div className="mt-6 space-y-5 text-sm">
            {/* Database-generated booking reference */}
            <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4">
              <p className="text-xs text-gray-400">
                Booking reference
              </p>

              <p className="mt-2 break-all font-mono text-sm font-semibold text-violet-200">
                {bookingReference}
              </p>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-400">Booking status</span>

              <span
                className={`text-right font-semibold ${
                  isCancelled ? "text-red-300" : "text-emerald-300"
                }`}
              >
                {isCancelled ? "Cancelled" : "Confirmed (Demo)"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-400">Movie</span>

              <span className="max-w-[65%] text-right font-medium">
                {movieTitle}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-400">Cinema</span>

              <span className="max-w-[65%] text-right font-medium">
                {cinemaName}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-400">Date</span>

              <span className="max-w-[65%] text-right font-medium">
                {formattedDate}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-400">Showtime ID</span>

              <span className="max-w-[65%] break-all text-right font-medium">
                {showtimeId}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-gray-400">Booking created</span>

              <span className="max-w-[65%] text-right font-medium">
                {formattedBookingDate}
              </span>
            </div>

            {/* Seats from booking_seats */}
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm text-gray-400">Selected seats</p>

              {selectedSeats.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-sm font-semibold text-violet-200"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-400">
                  No seats available for this booking.
                </p>
              )}
            </div>

            {/* Payment summary */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-gray-400">Demo amount</span>

                <span className="text-xl font-bold text-violet-300">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-white/10 py-3">
                <span className="text-gray-400">Payment method</span>

                <span className="max-w-[65%] text-right font-medium">
                  {paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 py-3">
                <span className="text-gray-400">Payment status</span>

                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  NOT A REAL PAYMENT
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-4 font-semibold text-white transition hover:bg-violet-400"
          >
            Return to Home
          </Link>

          <Link
            href="/movies"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            Explore More Movies
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200 backdrop-blur-sm">
          This page demonstrates the checkout flow only. No real payment
          has been processed, and no cinema tickets have been issued.
          This is not proof of payment or a valid cinema ticket.
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Thank you for exploring IMovies.
        </p>
      </div>
    </main>
  );
}