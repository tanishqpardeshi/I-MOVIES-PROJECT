"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWatchlist } from "@/lib/watchlist";

export default function WatchlistNavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(getWatchlist().length);
    }

    updateCount();

    window.addEventListener("watchlist-updated", updateCount);

    return () => {
      window.removeEventListener("watchlist-updated", updateCount);
    };
  }, []);

  return (
    <Link href="/watchlist" className="transition hover:text-white">
      Watchlist
      {count > 0 && (
        <span className="ml-1 text-violet-300">({count})</span>
      )}
    </Link>
  );
}

