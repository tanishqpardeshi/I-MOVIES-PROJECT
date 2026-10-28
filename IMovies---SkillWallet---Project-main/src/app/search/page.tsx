import Link from "next/link";
import { Search } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import { searchMovies } from "@/lib/tmdb";

interface SearchPageProps {
searchParams: {
q?: string;
};
}

export default async function SearchPage({
searchParams,
}: SearchPageProps) {
const query = searchParams.q?.trim() ?? "";

const movieData = query ? await searchMovies(query) : null;
const movies = movieData?.results ?? [];

return ( <main className="min-h-screen bg-[#101014] text-[#F5F3F7]"> <header className="border-b border-white/[0.08]"> <nav className="page-container flex h-20 items-center justify-between"> <Link href="/" className="text-2xl font-black tracking-tight">
i<span className="text-violet-400">Movies</span> </Link>

      <Link
        href="/"
        className="text-sm text-[#A5A1AD] transition hover:text-white"
      >
        Back to Home
      </Link>
    </nav>
  </header>

  <section className="page-container py-12 md:py-16">
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
        Find your next favourite
      </p>

      <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
        Search Movies
      </h1>

      <p className="mt-4 text-[#A5A1AD]">
        Search for movies by title and discover your next cinema experience.
      </p>

      <form action="/search" method="GET" className="mt-8">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#17171D] p-2 transition focus-within:border-violet-400/60">
          <Search
            size={21}
            className="ml-3 shrink-0 text-[#A5A1AD]"
          />

          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search for a movie..."
            aria-label="Search movies by title"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#77727F]"
          />

          <button
            type="submit"
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold transition hover:bg-violet-400"
          >
            Search
          </button>
        </div>
      </form>
    </div>

    <div className="mt-14">
      {query ? (
        <>
          <h2 className="mb-7 text-2xl font-bold">
            Results for &ldquo;{query}&rdquo;
          </h2>

          {movies.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="surface-card py-16 text-center">
              <p className="text-lg font-semibold">No movies found</p>
              <p className="mt-2 text-sm text-[#A5A1AD]">
                Try another movie title.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="surface-card py-16 text-center">
          <Search className="mx-auto text-violet-400" size={32} />
          <p className="mt-4 text-lg font-semibold">
            What would you like to watch?
          </p>
          <p className="mt-2 text-sm text-[#A5A1AD]">
            Enter a movie title above to get started.
          </p>
        </div>
      )}
    </div>
  </section>
</main>
);
}
