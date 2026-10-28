"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof Smartphone;
}[] = [
  {
    id: "upi",
    label: "UPI",
    description: "Google Pay, PhonePe, or UPI ID",
    icon: Smartphone,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, or RuPay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "Pay through your bank",
    icon: Building2,
  },
  {
    id: "wallet",
    label: "Wallet",
    description: "Choose your preferred wallet",
    icon: Wallet,
  },
];

interface PaymentSectionProps {
  totalAmount: number;
  movieId: string;
  cinemaID: string;
  cinemaName: string;
  showtimeId: string;
  date: string;
  seats: string[];
}

interface BookingResult {
  booking_id: string;
  booking_reference: string;
  total_amount: number;
  booking_status: "demo_confirmed";
}

export default function PaymentSection({
  totalAmount,
  movieId,
  cinemaID,
  cinemaName,
  showtimeId,
  date,
  seats,
}: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function handleBooking() {
    if (isProcessing) return;

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Require a valid authenticated session.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const next = `/booking/${encodeURIComponent(
          cinemaID
        )}/checkout?${new URLSearchParams({
          movieId,
          showtimeId,
          date,
          seats: seats.join(","),
        }).toString()}`;

        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      if (
        !movieId ||
        !cinemaID ||
        !cinemaName ||
        !showtimeId ||
        !date ||
        seats.length === 0
      ) {
        throw new Error("Some booking details are missing. Please select your seats again.");
      }

      // The database validates seats and calculates the authoritative total.
      const { data, error } = await supabase.rpc("create_demo_booking", {
        p_movie_id: movieId,
        p_cinema_id: cinemaID,
        p_cinema_name: cinemaName,
        p_showtime_id: showtimeId,
        p_show_date: date,
        p_seats: seats,
        p_payment_method: selectedMethod,
      });

      if (error) {
        const message = error.message ?? "";

        if (
          message.toLowerCase().includes("duplicate key") ||
          message.toLowerCase().includes("unique_seat") ||
          message.toLowerCase().includes("already booked")
        ) {
          throw new Error(
            "One or more selected seats have just been booked. Please return to seat selection and choose different seats."
          );
        }

        if (
          message.toLowerCase().includes("seat") &&
          message.toLowerCase().includes("unavailable")
        ) {
          throw new Error(
            "One or more selected seats are unavailable. Please choose different seats."
          );
        }

        if (message.toLowerCase().includes("authentication required")) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        throw new Error(message || "Could not create your booking. Please try again.");
      }

      const booking = data as BookingResult | null;

      if (
        !booking?.booking_id ||
        !booking.booking_reference ||
        typeof booking.total_amount !== "number"
      ) {
        throw new Error(
          "The booking response was incomplete. Please check My Bookings before trying again."
        );
      }

      // Pass the persisted database ID, not a randomly generated browser ID.
      const query = new URLSearchParams({
        bookingId: booking.booking_id,
      });

      router.push(`/booking/confirmation?${query.toString()}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your booking."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#17171D] p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Payment method</h2>

      <p className="mt-2 text-sm text-[#A5A1AD]">
        Choose how you would like to pay.
      </p>

      <div className="mt-6 space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              aria-pressed={isSelected}
              disabled={isProcessing}
              className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? "border-violet-400 bg-violet-500/10"
                  : "border-white/10 bg-[#101014] hover:border-white/20"
              }`}
            >
              <Icon className="h-6 w-6 shrink-0 text-violet-300" />

              <span className="flex-1">
                <span className="block font-medium">
                  {method.label}
                </span>
                <span className="mt-1 block text-sm text-[#A5A1AD]">
                  {method.description}
                </span>
              </span>

              {isSelected && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-violet-300" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200">
        Demo only: selecting a payment method will not charge you or initiate
        a real transaction. This creates a simulated booking record.
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <p className="mt-4 text-sm text-[#A5A1AD]">
        Selected method:{" "}
        <span className="font-medium text-white">
          {paymentMethods.find((method) => method.id === selectedMethod)?.label}
        </span>
      </p>

      <button
        type="button"
        onClick={handleBooking}
        disabled={isProcessing}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-4 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isProcessing ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Creating booking...
          </>
        ) : (
          `Confirm Demo Booking · ₹${totalAmount}`
        )}
      </button>
    </section>
  );
}

