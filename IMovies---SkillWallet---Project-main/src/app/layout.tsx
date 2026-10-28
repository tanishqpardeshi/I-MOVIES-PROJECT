import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "IMovies — Your Next Cinema Experience",
    template: "%s | IMovies",
  },
  description:
    "Discover movies, explore showtimes, and book your next cinema experience with IMovies.",
  applicationName: "IMovies",
  keywords: [
    "IMovies",
    "movie tickets",
    "cinema",
    "movie showtimes",
    "movie booking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

