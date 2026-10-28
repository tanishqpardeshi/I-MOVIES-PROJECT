import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { getMovieDetails, getMovieVideos } from "@/lib/tmdb";
import type { MovieDetails, MovieVideo } from "@/lib/types";
import WatchlistButton from "@/components/WatchlistButton";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  let movie: MovieDetails | null;
let videos: MovieVideo[] = [];


try {
  movie = await getMovieDetails(id);

  try {
    videos = await getMovieVideos(id);
  } catch (videoError) {
    console.error("Failed to load movie trailers:", videoError);
    videos = [];
  }
} catch (error) {
  console.error("Failed to load movie details:", error);
  throw error;
}


  if (!movie) {
    notFound();
  }

  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : null;

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : null;

  const trailer = videos.find(
  (video) =>
    video.site === "YouTube" &&
    video.type === "Trailer" &&
    video.official
) ?? videos.find(
  (video) =>
    video.site === "YouTube" &&
    video.type === "Trailer"
);

  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "Release date unavailable";

  const formattedRuntime =
    movie.runtime && movie.runtime > 0
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : "Runtime unavailable";

  return (
    <main className="min-h-screen bg-[#101014] text-[#F5F3F7]">
      <header className="relative z-10 border-b border-white/[0.08]">
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

      <section className="relative isolate overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-[#101014] via-[#101014]/90 to-[#101014]/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-transparent to-[#101014]/40" />

        <div className="page-container relative py-12 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-[280px_1fr] md:gap-14">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#222129] shadow-2xl">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  fill
                  priority
                  sizes="(max-width: 768px) 80vw, 280px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-[#A5A1AD]">
                  Poster unavailable
                </div>
              )}
            </div>

            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Movie Details
              </p>

              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mt-4 text-lg italic text-[#C4B5FD]">
                  {movie.tagline}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-[#D0CDD6]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={17} className="text-violet-300" />
                  {releaseYear}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Clock3 size={17} className="text-violet-300" />
                  {formattedRuntime}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Star
                    size={17}
                    className="fill-yellow-400 text-yellow-400"
                  />
                  {movie.vote_average > 0
                    ? `${movie.vote_average.toFixed(1)} / 10`
                    : "Not rated"}
                </span>
              </div>

              {movie.genres.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs font-medium text-violet-200"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

<div className="mt-6 flex flex-wrap items-center gap-3">
  <WatchlistButton
    movie={{
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genres.map((genre) => genre.id),
    }}
  />

  <Link
    href={`/booking?movieId=${movie.id}`}
    className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
  >
    Book Tickets
  </Link>
</div>


              <div className="mt-10">
                <h2 className="text-xl font-bold">Overview</h2>

                <p className="mt-4 text-sm leading-7 text-[#C2BEC9] sm:text-base">
                  {movie.overview || "No overview is available for this movie."}
                </p>
              </div>
            </div>
          </div>
        </div>
  </section>

  <section className="page-container py-12 md:py-16">
    <div className="mb-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
        Watch Now
      </p>

      <h2 className="text-2xl font-bold sm:text-3xl">
        Official Trailer
      </h2>

      <p className="mt-3 text-sm text-[#A5A1AD]">
        Get a preview of {movie.title}.
      </p>
    </div>

    {trailer ? (
      <div className="mx-auto aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#17171D] shadow-2xl">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}`}
          title={`${movie.title} trailer`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    ) : (
      <div className="surface-card mx-auto flex min-h-48 max-w-5xl items-center justify-center rounded-2xl p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-white">
            Trailer unavailable
          </p>

          <p className="mt-2 text-sm text-[#A5A1AD]">
            We couldn't find a YouTube trailer for this movie.
          </p>
        </div>
      </div>
    )}
  </section>
</main>

  );
}