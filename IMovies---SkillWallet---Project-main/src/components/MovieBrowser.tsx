"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

import type { Movie, TMDBMovieResponse } from "@/lib/types";
import type { MovieGenre } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";

interface MovieBrowserProps {
  initialMovies: Movie[];
  genres: MovieGenre[];
}

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popularity.desc" },
  { label: "Highest Rated", value: "vote_average.desc" },
  { label: "Lowest Rated", value: "vote_average.asc" },
  { label: "Newest First", value: "primary_release_date.desc" },
  { label: "Oldest First", value: "primary_release_date.asc" },
  { label: "Title: A–Z", value: "title.asc" },
  { label: "Title: Z–A", value: "title.desc" },
  { label: "Highest Revenue", value: "revenue.desc" },
];

const LANGUAGE_OPTIONS = [
  { label: "All Languages", value: "" },
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "French", value: "fr" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "Chinese", value: "zh" },
];

export default function MovieBrowser({
  initialMovies,
  genres,
}: MovieBrowserProps) {
  const [movies, setMovies] = useState<Movie[]>(() =>
    Array.isArray(initialMovies) ? initialMovies : []
  );
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [minRating, setMinRating] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [language, setLanguage] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("sortBy", sortBy);

        if (searchQuery.trim()) {
          params.set("query", searchQuery.trim());
        } else {
          if (selectedGenre) {
            params.set("genreId", selectedGenre);
          }

          if (minRating) {
            params.set("minRating", minRating);
          }

          if (yearFrom) {
            params.set("yearFrom", yearFrom);
          }

          if (yearTo) {
            params.set("yearTo", yearTo);
          }

          if (language) {
            params.set("language", language);
          }
        }

        const response = await fetch(
          `/api/movies/discover?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load movies right now.");
        }

        const data: TMDBMovieResponse | null = await response.json();
        let results: Movie[] = Array.isArray(data?.results) ? data.results : [];

        // TMDB's title-search endpoint does not accept discovery filters,
        // so apply the selected filters and sorting to the current search page.
        if (searchQuery.trim()) {
          results = results.filter((movie) => {
            const extendedMovie = movie as Movie & {
              original_language?: string;
            };
            const releaseYear = movie.release_date
              ? Number(movie.release_date.slice(0, 4))
              : null;

            if (
              selectedGenre &&
              !(Array.isArray(movie.genre_ids) &&
                movie.genre_ids.includes(Number(selectedGenre)))
            ) {
              return false;
            }

            if (
              minRating &&
              (typeof movie.vote_average !== "number" ||
                movie.vote_average < Number(minRating))
            ) {
              return false;
            }

            if (yearFrom && (releaseYear === null || releaseYear < Number(yearFrom))) {
              return false;
            }

            if (yearTo && (releaseYear === null || releaseYear > Number(yearTo))) {
              return false;
            }

            if (
              language &&
              extendedMovie.original_language !== language
            ) {
              return false;
            }

            return true;
          });

          const getDate = (movie: Movie) =>
            movie.release_date ? new Date(movie.release_date).getTime() : 0;

          results.sort((a, b) => {
            switch (sortBy) {
              case "vote_average.desc":
                return (b.vote_average ?? 0) - (a.vote_average ?? 0);
              case "vote_average.asc":
                return (a.vote_average ?? 0) - (b.vote_average ?? 0);
              case "primary_release_date.desc":
                return getDate(b) - getDate(a);
              case "primary_release_date.asc":
                return getDate(a) - getDate(b);
              case "title.asc":
                return (a.title ?? "").localeCompare(b.title ?? "");
              case "title.desc":
                return (b.title ?? "").localeCompare(a.title ?? "");
              case "revenue.desc":
                return (
                  ((b as Movie & { revenue?: number }).revenue ?? 0) -
                  ((a as Movie & { revenue?: number }).revenue ?? 0)
                );
              case "popularity.desc":
              default:
                return (
                  ((b as Movie & { popularity?: number }).popularity ?? 0) -
                  ((a as Movie & { popularity?: number }).popularity ?? 0)
                );
            }
          });
        }

        setMovies(results);
        setTotalPages(
          Math.max(1, Math.min(Number(data?.total_pages) || 1, 500))
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError("We couldn't load the movies. Please try again.");
        setMovies([]);
        setTotalPages(1);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchMovies();

    return () => controller.abort();
  }, [
    searchQuery,
    selectedGenre,
    minRating,
    yearFrom,
    yearTo,
    language,
    sortBy,
    page,
    retryCount,
  ]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearchQuery(query.trim());
  }

  function clearSearch() {
    setQuery("");
    setSearchQuery("");
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setSearchQuery("");
    setSelectedGenre("");
    setMinRating("");
    setYearFrom("");
    setYearTo("");
    setLanguage("");
    setSortBy("popularity.desc");
    setPage(1);
  }

  const hasActiveFilters =
    selectedGenre !== "" ||
    minRating !== "" ||
    yearFrom !== "" ||
    yearTo !== "" ||
    language !== "" ||
    sortBy !== "popularity.desc";

  return (
    <section className="page-container py-10">
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          Your next movie night starts here
        </p>

        <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Discover your next favourite
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A5A1AD]">
          Search, filter, and discover movies from across the world.
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151419] p-2 transition focus-within:border-violet-500/60"
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-gray-400" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies by title..."
          aria-label="Search movies by title"
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-white outline-none placeholder:text-gray-500"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-[#111014] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-violet-400" />

            <h3 className="text-base font-semibold text-white">
              Find your kind of movie
            </h3>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-medium text-violet-400 transition hover:text-violet-300"
          >
            Reset filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Genre */}
          <div>
            <label
              htmlFor="movie-genre"
              className="mb-2 block text-sm text-gray-300"
            >
              Genre
            </label>

            <select
              id="movie-genre"
              value={selectedGenre}
              onChange={(event) => {
                setSelectedGenre(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1A191F] px-3 py-3 text-sm text-white outline-none transition focus:border-violet-500"
            >
              <option value="">All Genres</option>

              {(Array.isArray(genres) ? genres : []).map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum rating */}
          <div>
            <label
              htmlFor="movie-rating"
              className="mb-2 block text-sm text-gray-300"
            >
              Minimum Rating
            </label>

            <select
              id="movie-rating"
              value={minRating}
              onChange={(event) => {
                setMinRating(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1A191F] px-3 py-3 text-sm text-white outline-none transition focus:border-violet-500"
            >
              <option value="">Any Rating</option>
              <option value="5">5+ / 10</option>
              <option value="6">6+ / 10</option>
              <option value="7">7+ / 10</option>
              <option value="8">8+ / 10</option>
              <option value="9">9+ / 10</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="movie-language"
              className="mb-2 block text-sm text-gray-300"
            >
              Language
            </label>

            <select
              id="movie-language"
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1A191F] px-3 py-3 text-sm text-white outline-none transition focus:border-violet-500"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Release year range */}
          <div>
            <label
              htmlFor="year-from"
              className="mb-2 block text-sm text-gray-300"
            >
              Release Year — From
            </label>

            <input
              id="year-from"
              type="number"
              min="1900"
              max="2100"
              placeholder="e.g. 2000"
              value={yearFrom}
              onChange={(event) => {
                setYearFrom(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1A191F] px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="year-to"
              className="mb-2 block text-sm text-gray-300"
            >
              Release Year — To
            </label>

            <input
              id="year-to"
              type="number"
              min="1900"
              max="2100"
              placeholder="e.g. 2026"
              value={yearTo}
              onChange={(event) => {
                setYearTo(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1A191F] px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label
              htmlFor="movie-sort"
              className="mb-2 block text-sm text-gray-300"
            >
              Sort By
            </label>

            <select
              id="movie-sort"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#1A191F] px-3 py-3 text-sm text-white outline-none transition focus:border-violet-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchQuery && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span>
              Searching for{" "}
              <span className="font-medium text-white">
                &quot;{searchQuery}&quot;
              </span>
            </span>

            <button
              type="button"
              onClick={clearSearch}
              className="text-violet-400 hover:text-violet-300"
            >
              Clear search
            </button>
          </div>
        )}

        {searchQuery && hasActiveFilters && (
          <p className="mt-3 text-xs leading-5 text-gray-500">
            Filters and sorting are applied to the results on the current
            search page. Use pagination to check more search results.
          </p>
        )}
      </div>

      {/* Results heading */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {searchQuery ? "Search Results" : "Explore Movies"}
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {loading
              ? "Finding movies for you..."
              : `${movies.length} movies on this page`}
          </p>
        </div>

        {page > 1 && (
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div
          role="status"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className="aspect-[2/3] animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
        >
          <p className="text-sm text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-3 text-sm font-medium text-violet-400 hover:text-violet-300"
          >
            Please try again by changing a filter or searching again.
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && movies.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#111014] px-5 py-14 text-center">
          <Search className="mx-auto mb-4 h-8 w-8 text-gray-500" />

          <h4 className="text-lg font-semibold text-white">
            No movies found
          </h4>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
            Try another title or lower your filters. Search filters are applied to the movies returned on the current page.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Reset filters
          </button>
        </div>
      )}

      {/* Movie grid */}
      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && movies.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Movie results pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page <= 1}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151419] px-4 py-3 text-sm text-white transition hover:border-violet-500/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-sm text-gray-400">
            Page <span className="font-semibold text-white">{page}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((currentPage) => Math.min(totalPages, currentPage + 1))
            }
            disabled={page >= totalPages}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#151419] px-4 py-3 text-sm text-white transition hover:border-violet-500/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </section>
  );
}

