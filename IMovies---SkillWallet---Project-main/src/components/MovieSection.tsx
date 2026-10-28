import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import { ArrowRight } from "lucide-react";

interface MovieSectionProps {
title: string;
subtitle: string;
movies: Movie[];
}

export default function MovieSection({
title,
subtitle,
movies,
}: MovieSectionProps) {
return ( <section className="page-container py-10"> <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"> <div> <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
Now showing </p>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-[#A5A1AD] sm:text-base">
        {subtitle}
      </p>
    </div>

    <button
      type="button"
      className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-violet-300 transition hover:text-white"
    >
      View all
      <ArrowRight size={17} />
    </button>
  </div>

  {movies.length > 0 ? (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  ) : (
    <div className="surface-card flex min-h-40 items-center justify-center p-6 text-center text-[#A5A1AD]">
      No movies are available right now.
    </div>
  )}
</section>
);
}
