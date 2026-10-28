"use client";

import { useEffect, useRef } from "react";
import { saveBooking } from "@/lib/bookings";

interface BookingConfirmationClientProps {
  bookingId: string;
  movieId: string;
  cinemaID: string;
  cinemaName: string;
  showtimeId: string;
  date: string;
  seats: string[];
  total: number;
  paymentMethod: string;
}

export default function BookingConfirmationClient({
  bookingId,
  movieId,
  cinemaID,
  cinemaName,
  showtimeId,
  date,
  seats,
  total,
  paymentMethod,
}: BookingConfirmationClientProps) {
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) {
      return;
    }

    hasSaved.current = true;

    const existingBooking = JSON.parse(
      localStorage.getItem("imovies-bookings") ?? "[]"
    ) as { bookingId?: string }[];

    if (existingBooking.some((booking) => booking.bookingId === bookingId)) {
      return;
    }

    saveBooking({
      bookingId,
      movieId,
      cinemaId: cinemaID,
      cinemaName,
      showtimeId,
      date,
      seats,
      total,
      paymentMethod,
      status: "confirmed",
      bookedAt: new Date().toISOString(),
    });
  }, [
    bookingId,
    movieId,
    cinemaID,
    cinemaName,
    showtimeId,
    date,
    seats,
    total,
    paymentMethod,
  ]);

  return null;
}

