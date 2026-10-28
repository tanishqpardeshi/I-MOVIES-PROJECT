import MovieBrowser from "@/components/MovieBrowser";
import { getPopularMovies, getMovieGenres } from "@/lib/tmdb";
import WatchlistNavLink from "@/components/WatchlistNavLink";
import AccountNav from "@/components/AccountNav";
import {
  ArrowRight,
  Clapperboard,
  Search,
  Ticket,
  Sparkles,
} from "lucide-react";

export default async function Home() {
  const [movieData, genres] = await Promise.all([
    getPopularMovies(),
    getMovieGenres(),
  ]);

  const popularMovies = movieData.results;

  return (
    <main className="min-h-screen bg-[#101014] text-[#F5F3F7]">
      {/* Navigation */}
      <header className="border-b border-white/[0.08]">
        <nav className="page-container flex h-20 items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500">
              <Clapperboard size={22} className="text-white" />
            </span>

            <span className="text-2xl font-black tracking-tight">
              i<span className="text-violet-400">Movies</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm text-[#A5A1AD] md:flex">
            <a
              href="/"
              className="text-white transition hover:text-violet-300"
            >
              Home
            </a>

            <a href="#movies" className="transition hover:text-white">
              Movies
            </a>

            <a href="#experience" className="transition hover:text-white">
              Experience
            </a>

            <WatchlistNavLink />
          </div>

          <div className="flex items-center">
  <AccountNav />
</div>
        </nav>
      </header>

      {/* Hero */}
      <section className="page-container py-12 md:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#17171D]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-600/20 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px]" />

          <div className="relative grid min-h-[440px] items-center gap-12 p-8 md:grid-cols-2 md:p-14 lg:p-16">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                <Sparkles size={14} />
                Cinema, reimagined
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Every movie.
                <br />
                A new <span className="text-violet-400">world.</span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-[#A5A1AD] md:text-lg">
                Discover stories worth experiencing. Find your next favourite
                film and make every trip to the cinema unforgettable.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href="#movies"
                  className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3.5 font-semibold transition hover:bg-violet-400"
                >
                  Explore Movies
                  <ArrowRight size={18} />
                </a>

                <a
                  href="#experience"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 font-semibold transition hover:border-violet-400/50 hover:bg-white/[0.04]"
                >
                  <Ticket size={18} />
                  How It Works
                </a>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hidden justify-center md:flex">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/[0.06] lg:h-80 lg:w-80">
                <div className="absolute inset-5 rounded-full border border-white/[0.06]" />

                <div className="absolute inset-10 rounded-full border border-white/[0.06]" />

                <div className="flex h-36 w-36 items-center justify-center rounded-[32px] border border-violet-300/20 bg-gradient-to-br from-violet-500 to-purple-800 shadow-[0_0_80px_rgba(139,92,246,0.3)]">
                  <Clapperboard size={64} strokeWidth={1.2} />
                </div>

                <div className="absolute right-0 top-12 rounded-xl border border-white/10 bg-[#222129] px-4 py-3 shadow-xl">
                  <p className="text-xs text-[#A5A1AD]">Your next escape</p>
                  <p className="mt-1 font-semibold">Starts here.</p>
                </div>

                <div className="absolute bottom-10 left-0 rounded-xl border border-white/10 bg-[#222129] px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} className="text-violet-300" />
                    <span className="text-sm font-semibold">Movie magic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Discovery */}
      <section id="movies" className="pb-12">
        <MovieBrowser initialMovies={popularMovies} genres={genres} />
      </section>

      {/* Experience */}
      <section
        id="experience"
        className="border-t border-white/[0.08] bg-[#141419]"
      >
        <div className="page-container flex flex-col justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold">
              Your next cinema experience awaits.
            </p>

            <p className="mt-2 text-sm text-[#A5A1AD]">
              Discover a better way to find and book your next movie.
            </p>
          </div>

          <a
            href="#movies"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/30 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500/10"
          >
            Start Exploring
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08]">
        <div className="page-container flex flex-col gap-3 py-7 text-xs text-[#A5A1AD] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 IMovies. All rights reserved.</p>
          <p>Made for the love of cinema.</p>
        </div>
      </footer>
    </main>
  );
}

