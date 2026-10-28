"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  booking_reference: string;
  movie_id: string;
  cinema_id: string;
  cinema_name: string;
  showtime_id: string;
  show_date: string;
  total_amount: number;
  payment_method: string;
  booking_status: "demo_confirmed" | "cancelled";
  created_at: string;
  seats: string[];
}

interface MovieInfo {
  title: string;
  poster_path: string | null;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w200";

const paymentMethodLabels: Record<string, string> = {
  upi: "UPI",
  card: "Credit / Debit Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [movieDetails, setMovieDetails] = useState<
    Record<string, MovieInfo>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancellationError, setCancellationError] = useState("");

  const supabase = createClient();

  const refreshBookings = useCallback(async () => {
    setIsLoading(true);
    setLoadingError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace(
          `/login?next=${encodeURIComponent("/my-bookings")}`
        );
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Unable to load bookings:", error);
        throw new Error(error.message);
      }

      const bookingRows = data ?? [];

      // Fetch the seats for these bookings separately.
      const bookingIds = bookingRows.map((booking) => booking.id);

      let seatsByBooking: Record<string, string[]> = {};

      if (bookingIds.length > 0) {
        const { data: seatRows, error: seatsError } = await supabase
          .from("booking_seats")
          .select("booking_id, seat_number")
          .in("booking_id", bookingIds);

        if (seatsError) {
          console.error("Unable to load booking seats:", seatsError);
          throw new Error(seatsError.message);
        }

        seatsByBooking = (seatRows ?? []).reduce<
          Record<string, string[]>
        >((result, seat) => {
          if (!result[seat.booking_id]) {
            result[seat.booking_id] = [];
          }

          result[seat.booking_id].push(seat.seat_number);
          return result;
        }, {});
      }

      const mappedBookings: Booking[] = bookingRows.map((booking) => ({
        id: booking.id,
        booking_reference: booking.booking_reference,
        movie_id: booking.movie_id,
        cinema_id: booking.cinema_id,
        cinema_name: booking.cinema_name,
        showtime_id: booking.showtime_id,
        show_date: booking.show_date,
        total_amount: Number(booking.total_amount),
        payment_method: booking.payment_method,
        booking_status: booking.booking_status,
        created_at: booking.created_at,
        seats: (seatsByBooking[booking.id] ?? []).sort((a, b) => {
          const rowA = a.match(/^[A-P]/)?.[0] ?? "";
          const rowB = b.match(/^[A-P]/)?.[0] ?? "";

          if (rowA !== rowB) {
            return rowA.localeCompare(rowB);
          }

          return Number(a.slice(1)) - Number(b.slice(1));
        }),
      }));

      setBookings(mappedBookings);
    } catch (error) {
      console.error("My Bookings error:", error);

      setLoadingError(
        error instanceof Error
          ? error.message
          : "Unable to load your bookings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    void refreshBookings();
  }, [refreshBookings]);

