import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const movie = await getMovieDetails(id);

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch movie details:", error);

    return NextResponse.json(
      { error: "Failed to load movie details" },
      { status: 500 }
    );
  }
}

