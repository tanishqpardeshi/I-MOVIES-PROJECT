import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { getMovieDetails } from "@/lib/tmdb";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

interface BookingPageProps {
  searchParams: Promise<{
    movieId?: string;
  }>;
}

const cinemas = [
  {
    id: "inox-c21",
    name: "INOX C21 Mall",
    location: "C21 Mall, Vijay Nagar, Indore",
    formats: ["2D", "3D"],
  },
  {
    id: "pvr-treasure",
    name: "PVR Cinemas — Treasure Island",
    location: "Treasure Island Mall, South Tukoganj, Indore",
    formats: ["2D", "IMAX"],
  },
  {
    id: "inox-phoenix",
    name: "INOX — Phoenix Citadel Mall",
    location: "Phoenix Citadel Mall, Indore",
    formats: ["2D", "3D"],
  },
  {
    id: "inox-central",
    name: "INOX Nexus Indore Central",
    location: "R.N.T. Marg, Regal Square, Indore",
    formats: ["2D", "3D"],
  },
  {
    id: "kalyan-cinemas",
    name: "Kalyan Cinemas",
    location: "Rajendra Nagar, Indore",
    formats: ["2D"],
  },
  {
    id: "odeon-cinemas",
    name: "Odeon Cinemas",
    location: "Westend Mall, Rajendra Nagar, Indore",
    formats: ["2D"],
  },
  {
    id: "drama-factory",
    name: "Drama Factory Cinema",
    location: "Zodiac Mall, Scheme No. 140, Indore",
    formats: ["2D"],
  },
  {
    id: "rajhans-cinemas",
    name: "Rajhans Cinemas",
    location: "Malhar Mega Mall, Vijay Nagar, Indore",
    formats: ["2D", "3D"],
  },
  {
    id: "sapna-sangeeta",
    name: "Sapna Sangeeta Lumiere",
    location: "Sapna Sangeeta Road, Indore",
    formats: ["2D"],
  },
  {
    id: "miraj-velocity",
    name: "Miraj Cinemas — Velocity III",
    location: "Scheme No. 94C, Ring Road, Indore",
    formats: ["2D", "3D"],
  },
  {
    id: "fundore-cinemas",
    name: "Fundore Cinemas",
    location: "Rau, Indore",
    formats: ["2D"],
  },
  {
    id: "mangal-carnival",
    name: "Mangal Carnival Cinemas",
    location: "Mangal City, Vijay Nagar, Indore",
    formats: ["2D", "3D"],
  },
];

export default async function BookingPage({
  searchParams,
}: BookingPageProps) {
  const { movieId } = await searchParams;

  let movie = null;

  if (movieId && /^\d+$/.test(movieId)) {
    try {
      movie = await getMovieDetails(movieId);
    } catch (error) {
      console.error("Failed to load movie backdrop:", error);
    }
  }

  const backdropUrl = movie?.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
    : null;

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#101014] text-[#F5F3F7]">
      {backdropUrl && (
        <Image
          src={backdropUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="fixed inset-0 -z-20 object-cover object-center"
        />
      )}

      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-r from-[#101014] via-[#101014]/90 to-[#101014]/55" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-t from-[#101014] via-transparent to-[#101014]/40" />

      <header className="relative z-10 border-b border-white/[0.08] bg-[#101014]/20">
        <nav className="page-container flex h-20 items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            i<span className="text-violet-400">Movies</span>
          </Link>

          <Link
            href={movieId ? `/movie/${movieId}` : "/"}
            className="inline-flex items-center gap-2 text-sm text-[#A5A1AD] transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back
          </Link>
        </nav>
      </header>

      <section className="page-container relative z-10 py-12 md:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
          Book Your Experience
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          Select a Cinema
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#C2BEC9] sm:text-base">
          Choose your preferred cinema to explore available demo showtimes.
          {movie?.title ? ` Booking for ${movie.title}.` : ""}
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {cinemas.map((cinema) => (
            <article
              key={cinema.id}
              className="rounded-2xl border border-white/10 bg-[#17171D]/90 p-6 shadow-xl backdrop-blur-sm transition hover:border-violet-400/40"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                  <MapPin className="h-6 w-6 text-violet-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold">{cinema.name}</h2>

                  <p className="mt-2 text-sm leading-6 text-[#A5A1AD]">
                    {cinema.location}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {cinema.formats.map((format) => (
                      <span
                        key={format}
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-[#D0CDD6]"
                      >
                        {format}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/booking/${cinema.id}?movieId=${encodeURIComponent(movieId ?? "")}`}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                  >
                    Select Cinema
                    <span className="ml-2" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-[#A5A1AD]">
          Cinema listings, formats, and showtimes are demonstration data.
          They are not connected to live cinema availability.
        </p>
      </section>
    </main>
  );
}

