# IMovies — SkillWallet Project

**IMovies** is a movie discovery and demo ticket-booking web application built using Next.js. It allows users to explore movies, view movie details, select cinemas and showtimes, choose seats interactively, and complete a simulated booking process.

The project demonstrates frontend development, API integration, client-side state management, and the implementation of a complete movie-booking workflow.

## Features

* **Movie Discovery:** Browse movies and explore movie information.
* **Movie Details:** View information about individual movies.
* **Cinema Selection:** Choose a cinema for a movie.
* **Date and Showtime Selection:** Select a preferred date and showtime.
* **Interactive Seat Selection:** Select available seats through a visual seating interface.
* **Booking Summary:** Review selected movie, cinema, showtime, and seats before checkout.
* **Demo Payment:** Choose a simulated payment method to complete the demonstration booking process.
* **Booking Confirmation:** View booking confirmation details after completing the flow.
* **My Bookings:** View saved bookings and their associated movie information.
* **Booking Cancellation:** Cancel a saved booking, with the cancellation status retained locally.
* **Movie API Route:** Retrieve individual movie information through a Next.js API endpoint.
* **Persistent Local Data:** Use browser `localStorage` to retain booking information between visits.

## Technology Stack

| Technology             | Purpose                             |
| ---------------------- | ----------------------------------- |
| Next.js                | Application framework and routing   |
| React                  | User interface development          |
| TypeScript             | Type-safe application development   |
| TMDB API               | Movie information and poster data   |
| HTML and CSS           | Application structure and styling   |
| Browser `localStorage` | Local booking persistence           |
| Git and GitHub         | Version control and project hosting |

## Application Workflow

1. Browse the available movies.
2. Open a movie to view its details.
3. Select a cinema.
4. Choose a date and showtime.
5. Select seats using the interactive seating interface.
6. Review the booking summary.
7. Select a demo payment method.
8. Complete the simulated checkout.
9. View the booking confirmation.
10. Visit **My Bookings** to view or cancel saved bookings.

## Project Structure

The project follows the Next.js App Router structure.

```text
imovies-temp/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Application pages and API routes
│   │   ├── api/
│   │   │   └── movies/
│   │   │       └── [id]/    # Individual movie API endpoint
│   │   └── my-bookings/     # Saved bookings page
│   ├── components/          # Reusable UI components
│   └── lib/
│       └── bookings.ts      # Booking-related logic
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

*Note: This is a high-level overview. Additional application files and components may exist in the repository.*

## Getting Started

### Prerequisites

Ensure that the following are installed:

* Node.js
* npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/RONIN47-sudo/IMovies---SkillWallet---Project.git
```

### 2. Navigate to the Project Directory

```bash
cd IMovies---SkillWallet---Project
```

Use the actual cloned directory name if it differs.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root and add your TMDB API key using the environment variable name expected by the application.

For example:

```env
TMDB_API_KEY=your_tmdb_api_key
```

**Important:** Check the application's existing API integration to confirm the exact environment variable name before running the project.

Do not commit `.env.local` or expose API keys publicly.

### 5. Start the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing

The following areas can be tested during development:

* Movie information retrieval.
* Cinema, date, and showtime selection.
* Seat selection and booking-summary accuracy.
* Demo checkout and booking confirmation.
* Booking persistence after refreshing the page.
* Display of movie titles and posters in My Bookings.
* Booking cancellation and status persistence.
* Individual movie API endpoint responses.

## Important Limitations

This project currently demonstrates the movie-booking experience rather than a production ticketing service.

* **Payments are simulated.** No real payment is processed.
* **Bookings are stored locally.** Browser `localStorage` is not a centralized booking database.
* **Seat availability is demonstrative.** The application does not guarantee real-time seat availability at an actual cinema.
* **Authentication and production security** should be evaluated before deploying the application for real users.

## Future Enhancements

Potential improvements include:

* User authentication and profile management.
* Backend database integration for bookings.
* Real-time seat availability and reservation management.
* Integration with a legitimate payment gateway.
* Booking history synchronized across devices.
* Automated testing and improved error handling.
* Production deployment and security hardening.

## Contribution

This project is being developed as part of the IMovies – SkillWallet Project.

Contributions, suggestions, and improvements are welcome. For substantial changes, consider discussing the proposed functionality before implementation.

## Acknowledgements

* [TMDB](https://www.themoviedb.org/) for movie data and related resources.
* [Next.js](https://nextjs.org/) for the application framework.
* The open-source community for the tools and libraries used in development.
