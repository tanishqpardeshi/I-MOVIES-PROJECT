export interface Booking {
  bookingId: string;
  movieId: string;
  cinemaId: string;
  cinemaName: string;
  showtimeId: string;
  date: string;
  seats: string[];
  total: number;
  paymentMethod: string;
  status: "confirmed" | "cancelled";
  bookedAt: string;
}

const BOOKINGS_STORAGE_KEY = "imovies-bookings";

export function getBookings(): Booking[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);

    if (!storedBookings) {
      return [];
    }

    const parsedBookings: unknown = JSON.parse(storedBookings);

    if (!Array.isArray(parsedBookings)) {
      return [];
    }

    return parsedBookings as Booking[];
  } catch {
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  if (typeof window === "undefined") {
    return;
  }

  const existingBookings = getBookings();

  localStorage.setItem(
    BOOKINGS_STORAGE_KEY,
    JSON.stringify([booking, ...existingBookings])
  );

  window.dispatchEvent(new Event("bookings-updated"));
}

export function cancelBooking(bookingId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const updatedBookings = getBookings().map((booking) =>
    booking.bookingId === bookingId
      ? { ...booking, status: "cancelled" as const }
      : booking
  );

  localStorage.setItem(
    BOOKINGS_STORAGE_KEY,
    JSON.stringify(updatedBookings)
  );

  window.dispatchEvent(new Event("bookings-updated"));
}