"use client";

import { useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import Link from "next/link";

type SeatCategory =
  | "Standard"
  | "Premium"
  | "Extra Legroom"
  | "VIP"
  | "Recliner";

interface Seat {
  id: string;
  row: string;
  number: number;
  category: SeatCategory;
  price: number;
  occupied: boolean;
}

const CATEGORY_CONFIG: Record<
  SeatCategory,
  { price: number; color: string; description: string }
> = {
  Standard: {
    price: 150,
    color: "bg-slate-600",
    description: "Comfortable standard seating",
  },
  Premium: {
    price: 200,
    color: "bg-blue-500",
    description: "Preferred viewing positions",
  },
  "Extra Legroom": {
    price: 250,
    color: "bg-emerald-500",
    description: "Additional leg space",
  },
  VIP: {
    price: 300,
    color: "bg-amber-500",
    description: "Exclusive premium seating",
  },
  Recliner: {
    price: 450,
    color: "bg-fuchsia-500",
    description: "Relax in a reclining seat",
  },
};

const ROWS = "ABCDEFGHIJKLMNOP".split("");

/*
 * Screen is at the top; the back of the auditorium is at the bottom.
 * Rows A-E: Standard (5 rows)
 * Rows F-J: Premium (5 rows)
 * Rows K-L: Extra Legroom (2 rows)
 * Rows M-N: VIP (2 rows)
 * Rows O-P: Recliner (2 rows, at the back)
 */
const CATEGORY_BY_ROW: Record<string, SeatCategory> = {
  A: "Standard",
  B: "Standard",
  C: "Standard",
  D: "Standard",
  E: "Standard",

  F: "Premium",
  G: "Premium",
  H: "Premium",
  I: "Premium",
  J: "Premium",

  K: "Extra Legroom",
  L: "Extra Legroom",

  M: "VIP",
  N: "VIP",

  O: "Recliner",
  P: "Recliner",
};

const SEATS_PER_ROW = 30;

const seats: Seat[] = ROWS.flatMap((row) =>
  Array.from({ length: SEATS_PER_ROW }, (_, index) => {
    const number = index + 1;
    const category = CATEGORY_BY_ROW[row];

    const occupied =
      (row === "B" && [4, 13, 25].includes(number)) ||
      (row === "C" && [7, 18, 29].includes(number)) ||
      (row === "F" && [10, 22].includes(number)) ||
      (row === "H" && [5, 16, 27].includes(number)) ||
      (row === "K" && [3, 14, 24].includes(number)) ||
      (row === "M" && [8, 19].includes(number)) ||
      (row === "O" && [6, 7, 28].includes(number));

    return {
      id: `${row}${number}`,
      row,
      number,
      category,
      price: CATEGORY_CONFIG[category].price,
      occupied,
    };
  })
);

export default function SeatMap() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const cinemaID = String(params.cinemaID ?? "");

  const movieId = searchParams.get("movieId") ?? "";
  const showtimeId = searchParams.get("showtimeId") ?? "";
  const date = searchParams.get("date") ?? "";

  const selectedSeatDetails = seats.filter((seat) =>
    selectedSeats.includes(seat.id)
  );

  const total = selectedSeatDetails.reduce(
    (sum, seat) => sum + seat.price,
    0
  );

  const toggleSeat = (seat: Seat) => {
    if (seat.occupied) return;

    setSelectedSeats((currentSeats) =>
      currentSeats.includes(seat.id)
        ? currentSeats.filter((id) => id !== seat.id)
        : [...currentSeats, seat.id]
    );
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;

    const query = new URLSearchParams();

    if (movieId) query.set("movieId", movieId);
    if (showtimeId) query.set("showtimeId", showtimeId);
    if (date) query.set("date", date);

    query.set("seats", selectedSeats.join(","));
    query.set("total", String(total));

    router.push(
      `/booking/${encodeURIComponent(cinemaID)}/checkout?${query.toString()}`
    );
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    const category = CATEGORY_CONFIG[seat.category];

    return (
      <button
        key={seat.id}
        type="button"
        disabled={seat.occupied}
        onClick={() => toggleSeat(seat)}
        aria-label={`Seat ${seat.id}, ${seat.category}, ₹${seat.price}${
          seat.occupied
            ? ", occupied"
            : isSelected
              ? ", selected"
              : ", available"
        }`}
        aria-pressed={isSelected}
        title={`${seat.id} · ${seat.category} · ₹${seat.price}`}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[9px] font-medium transition sm:h-8 sm:w-8 sm:text-[10px] lg:h-9 lg:w-9 ${
          seat.occupied
            ? "cursor-not-allowed border-red-900 bg-red-800 text-red-200"
            : isSelected
              ? "scale-105 border-white bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              : `${category.color} border-white/10 text-white hover:-translate-y-0.5 hover:brightness-125`
        }`}
      >
        {seat.number}
      </button>
    );
  };

  const renderSection = (
    rowSeats: Seat[],
    start: number,
    end: number
  ) => (
    <div className="flex shrink-0 gap-1 sm:gap-1.5">
      {rowSeats
        .filter((seat) => seat.number >= start && seat.number <= end)
        .map(renderSeat)}
    </div>
  );

  return (
    <div className="w-full py-4 text-white sm:py-6">
      {/* Heading */}
      <div className="mb-8">
        <Link
          href={`/booking/${encodeURIComponent(cinemaID)}?${searchParams.toString()}`}
          className="inline-block text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to showtimes
        </Link>

        <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
          Select Your Seats
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Choose your seats. Prices vary by seating category.
        </p>
      </div>

      {/* Screen */}
      <div className="mb-10 px-2 sm:px-8">
        <div className="h-10 rounded-t-[50%] border-t-4 border-purple-400 bg-gradient-to-b from-purple-500/20 to-transparent shadow-[0_-8px_25px_rgba(168,85,247,0.15)] sm:h-12" />

        <p className="-mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-purple-200 sm:text-xs">
          Screen This Way
        </p>
      </div>

      {/* Seating layout */}
      <div className="w-full overflow-x-auto pb-5">
        <div className="mx-auto min-w-[1100px] max-w-[1500px]">
          {/* Seating block labels */}
          <div className="mb-3 flex items-center gap-2">
            <div className="w-7 shrink-0" />

            <div className="flex flex-1 justify-between px-1">
              <span className="w-[calc(8*2.25rem)] text-center text-xs text-gray-500">
                Seats 1–8
              </span>
              <span className="w-[calc(14*2.25rem)] text-center text-xs text-gray-500">
                Seats 9–22
              </span>
              <span className="w-[calc(8*2.25rem)] text-center text-xs text-gray-500">
                Seats 23–30
              </span>
            </div>

            <div className="w-7 shrink-0" />
          </div>

          {ROWS.map((row) => {
            const rowSeats = seats.filter((seat) => seat.row === row);
            const category = CATEGORY_BY_ROW[row];

            const extraRowSpacing =
              category === "Recliner" ||
              category === "Extra Legroom";

            return (
              <div
                key={row}
                className={`flex items-center gap-2 ${
                  extraRowSpacing ? "mb-5" : "mb-2"
                }`}
              >
                {/* Left row label */}
                <span className="w-7 shrink-0 text-center text-sm font-semibold text-gray-300">
                  {row}
                </span>

                {/* Left seating block: seats 1–8 */}
                {renderSection(rowSeats, 1, 8)}

                {/* First aisle */}
                <div className="flex w-10 shrink-0 items-center justify-center">
                  {["A", "F", "K", "M", "O"].includes(row) && (
                    <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 [writing-mode:vertical-rl]">
                      Aisle
                    </span>
                  )}
                </div>

                {/* Center seating block: seats 9–22 */}
                {renderSection(rowSeats, 9, 22)}

                {/* Second aisle */}
                <div className="flex w-10 shrink-0 items-center justify-center">
                  {["A", "F", "K", "M", "O"].includes(row) && (
                    <span className="text-[9px] uppercase tracking-[0.15em] text-gray-500 [writing-mode:vertical-rl]">
                      Aisle
                    </span>
                  )}
                </div>

                {/* Right seating block: seats 23–30 */}
                {renderSection(rowSeats, 23, 30)}

                {/* Right row label */}
                <span className="w-7 shrink-0 text-center text-sm font-semibold text-gray-300">
                  {row}
                </span>
              </div>
            );
          })}

          {/* Seat numbers */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-7 shrink-0" />

            <div className="flex gap-1 sm:gap-1.5">
              {Array.from({ length: 8 }, (_, index) => index + 1).map(
                (number) => (
                  <span
                    key={number}
                    className="flex h-5 w-7 items-center justify-center text-xs text-gray-400 sm:w-8 lg:w-9"
                  >
                    {number}
                  </span>
                )
              )}
            </div>

            <div className="w-10 shrink-0" />

            <div className="flex gap-1 sm:gap-1.5">
              {Array.from({ length: 14 }, (_, index) => index + 9).map(
                (number) => (
                  <span
                    key={number}
                    className="flex h-5 w-7 items-center justify-center text-xs text-gray-400 sm:w-8 lg:w-9"
                  >
                    {number}
                  </span>
                )
              )}
            </div>

            <div className="w-10 shrink-0" />

            <div className="flex gap-1 sm:gap-1.5">
              {Array.from({ length: 8 }, (_, index) => index + 23).map(
                (number) => (
                  <span
                    key={number}
                    className="flex h-5 w-7 items-center justify-center text-xs text-gray-400 sm:w-8 lg:w-9"
                  >
                    {number}
                  </span>
                )
              )}
            </div>

            <div className="w-7 shrink-0" />
          </div>
        </div>
      </div>

      <p className="mt-1 text-center text-xs text-gray-500">
        Scroll horizontally to view the entire seating layout on smaller screens.
      </p>

      {/* Seat category legend */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-6">
        <h3 className="mb-5 text-sm font-semibold text-gray-200">
          Seat Categories
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {(
            Object.entries(CATEGORY_CONFIG) as [
              SeatCategory,
              (typeof CATEGORY_CONFIG)[SeatCategory],
            ][]
          ).map(([category, config]) => (
            <div key={category} className="flex items-start gap-3">
              <span
                className={`mt-1 h-5 w-5 shrink-0 rounded-md border border-white/10 ${config.color}`}
              />

              <div>
                <p className="text-sm font-medium text-white">{category}</p>

                <p className="mt-1 text-sm font-semibold text-purple-300">
                  ₹{config.price}{" "}
                  <span className="font-normal text-gray-400">/ seat</span>
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-400">
                  {config.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Seat status legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-white/10 bg-slate-600" />
            Available
          </div>

          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-white bg-purple-600" />
            Selected
          </div>

          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded border border-red-900 bg-red-800" />
            Occupied
          </div>
        </div>
      </div>

      {/* Booking summary */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#18181f]/95 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white">
              Your Selection
            </h3>

            {selectedSeatDetails.length > 0 ? (
              <>
                <p className="mt-2 break-words text-sm text-gray-300">
                  Selected seats:{" "}
                  <span className="font-medium text-white">
                    {selectedSeats.join(", ")}
                  </span>
                </p>

                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedSeatDetails.map((seat) => (
                    <div
                      key={seat.id}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-gray-400">
                        {seat.id} · {seat.category}
                      </span>

                      <span className="font-medium text-white">
                        ₹{seat.price}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                No seats selected yet. Choose seats from the map above.
              </p>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 lg:min-w-52 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 lg:text-right">
            <p className="text-sm text-gray-400">
              {selectedSeats.length}{" "}
              {selectedSeats.length === 1 ? "seat" : "seats"}
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              ₹{total}
            </p>

            <button
              type="button"
              onClick={handleContinue}
              disabled={selectedSeats.length === 0}
              className="mt-4 w-full rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to Checkout →
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        Seat availability and prices are demonstration data. No real tickets
        are being reserved.
      </p>
    </div>
  );
}

