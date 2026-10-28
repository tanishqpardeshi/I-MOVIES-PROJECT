
import { NextRequest, NextResponse } from "next/server";
import { discoverMovies, searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const query = params.get("query")?.trim();
    const pageParam = Number(params.get("page") || "1");
    const page = Number.isFinite(pageParam)
      ? Math.max(1, Math.floor(pageParam))
      : 1;

    // Search movies by title and support pagination.
    if (query) {
      const results = await searchMovies(query, page);
      return NextResponse.json(results);
    }

    const genreId = params.get("genreId");
    const minRating = params.get("minRating");
    const yearFrom = params.get("yearFrom");
    const yearTo = params.get("yearTo");
    const language = params.get("language");
    const sortBy = params.get("sortBy");

    const movies = await discoverMovies({
      genreId: genreId ? Number(genreId) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      yearFrom: yearFrom ? Number(yearFrom) : undefined,
      yearTo: yearTo ? Number(yearTo) : undefined,
      language: language || undefined,
      sortBy: sortBy || "popularity.desc",
      page,
    });

    return NextResponse.json(movies);
  } catch (error) {
    console.error("Movie discovery error:", error);

    return NextResponse.json(
      { error: "Failed to fetch movies." },
      { status: 500 }
    );
  }
}

