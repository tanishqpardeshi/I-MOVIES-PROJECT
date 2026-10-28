"use client";

import { useState } from "react";
import type { MovieGenre } from "@/lib/tmdb";

interface GenreFilterProps {
  genres: MovieGenre[];
  onGenreChange: (genreId: number | null) => void;
}

export default function GenreFilter({
  genres,
  onGenreChange,
}: GenreFilterProps) {
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  function handleGenreClick(genreId: number | null) {
    setSelectedGenre(genreId);
    onGenreChange(genreId);
  }

  const buttonClass = (isActive: boolean) =>
    `whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition ${
      isActive
        ? "border-violet-400 bg-violet-500 text-white"
        : "border-white/10 bg-[#17171D] text-[#A5A1AD] hover:border-violet-400/50 hover:text-white"
    }`;

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-3"
      aria-label="Filter movies by genre"
    >
      <button
        type="button"
        onClick={() => handleGenreClick(null)}
        aria-pressed={selectedGenre === null}
        className={buttonClass(selectedGenre === null)}
      >
        All Movies
      </button>

      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => handleGenreClick(genre.id)}
          aria-pressed={selectedGenre === genre.id}
          className={buttonClass(selectedGenre === genre.id)}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}

