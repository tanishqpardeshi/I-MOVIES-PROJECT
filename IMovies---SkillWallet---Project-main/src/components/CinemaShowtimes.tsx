"use client";

import { useState } from "react";
import Link from "next/link";
import DateSelector from "@/components/DateSelector";

interface CinemaShowtime {
  id: string;
  time: string;
  format: string;
}

interface CinemaShowtimesProps {
  cinemaID: string;
  movieId: string;
  showtimes: CinemaShowtime[];
}

export default function CinemaShowtimes({
  cinemaID,
  movieId,
  showtimes,
}: CinemaShowtimesProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  });

  return (
    <>
      <section className="mt-10 rounded-2xl border border-white/10 bg-[#17171D] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Select a date</h2>
            <p className="mt-2 text-sm text-[#A5A1AD]">
              Choose a date to explore the available demo showtimes.
            </p>
          </div>

          <span className="w-fit rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
            Demo showtimes
          </span>
        </div>

        <DateSelector onDateChange={setSelectedDate} />
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Available showtimes</h2>

        <p className="mt-3 text-sm text-[#A5A1AD]">
          Sample ticket price: demo pricing. Actual prices and schedules
          are not yet connected to a cinema provider.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {showtimes.map((showtime) => (
            <Link
              key={showtime.id}
              href={`/booking/${cinemaID}/seats?movieId=${encodeURIComponent(movieId)}&showtimeId=${encodeURIComponent(showtime.id)}&date=${encodeURIComponent(selectedDate)}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#17171D] p-5 transition hover:border-violet-400/50 hover:bg-[#1B1A22]"
            >
              <div>
                <p className="text-lg font-semibold group-hover:text-violet-200">
                  {showtime.time}
                </p>

                <p className="mt-2 text-sm text-[#A5A1AD]">
                  {showtime.format} · Demo schedule
                </p>
              </div>

              <span className="text-sm font-semibold text-violet-300">
                Select →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-4 text-sm text-[#A5A1AD]">
          Selected date: {selectedDate}
        </p>
      </section>
    </>
  );
}

