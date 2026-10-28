import Link from "next/link";
import { notFound } from "next/navigation";
import PaymentSection from "@/components/PaymentSection";
import { getMovieDetails } from "@/lib/tmdb";

interface CheckoutPageProps {
  params: Promise<{
    cinemaID: string;
  }>;
  searchParams: Promise<{
    movieId?: string;
    showtimeId?: string;
    date?: string;
    seats?: string;
    total?: string;
  }>;
}

const cinemas = [
  { id: "CIN001", name: "Kalyan Cinemas" },
  { id: "CIN002", name: "Odeon Cinemas" },
  { id: "CIN003", name: "PVR: Treasure Island Mall" },
  { id: "CIN004", name: "INOX: C-21 Mall" },
  { id: "CIN005", name: "INOX: Nexus Indore Central Mall" },
  { id: "CIN006", name: "Miraj Cinemas: Velocity III" },

  // Additional cinema IDs used in the application.
  { id: "kalyan-cinemas", name: "Kalyan Cinemas" },
  { id: "odeon-cinemas", name: "Odeon Cinemas" },
  { id: "pvr-treasure", name: "PVR: Treasure Island Mall" },
  { id: "inox-c21", name: "INOX: C-21 Mall" },
  { id: "inox-central", name: "INOX: Nexus Indore Central Mall" },
  { id: "miraj-velocity", name: "Miraj Cinemas: Velocity III" },
  { id: "inox-phoenix", name: "INOX: Phoenix Citadel Mall" },
  { id: "drama-factory", name: "Drama Factory" },
  { id: "rajhans-cinemas", name: "Rajhans Cinemas" },
  { id: "sapna-sangeeta", name: "Sapna Sangeeta" },
  { id: "fundore-cinemas", name: "Fundore Cinemas" },
  { id: "mangal-carnival", name: "Mangal City Carnival" },
];

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { cinemaID } = await params;

  const {
    movieId,
    showtimeId,
    date,
    seats,
    total,
  } = await searchParams;

  // Resolve the cinema from the URL.
  const cinema = cinemas.find(
    (item) => item.id === decodeURIComponent(cinemaID)
  );

  if (!cinema) {
    notFound();
  }

  // Read selected seats.
  const selectedSeats = seats
    ? seats.split(",").filter(Boolean)
    : [];

  // Preserve the existing demonstration total.
  const parsedTotal = Number(total);

  const validTotal =
    total !== undefined &&
    Number.isFinite(parsedTotal) &&
    parsedTotal >= 0
      ? parsedTotal
      : 0;

  // Fetch the selected movie from TMDB.
  let movie: Awaited<ReturnType<typeof getMovieDetails>> | null = null;

  if (movieId && /^\d+$/.test(movieId)) {
    try {
      movie = await getMovieDetails(movieId);
    } catch (error) {
      console.error("Unable to fetch TMDB movie details:", error);
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
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not selected";

  // Keep the original booking parameters when navigating back.
  const backQuery = new URLSearchParams();

  if (movieId) backQuery.set("movieId", movieId);
  if (showtimeId) backQuery.set("showtimeId", showtimeId);
  if (date) backQuery.set("date", date);

  const backUrl =
    `/booking/${encodeURIComponent(cinemaID)}/seats` +
    (backQuery.size ? `?${backQuery.toString()}` : "");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#101014] px-5 py-10 text-[#F5F3F7] sm:px-8 sm:py-14">

      {/* Movie-specific backdrop */}
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
        className="pointer-events-none fixed inset-0 -z-10 bg-[#101014]/65"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#101014]/45 via-[#101014]/75 to-[#101014]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-[#101014]/40 via-transparent to-[#101014]/40"
      />

      {/* Purple cinematic glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]"
      />

      <div className="mx-auto max-w-3xl">

        {/* Back navigation */}
        <Link
          href={backUrl}
          className="inline-flex items-center gap-2 text-sm text-[#C5C0CF] transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to seats
        </Link>

        {/* Heading */}
        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
            Step 04 · Review your booking
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-4 text-sm leading-6 text-gray-300 sm:text-base">
            Review your movie, seats, and booking details before continuing.
          </p>
        </header>

        {/* Movie information */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-[#17171D]/85 shadow-2xl shadow-black/20 backdrop-blur-xl">
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

              <p className="mt-3 text-sm leading-6 text-gray-300">
                Enjoy your show at {cinema.name}.
              </p>

              {movie?.release_date && (
                <p className="mt-2 text-xs text-gray-400">
                  Release year: {movie.release_date.slice(0, 4)}
                </p>
              )}
            </div>

            <div className="hidden h-20 w-px bg-white/10 sm:block" />

            <div className="shrink-0 sm:text-right">
              <p className="text-xs uppercase tracking-wider text-gray-400">
                Amount payable
              </p>

              <p className="mt-2 text-3xl font-bold text-violet-300">
                ₹{validTotal}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {selectedSeats.length}{" "}
                {selectedSeats.length === 1 ? "seat" : "seats"}
              </p>
            </div>
          </div>
        </section>

        {/* Booking summary */}
        <section className="mt-6 rounded-2xl border border-white/15 bg-[#17171D]/85 p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8">

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Booking summary
            </h2>

            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
              Booking details
            </span>
          </div>

          <div className="mt-6 space-y-5 text-sm">

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Cinema</span>
              <span className="text-right font-medium">
                {cinema.name}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Movie</span>
              <span className="max-w-[70%] text-right font-medium">
                {movieTitle}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Date</span>
              <span className="text-right font-medium">
                {formattedDate}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Showtime ID</span>
              <span className="text-right font-medium">
                {showtimeId || "Not selected"}
              </span>
            </div>

            {/* Selected seats */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-start justify-between gap-4">
                <span className="text-gray-400">Selected seats</span>

                <div className="flex max-w-[70%] flex-wrap justify-end gap-2">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((seat) => (
                      <span
                        key={seat}
                        className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200"
                      >
                        {seat}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">
                      No seats selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Total amount</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Demonstration booking total
                  </p>
                </div>

                <p className="text-2xl font-bold text-violet-300">
                  ₹{validTotal}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Existing payment component */}
        <div className="mt-6">
          <PaymentSection
            totalAmount={validTotal}
            movieId={movieId ?? ""}
            cinemaID={cinemaID}
            cinemaName={cinema.name}
            showtimeId={showtimeId ?? ""}
            date={date ?? ""}
            seats={selectedSeats}
          />
        </div>

        {/* Demonstration disclaimer */}
        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200 backdrop-blur-sm">
          This is a demonstration checkout. No payment will be collected,
          and no cinema tickets are being reserved.
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Your next movie experience is just around the corner.
        </p>

      </div>
    </main>
  );
}

