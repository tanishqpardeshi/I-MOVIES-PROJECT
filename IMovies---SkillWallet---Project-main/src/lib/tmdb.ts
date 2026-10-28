import type { TMDBMovieResponse, MovieVideo } from "./types";


const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function getPopularMovies(): Promise<TMDBMovieResponse> {
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
throw new Error("TMDB_API_KEY is missing from .env.local");
}

const response = await fetch(
`${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}`,
{
next: { revalidate: 3600 },
}
);

if (!response.ok) {
throw new Error(`TMDB API request failed: ${response.status}`);
}

const data: unknown = await response.json();

return data as TMDBMovieResponse;
}

export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDBMovieResponse> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing from .env.local");
  }

  const trimmedQuery = query.trim();
  const safePage = Number.isFinite(page)
    ? Math.max(1, Math.floor(page))
    : 1;

  if (!trimmedQuery) {
    return {
      page: safePage,
      results: [],
      total_pages: 0,
      total_results: 0,
    };
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query: trimmedQuery,
    include_adult: "false",
    language: "en-US",
    page: String(safePage),
  });

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?${params.toString()}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`TMDB movie search failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  return data as TMDBMovieResponse;
}




// Keep your existing functions above this point.

export async function getMovieDetails(movieId: string) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing from .env.local");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
  });

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${encodeURIComponent(movieId)}?${params.toString()}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`TMDB movie details request failed: ${response.status}`);
  }

  return response.json();
}

export interface MovieGenre {
  id: number;
  name: string;
}

export async function getMovieGenres(): Promise<MovieGenre[]> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing from .env.local");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
  });

  const response = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?${params.toString()}`,
    {
      next: { revalidate: 86400 },
    }
  );

  if (!response.ok) {
    throw new Error(`TMDB genre request failed: ${response.status}`);
  }

  const data: { genres: MovieGenre[] } = await response.json();

  return data.genres;
}

export async function getMovieVideos(movieId: string): Promise<MovieVideo[]> {
const apiKey = process.env.TMDB_API_KEY;

if (!apiKey) {
throw new Error("TMDB_API_KEY is missing from .env.local");
}

const params = new URLSearchParams({
api_key: apiKey,
language: "en-US",
});

const response = await fetch(
`${TMDB_BASE_URL}/movie/${encodeURIComponent(movieId)}/videos?${params.toString()}`,
{
next: { revalidate: 3600 },
}
);

if (!response.ok) {
throw new Error(`TMDB movie videos request failed: ${response.status}`);
}

const data: { results: MovieVideo[] } = await response.json();

return data.results;
}

export interface MovieDiscoveryFilters {
  genreId?: number;
  minRating?: number;
  maxRating?: number;
  yearFrom?: number;
  yearTo?: number;
  language?: string;
  minVotes?: number;
  sortBy?: string;
  page?: number;
}

export async function discoverMovies(
  filters: MovieDiscoveryFilters = {}
): Promise<TMDBMovieResponse> {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is missing from .env.local");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
    include_adult: "false",
    page: String(filters.page ?? 1),
    sort_by: filters.sortBy ?? "popularity.desc",
  });

  if (filters.genreId !== undefined) {
    params.set("with_genres", String(filters.genreId));
  }

  if (filters.minRating !== undefined) {
    params.set("vote_average.gte", String(filters.minRating));
  }

  if (filters.maxRating !== undefined) {
    params.set("vote_average.lte", String(filters.maxRating));
  }

  if (filters.minVotes !== undefined) {
    params.set("vote_count.gte", String(filters.minVotes));
  }

  if (filters.language) {
    params.set("with_original_language", filters.language);
  }

  if (filters.yearFrom !== undefined) {
    params.set("primary_release_date.gte", `${filters.yearFrom}-01-01`);
  }

  if (filters.yearTo !== undefined) {
    params.set("primary_release_date.lte", `${filters.yearTo}-12-31`);
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/discover/movie?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(
      `TMDB movie discovery failed: ${response.status}`
    );
  }

  const data: unknown = await response.json();

  return data as TMDBMovieResponse;
}