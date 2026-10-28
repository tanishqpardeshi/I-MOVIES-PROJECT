import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CinemaShowtimes from "@/components/CinemaShowtimes";
import { getMovieDetails } from "@/lib/tmdb";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const cinemas = [
{
id: "kalyan-cinemas",
name: "Kalyan Cinemas",
location: "Rajendra Nagar, Indore",
address: "Kalyan Mall, Rajendra Nagar",
price: 150,
formats: ["2D"],
},
{
id: "odeon-cinemas",
name: "Odeon Cinemas",
location: "Westend Mall, Rajendra Nagar, Indore",
address: "Westend Mall, Rajendra Nagar",
price: 180,
formats: ["2D", "3D"],
},
{
id: "pvr-treasure",
name: "PVR: Treasure Island Mall",
location: "South Tukoganj, Indore",
address: "Treasure Island Mall, MG Road, South Tukoganj",
price: 220,
formats: ["2D", "3D"],
},
{
id: "inox-c21",
name: "INOX: C-21 Mall",
location: "Scheme No. 54, Indore",
address: "C-21 Mall, AB Road, Scheme No. 54",
price: 200,
formats: ["2D", "3D"],
},
{
id: "inox-central",
name: "INOX: Nexus Indore Central Mall",
location: "Regal Square, Indore",
address: "Nexus Indore Central Mall, RNT Marg",
price: 200,
formats: ["2D", "3D"],
},
{
id: "miraj-velocity",
name: "Miraj Cinemas: Velocity III",
location: "Scheme No. 94C, Indore",
address: "Velocity III, Eastern Ring Road",
price: 180,
formats: ["2D", "3D"],
},
{
id: "inox-phoenix",
name: "INOX: Phoenix Citadel Mall",
location: "MR-10 Road, Indore",
address: "Phoenix Citadel Mall, Indore",
price: 220,
formats: ["2D", "3D"],
},
{
id: "drama-factory",
name: "Drama Factory Cinema",
location: "Scheme No. 140, Indore",
address: "Zodiac Mall, Indore",
price: 180,
formats: ["2D"],
},
{
id: "rajhans-cinemas",
name: "Rajhans Cinemas",
location: "Vijay Nagar, Indore",
address: "Malhar Mega Mall, Indore",
price: 200,
formats: ["2D", "3D"],
},
{
id: "sapna-sangeeta",
name: "Sapna Sangeeta Lumiere",
location: "Sapna Sangeeta Road, Indore",
address: "Sapna Sangeeta Road, Indore",
price: 180,
formats: ["2D"],
},
{
id: "fundore-cinemas",
name: "Fundore Cinemas",
location: "Rau, Indore",
address: "Rau, Indore",
price: 150,
formats: ["2D"],
},
{
id: "mangal-carnival",
name: "Mangal Carnival Cinemas",
location: "Vijay Nagar, Indore",
address: "Mangal City Mall, Indore",
price: 180,
formats: ["2D", "3D"],
},
];

const showtimes = [
{ id: "SHOW01", time: "10:00 AM", format: "2D" },
{ id: "SHOW02", time: "01:15 PM", format: "2D" },
{ id: "SHOW03", time: "04:30 PM", format: "3D" },
{ id: "SHOW04", time: "07:45 PM", format: "2D" },
{ id: "SHOW05", time: "10:30 PM", format: "3D" },
];

interface CinemaPageProps {
params: Promise<{
cinemaID: string;
}>;
searchParams: Promise<{
movieId?: string;
}>;
}

export default async function CinemaPage({
params,
searchParams,
}: CinemaPageProps) {
const { cinemaID } = await params;
const { movieId } = await searchParams;

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

const availableShowtimes = showtimes.filter((showtime) =>
cinema.formats.includes(showtime.format)
);

return ( <main className="relative min-h-screen overflow-hidden bg-[#101014] px-5 py-10 text-[#F5F3F7] sm:px-8 sm:py-14">
{backdropUrl && ( <div className="pointer-events-none fixed inset-0 -z-0"> <Image
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
      href={`/booking?movieId=${encodeURIComponent(movieId ?? "")}`}
      className="inline-flex items-center gap-2 text-sm text-[#A5A1AD] transition hover:text-white"
    >
      <span aria-hidden="true">←</span>
      Back to cinemas
    </Link>

    <header className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
        Step 02 · Choose a showtime
      </p>

      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
        {cinema.name}
      </h1>

      <p className="mt-4 text-[#A5A1AD]">{cinema.location}</p>

      <p className="mt-2 text-sm text-[#777380]">{cinema.address}</p>
    </header>

    <CinemaShowtimes
      cinemaID={cinema.id}
      movieId={movieId ?? ""}
      showtimes={availableShowtimes}
    />

    <footer className="mt-10 rounded-xl border border-white/10 bg-[#17171D]/75 p-5 backdrop-blur-sm">
      <p className="text-xs leading-6 text-[#A5A1AD]">
        This is a prototype. Dates and showtimes are demonstration data
        and do not represent live cinema schedules or confirmed ticket
        availability.
      </p>
    </footer>
  </div>
</main>


);
}
