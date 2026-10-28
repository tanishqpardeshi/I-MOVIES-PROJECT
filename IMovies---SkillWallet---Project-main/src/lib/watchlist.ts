import type { Movie } from "./types";

const WATCHLIST_KEY = "imovies-watchlist";

export function getWatchlist(): Movie[] {
if (typeof window === "undefined") {
return [];
}

try {
const storedMovies = localStorage.getItem(WATCHLIST_KEY);


if (!storedMovies) {
  return [];
}

const parsedMovies: unknown = JSON.parse(storedMovies);

if (!Array.isArray(parsedMovies)) {
  return [];
}

return parsedMovies as Movie[];


} catch {
return [];
}
}

export function addToWatchlist(movie: Movie): Movie[] {
const currentWatchlist = getWatchlist();

const alreadyExists = currentWatchlist.some(
(item) => item.id === movie.id
);

if (alreadyExists) {
return currentWatchlist;
}

const updatedWatchlist = [...currentWatchlist, movie];

localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));

return updatedWatchlist;
}

export function removeFromWatchlist(movieId: number): Movie[] {
const updatedWatchlist = getWatchlist().filter(
(movie) => movie.id !== movieId
);

localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedWatchlist));

return updatedWatchlist;
}

export function isInWatchlist(movieId: number): boolean {
return getWatchlist().some((movie) => movie.id === movieId);
}
