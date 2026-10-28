"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import type { Movie } from "@/lib/types";
import {
  addToWatchlist,
  isInWatchlist,
  removeFromWatchlist,
} from "@/lib/watchlist";

interface WatchlistButtonProps {
  movie: Movie;
}

export default function WatchlistButton({
  movie,
}: WatchlistButtonProps) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSaved(isInWatchlist(movie.id));
    setMounted(true);
  }, [movie.id]);

  function handleToggle() {
    if (saved) {
      removeFromWatchlist(movie.id);
      setSaved(false);
    } else {
      addToWatchlist(movie);
      setSaved(true);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!mounted}
      aria-pressed={saved}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-violet-400/60 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Bookmark
  size={18}
  className={saved ? "fill-current" : ""}
/>

{saved ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}

