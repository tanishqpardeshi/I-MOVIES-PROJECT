"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bookmark, Film } from "lucide-react";
import type { Movie } from "@/lib/types";
import { getWatchlist, removeFromWatchlist } from "@/lib/watchlist";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export default function WatchlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMovies(getWatchlist());
    setMounted(true);
  }, []);

  function handleRemove(movieId: number) {
    removeFromWatchlist(movieId);
    setMovies((currentMovies) =>
      currentMovies.filter((movie) => movie.id !== movieId)
    );
  }

  return (
    <main className="min-h-screen bg-[#101014] text-[#F5F3F7]">
      <header className="border-b border-white/[0.08]">
        <nav className="page-container flex h-20 items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            i<span className="text-violet-400">Movies</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#A5A1AD] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </nav>
      </header>

      <section className="page-container py-12 md:py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
            Your Collection
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            My Watchlist
          </h1>

          <p className="mt-4 text-sm text-[#A5A1AD] sm:text-base">
            Keep track of the movies you want to watch.
          </p>
        </div>

        {!mounted ? (
          <p className="text-sm text-[#A5A1AD]">Loading your watchlist...</p>
        ) : movies.length === 0 ? (
          <div className="surface-card flex min-h-72 flex-col items-center justify-center rounded-2xl p-8 text-center">
            <Bookmark size={38} className="mb-5 text-violet-300" />

            <h2 className="text-xl font-bold">Your watchlist is empty</h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#A5A1AD]">
              When you find a movie you like, add it to your watchlist and
              it will appear here.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              <Film size={17} />
              Explore Movies
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-[#A5A1AD]">
              {movies.length} {movies.length === 1 ? "movie" : "movies"} saved
            </p>

            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {movies.map((movie) => {
                const posterUrl = movie.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
                  : null;

                return (
                  <article
                    key={movie.id}
                    className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17171D]"
                  >
                    <Link href={`/movie/${movie.id}`} className="block">
                      <div className="relative aspect-[2/3] overflow-hidden bg-[#222129]">
                        {posterUrl ? (
                          <Image
  src={posterUrl}
  alt={`${movie.title} poster`}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
  className="object-cover transition duration-500 group-hover:scale-105"
/>
                        ) : (
                          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#A5A1AD]">
                            Poster unavailable
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/movie/${movie.id}`}>
                        <h2 className="line-clamp-2 min-h-12 font-semibold text-white transition hover:text-violet-300">
                          {movie.title}
                        </h2>
                      </Link>

                      <p className="mt-2 text-sm text-[#A5A1AD]">
                        {movie.release_date
                          ? movie.release_date.slice(0, 4)
                          : "Year unavailable"}
                        {" · "}
                        ★ {movie.vote_average.toFixed(1)}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleRemove(movie.id)}
                        className="mt-4 w-full rounded-full border border-white/15 px-3 py-2 text-sm font-medium text-[#D0CDD6] transition hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

