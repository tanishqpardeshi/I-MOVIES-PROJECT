import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeatMap from "@/components/SeatMap";
import { getMovieDetails } from "@/lib/tmdb";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

interface SeatsPageProps {
params: Promise<{
cinemaID: string;
}>;
searchParams: Promise<{
movieId?: string;
showtimeId?: string;
date?: string;
}>;
}

const cinemas = [
{ id: "kalyan-cinemas", name: "Kalyan Cinemas", price: 150 },
{ id: "odeon-cinemas", name: "Odeon Cinemas", price: 180 },
{ id: "pvr-treasure", name: "PVR: Treasure Island Mall", price: 220 },
{ id: "inox-c21", name: "INOX: C-21 Mall", price: 200 },
{ id: "inox-central", name: "INOX: Nexus Indore Central Mall", price: 200 },
{ id: "miraj-velocity", name: "Miraj Cinemas: Velocity III", price: 180 },
{ id: "inox-phoenix", name: "INOX: Phoenix Citadel Mall", price: 220 },
{ id: "drama-factory", name: "Drama Factory Cinema", price: 180 },
{ id: "rajhans-cinemas", name: "Rajhans Cinemas", price: 200 },
{ id: "sapna-sangeeta", name: "Sapna Sangeeta Lumiere", price: 180 },
{ id: "fundore-cinemas", name: "Fundore Cinemas", price: 150 },
{ id: "mangal-carnival", name: "Mangal Carnival Cinemas", price: 180 },
];

export default async function SeatsPage({
params,
searchParams,
}: SeatsPageProps) {
const { cinemaID } = await params;
const { movieId, showtimeId, date } = await searchParams;

const cinema = cinemas.find((item) => item.id === cinemaID);

if (!cinema) {
notFound();
}

let backdropUrl: string | null = null;

if (movieId && /^\d+$/.test(movieId)) {
try {
const movie = await getMovieDetails(movieId);


  if (movie?.backdrop_path) {
    backdropUrl = `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`;
  }
} catch (error) {
  console.error("Failed to load movie backdrop:", error);
}


}

return ( <main className="relative min-h-screen overflow-hidden bg-[#101014] px-5 py-10 text-[#F5F3F7] sm:px-8 sm:py-14">
{backdropUrl && ( <div className="pointer-events-none fixed inset-0 z-0"> <Image
         src={backdropUrl}
         alt=""
         fill
         priority
         sizes="100vw"
         className="object-cover object-center"
       /> </div>
)}


  <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-r from-[#101014] via-[#101014]/85 to-[#101014]/55" />

  <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-t from-[#101014] via-transparent to-[#101014]/45" />

  <div className="relative z-10 mx-auto max-w-5xl">
    <Link
      href={`/booking/${cinemaID}?movieId=${encodeURIComponent(movieId ?? "")}`}
      className="text-sm text-[#A5A1AD] transition hover:text-white"
    >
      ← Back to showtimes
    </Link>

    <header className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
        Step 03 · Select your seats
      </p>

      <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
        Choose Your Seats
      </h1>

      <p className="mt-4 text-[#A5A1AD]">{cinema.name}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#A5A1AD]">
        <span>Date: {date ?? "Not selected"}</span>
        <span>·</span>
        <span>Showtime: {showtimeId ?? "Not selected"}</span>
      </div>
    </header>

    <section className="mt-10 rounded-2xl border border-white/10 bg-[#17171D]/80 p-6 backdrop-blur-sm sm:p-8">
      <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">
          Screen
        </p>
      </div>

      <SeatMap />

      <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-[#A5A1AD]">
        <span>🟢 Available</span>
        <span>🟣 Selected</span>
        <span>🔴 Occupied</span>
      </div>
    </section>

    <section className="mt-6 rounded-2xl border border-white/10 bg-[#17171D]/80 p-6 backdrop-blur-sm">
      <p className="text-sm text-[#A5A1AD]">Ticket price per seat</p>
      <p className="mt-2 text-2xl font-bold">₹{cinema.price}</p>
      <p className="mt-2 text-xs text-[#777380]">
        Demo pricing. No real ticket is being reserved.
      </p>
    </section>
  </div>
</main>


);
}
