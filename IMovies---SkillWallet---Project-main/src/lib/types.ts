export interface Movie {
id: number;
title: string;
overview: string;
poster_path: string | null;
backdrop_path: string | null;
release_date: string;
vote_average: number;
genre_ids: number[];
}

export interface TMDBMovieResponse {
page: number;
results: Movie[];
total_pages: number;
total_results: number;
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  genres: {
    id: number;
    name: string;
  }[];
  status: string;
  tagline: string;
}

export interface MovieVideo {
id: string;
key: string;
name: string;
site: string;
type: string;
official: boolean;
}