  // Load movie titles and posters from the existing movie API.
  useEffect(() => {
    let cancelled = false;

    async function loadMovieDetails() {
      const movieIds = [
        ...new Set(bookings.map((booking) => booking.movie_id)),
      ].filter((id) => id && !movieDetails[id]);

      if (movieIds.length === 0) return;

      const results = await Promise.all(
        movieIds.map(async (id) => {
          try {
            const response = await fetch(`/api/movies/${id}`);

            if (!response.ok) return null;

            const movie = (await response.json()) as {
              title?: string;
              poster_path?: string | null;
            };

            if (!movie.title) return null;

            return {
              id,
              movie: {
                title: movie.title,
                poster_path: movie.poster_path ?? null,
              },
            };
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      setMovieDetails((previous) => {
        const updated = { ...previous };

        for (const result of results) {
          if (result) {
            updated[result.id] = result.movie;
          }
        }

        return updated;
      });
    }

    void loadMovieDetails();

    return () => {
      cancelled = true;
    };
  }, [bookings, movieDetails]);

  async function handleCancelBooking(booking: Booking) {
    const confirmed = window.confirm(
      `Cancel demo booking ${booking.booking_reference}?`
    );

    if (!confirmed) return;

    setCancellingId(booking.id);
    setCancellationError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace(
          `/login?next=${encodeURIComponent("/my-bookings")}`
        );
        return;
      }

      const { error } = await supabase.rpc("cancel_demo_booking", {
        p_booking_id: booking.id,
      });

      if (error) {
        console.error("Unable to cancel booking:", error);
        throw new Error(error.message);
      }

      // Refresh the data from Supabase.
      await refreshBookings();
    } catch (error) {
      console.error("Booking cancellation error:", error);

      setCancellationError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this booking. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#101014] px-5 py-12 text-[#F5F3F7] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm text-[#A5A1AD] transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
            Your Account
          </p>

          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            My Bookings
          </h1>

          <p className="mt-4 text-[#A5A1AD]">
            View and manage your saved demo bookings.
          </p>
        </header>

        {cancellationError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
          >
            {cancellationError}
          </div>
        )}

        {isLoading ? (
          <p className="mt-10 text-[#A5A1AD]">
            Loading your bookings...
          </p>
        ) : loadingError ? (
          <section className="mt-10 rounded-2xl border border-red-400/20 bg-[#17171D] p-8 text-center">
            <h2 className="text-xl font-semibold">
              Unable to load bookings
            </h2>

            <p className="mt-3 break-words text-sm text-red-300">
              {loadingError}
            </p>

            <button
              type="button"
              onClick={() => void refreshBookings()}
              className="mt-6 rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400"
            >
              Try Again
            </button>
          </section>
        ) : bookings.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-white/10 bg-[#17171D] p-8 text-center sm:p-12">
            <h2 className="text-xl font-semibold">No bookings yet</h2>

            <p className="mt-3 text-[#A5A1AD]">
              Your completed demo bookings will appear here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-400"
            >
              Explore Movies
            </Link>
          </section>
        ) : (
          <div className="mt-10 space-y-5">
            {bookings.map((booking) => {
              const movie = movieDetails[booking.movie_id];

              const posterUrl = movie?.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                : null;

              const isConfirmed =
                booking.booking_status === "demo_confirmed";

              return (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-white/10 bg-[#17171D] p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="relative aspect-[2/3] w-28 shrink-0 overflow-hidden rounded-xl bg-[#222129]">
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={`${movie?.title ?? "Movie"} poster`}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-2 text-center text-xs text-[#A5A1AD]">
                          Poster unavailable
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                            Booking Reference
                          </p>

                          <p className="mt-2 break-all font-mono text-sm">
                            {booking.booking_reference}
                          </p>

                          <p className="mt-1 break-all text-xs text-[#A5A1AD]">
                            ID: {booking.id}
                          </p>

                          <h2 className="mt-4 text-xl font-semibold">
                            {movie?.title || `Movie ID: ${booking.movie_id}`}
                          </h2>

                          <p className="mt-2 text-sm text-[#A5A1AD]">
                            {booking.cinema_name ||
                              "Cinema details unavailable"}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                            isConfirmed
                              ? "bg-emerald-400/10 text-emerald-300"
                              : "bg-red-400/10 text-red-300"
                          }`}
                        >
                          {isConfirmed
                            ? "CONFIRMED · DEMO"
                            : "CANCELLED"}
                        </span>
                      </div>

                      <div className="mt-6 grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-sm text-[#A5A1AD]">Date</p>
                          <p className="mt-1 font-medium">
                            {booking.show_date || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#A5A1AD]">
                            Showtime ID
                          </p>
                          <p className="mt-1 break-all font-medium">
                            {booking.showtime_id || "Not specified"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#A5A1AD]">Seats</p>
                          <p className="mt-1 font-medium">
                            {booking.seats.length
                              ? booking.seats.join(", ")
                              : "None selected"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#A5A1AD]">
                            Demo Amount
                          </p>
                          <p className="mt-1 font-semibold text-violet-300">
                            ₹{booking.total_amount.toFixed(2)}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#A5A1AD]">
                            Payment Method
                          </p>
                          <p className="mt-1 font-medium">
                            {paymentMethodLabels[
                              booking.payment_method.toLowerCase()
                            ] ?? booking.payment_method}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#A5A1AD]">Booked At</p>
                          <p className="mt-1 text-sm font-medium">
                            {new Date(booking.created_at).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>

                      {isConfirmed && (
                        <div className="mt-6 border-t border-white/10 pt-5">
                          <button
                            type="button"
                            disabled={cancellingId === booking.id}
                            onClick={() => void handleCancelBooking(booking)}
                            className="rounded-lg border border-red-400/30 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "Cancel Demo Booking"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-xs leading-5 text-[#A5A1AD]">
          These records are retrieved from your account in Supabase. They
          represent demo bookings only, not real cinema reservations or
          completed payments.
        </p>
      </div>
    </main>
  );
}