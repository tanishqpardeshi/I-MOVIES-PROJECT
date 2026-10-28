
"use client";

import { useState } from "react";

interface DateSelectorProps {
  onDateChange?: (date: string) => void;
}

export default function DateSelector({
  onDateChange,
}: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState(0);

  const dates = Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      value,
      day:
        index === 0
          ? "Today"
          : date.toLocaleDateString("en-IN", {
              weekday: "short",
            }),
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    };
  });

  function handleDateChange(index: number) {
    setSelectedDate(index);
    onDateChange?.(dates[index].value);
  }

  return (
    <div>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {dates.map((date, index) => (
          <button
            key={date.value}
            type="button"
            onClick={() => handleDateChange(index)}
            aria-pressed={selectedDate === index}
            className={`rounded-xl border p-3 text-center transition ${
              selectedDate === index
                ? "border-violet-400/50 bg-violet-500/15"
                : "border-white/10 bg-white/[0.03] hover:border-violet-400/30"
            }`}
          >
            <span className="block text-xs text-[#A5A1AD]">
              {date.day}
            </span>

            <span className="mt-2 block font-semibold">
              {date.label}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-[#A5A1AD]" aria-live="polite">
        Selected date: {dates[selectedDate].value}
      </p>
    </div>
  );
}

