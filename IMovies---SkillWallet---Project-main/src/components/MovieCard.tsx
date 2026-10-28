import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Movie } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : null;

  const releaseYear = movie.release_date
    ? movie.release_date.slice(0, 4)
    : "Coming soon";

return (
  <Link
    href={`/movie/${movie.id}`}
    className="group block min-w-0"
    aria-label={`View details for ${movie.title}`}
  >
    <article>
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#222129]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[#A5A1AD]">
            Poster unavailable
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-sm font-semibold backdrop-blur-md">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />

          <span>
            {movie.vote_average > 0
              ? movie.vote_average.toFixed(1)
              : "NR"}
          </span>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="truncate text-base font-bold transition group-hover:text-violet-300 sm:text-lg">
          {movie.title}
        </h3>

        <p className="mt-1 text-sm text-[#A5A1AD]">{releaseYear}</p>
      </div>
    </article>
  </Link>
);
}