"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Eye,
  EyeOff,
  Film,
  LoaderCircle,
  Mail,
  Lock,
  UserRound,
} from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && data.session) {
        setSuccess("Your account has been created. You're signed in and ready to explore IMovies.");
      } else {
        setSuccess(
          "Account created! Check your inbox for the verification email, then follow its link to confirm your email address."
        );
      }

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Something went wrong while creating your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-overlay" aria-hidden="true" />

      {/* Brand logo: positioned independently of the main layout */}
      <Link href="/" className="auth-brand" aria-label="IMovies home">
        <span className="auth-brand-icon">
          <Film size={25} strokeWidth={2.2} />
        </span>

        <span className="auth-brand-copy">
          <span className="auth-brand-name">IMOVIES</span>
          <span className="auth-brand-tagline">
            YOUR CINEMA EXPERIENCE
          </span>
        </span>
      </Link>

      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="auth-eyebrow">
            <span className="auth-eyebrow-line" />
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h1>
            Every story.
            <br />
            Every emotion.
            <br />
            <span>One destination.</span>
          </h1>

          <p className="auth-showcase-description">
            Step into a world of cinema. Discover your next favourite,
            keep track of the stories you love, and make every movie
            night unforgettable.
          </p>

          <div className="auth-showcase-footer">
            <span className="auth-footer-dot" />
            YOUR SEAT IN THE WORLD OF CINEMA AWAITS
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <span className="auth-card-kicker">JOIN THE EXPERIENCE</span>
            <h2>Create account</h2>
            <p>Make your next movie night more memorable.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="fullName" className="auth-label">
              Full name
            </label>

            <div className="auth-input-wrap">
              <UserRound size={18} aria-hidden="true" />

              <input
                id="fullName"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <label htmlFor="email" className="auth-label" style={{ marginTop: 18 }}>
              Email address
            </label>

            <div className="auth-input-wrap">
              <Mail size={18} aria-hidden="true" />

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <label htmlFor="password" className="auth-label" style={{ marginTop: 18 }}>
              Password
            </label>

            <div className="auth-input-wrap">
              <Lock size={18} aria-hidden="true" />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <label htmlFor="confirmPassword" className="auth-label" style={{ marginTop: 18 }}>
              Confirm password
            </label>

            <div className="auth-input-wrap">
              <Lock size={18} aria-hidden="true" />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="auth-success" role="status">
                {success}
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle size={19} className="auth-spinner" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span />
            <span>YOUR MOVIE JOURNEY STARTS HERE</span>
            <span />
          </div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link
              href="/login"
              className="auth-inline-link auth-strong-link"
            >
              Sign in
            </Link>
          </p>

          <p className="auth-guest">
            Want to explore first?{" "}
            <Link href="/" className="auth-inline-link">
              Continue as a guest
            </Link>
          </p>

          <div className="auth-card-bottom">
            MADE FOR THE LOVE OF CINEMA
          </div>
        </section>
      </div>

      <footer className="auth-bottom-footer">
        <span>© {new Date().getFullYear()} IMovies</span>
        <span>YOUR STORIES. YOUR CINEMA.</span>
      </footer>

      <style jsx>{`
        .auth-page {
          --auth-purple: #a78bfa;
          --auth-purple-bright: #8b5cf6;

          position: relative;
          isolation: isolate;
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          overflow: hidden;
          background: #09090d;
          color: #f5f3f7;
          font-family: Arial, Helvetica, sans-serif;
        }

        .auth-background {
          position: absolute;
          z-index: -3;
          inset: 0;
          background-image: url("https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg");
          background-position: center;
          background-size: cover;
          transform: scale(1.025);
          animation: background-arrive 1.2s ease-out both;
        }

        .auth-overlay {
          position: absolute;
          z-index: -2;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(8, 8, 13, 0.96) 0%,
              rgba(8, 8, 13, 0.82) 38%,
              rgba(8, 8, 13, 0.56) 67%,
              rgba(8, 8, 13, 0.72) 100%
            ),
            linear-gradient(
              0deg,
              #09090d 0%,
              rgba(9, 9, 13, 0.15) 35%,
              rgba(9, 9, 13, 0.35) 100%
            );
        }

        /* LOGO POSITIONING FIX */
        .auth-page > :global(.auth-brand) {
          position: absolute;
          top: 32px;
          left: 36px;
          z-index: 10;

          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 11px;

          margin: 0;
          padding: 0;

          color: #fff;
          text-decoration: none;
        }

        .auth-brand-icon {
          display: grid;
          width: 45px;
          height: 45px;
          flex: 0 0 45px;
          place-items: center;

          border: 1px solid rgba(167, 139, 250, 0.55);
          border-radius: 13px;
          background: rgba(139, 92, 246, 0.16);
          color: #c4b5fd;

          box-shadow: 0 0 30px rgba(139, 92, 246, 0.12);
        }

        .auth-brand-copy {
          display: flex;
          flex-direction: column;
        }

        .auth-brand-name,
        .auth-brand-tagline {
          display: block;
          white-space: nowrap;
        }

        .auth-brand-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.16em;
        }

        .auth-brand-tagline {
          margin-top: 4px;
          color: #a5a1ad;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.19em;
        }

        .auth-layout {
          display: grid;
          width: min(1200px, 89%);
          flex: 1;
          grid-template-columns: minmax(0, 1fr) minmax(350px, 430px);
          align-items: center;
          gap: clamp(42px, 8vw, 110px);

          margin: 100px auto 64px;
        }

        .auth-showcase {
          max-width: 600px;
          animation: content-arrive 0.7s ease-out both;
        }

        .auth-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;

          color: #d2c5fa;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .auth-eyebrow-line {
          width: 34px;
          height: 2px;
          background: #a78bfa;
        }

        .auth-showcase h1 {
          margin: 28px 0 22px;
          font-size: clamp(43px, 5.1vw, 72px);
          font-weight: 800;
          letter-spacing: -0.055em;
          line-height: 1.06;
        }

        .auth-showcase h1 span {
          color: #c4b5fd;
        }

        .auth-showcase-description {
          max-width: 440px;
          margin: 0;

          color: #c4c0cb;
          font-size: 15px;
          line-height: 1.9;
        }

        .auth-showcase-footer {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-top: 48px;
          color: #aaa5b5;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
        }

        .auth-footer-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;

          border-radius: 50%;
          background: #a78bfa;
          box-shadow: 0 0 12px rgba(167, 139, 250, 0.8);
        }

        .auth-card {
          width: 100%;
          padding: 32px 34px 24px;

          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 23px;

          background: rgba(17, 16, 24, 0.78);
          box-shadow:
            0 25px 100px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.045);

          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);

          animation: content-arrive 0.7s 0.12s ease-out both;
        }

        .auth-card-kicker {
          color: #c4b5fd;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.22em;
        }

        .auth-card-heading h2 {
          margin: 12px 0 8px;
          font-size: 35px;
          font-weight: 750;
          letter-spacing: -0.045em;
        }

        .auth-card-heading > p {
          margin: 0;
          color: #aaa5b5;
          font-size: 12px;
          line-height: 1.7;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          margin-top: 22px;
        }

        .auth-label {
          display: block;
          margin-bottom: 9px;
          color: #e9e5ef;
          font-size: 11px;
          font-weight: 600;
        }

        .auth-input-wrap {
          display: flex;
          min-height: 49px;
          align-items: center;
          gap: 11px;
          padding: 0 14px;

          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;

          background: rgba(255, 255, 255, 0.035);
          color: #a5a1ad;

          transition:
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .auth-input-wrap:focus-within {
          border-color: rgba(167, 139, 250, 0.85);
          background: rgba(139, 92, 246, 0.055);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .auth-input-wrap input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          font-size: 12px;
        }

        .auth-input-wrap input::placeholder {
          color: #777381;
        }

        .auth-password-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 22px;
        }

        .auth-password-heading .auth-label {
          margin-bottom: 9px;
        }

        .auth-inline-link {
          color: #c4b5fd;
          font-size: 11px;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .auth-inline-link:hover {
          color: #fff;
        }

        .auth-password-toggle {
          display: grid;
          flex: 0 0 auto;
          place-items: center;
          padding: 4px;

          border: 0;
          background: transparent;
          color: #aaa5b5;
        }

        .auth-password-toggle:hover {
          color: #fff;
        }

        .auth-error {
          margin: 13px 0 0;
          color: #fca5a5;
          font-size: 11px;
          line-height: 1.6;
        }

        .auth-success {
          margin: 13px 0 0;
          color: #86efac;
          font-size: 11px;
          line-height: 1.7;
        }

        .auth-submit {
          display: flex;
          min-height: 49px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 25px;

          border: 1px solid rgba(196, 181, 253, 0.3);
          border-radius: 10px;

          background: linear-gradient(115deg, #8b5cf6, #7043db);
          box-shadow: 0 8px 26px rgba(112, 67, 219, 0.23);

          color: #fff;
          font-size: 12px;
          font-weight: 750;

          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            filter 180ms ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(112, 67, 219, 0.36);
          filter: brightness(1.08);
        }

        .auth-submit:disabled {
          cursor: wait;
          opacity: 0.8;
        }

        .auth-spinner {
          animation: spin 1s linear infinite;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0 16px;

          color: #777381;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .auth-divider span:first-child,
        .auth-divider span:last-child {
          height: 1px;
          flex: 1;
          background: rgba(255, 255, 255, 0.09);
        }

        .auth-switch,
        .auth-guest {
          color: #aaa5b5;
          font-size: 11px;
          text-align: center;
          line-height: 1.8;
        }

        .auth-switch {
          margin: 0;
        }

        .auth-strong-link {
          font-weight: 750;
        }

        .auth-guest {
          margin: 10px 0 0;
          color: #8f8a9b;
          font-size: 10px;
        }

        .auth-card-bottom {
          margin-top: 20px;
          padding-top: 15px;

          border-top: 1px solid rgba(255, 255, 255, 0.075);

          color: #777381;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-align: center;
        }

        .auth-bottom-footer {
          display: flex;
          width: 89%;
          align-items: center;
          justify-content: space-between;
          gap: 20px;

          margin: 0 auto;
          padding: 18px 0 22px;

          border-top: 1px solid rgba(255, 255, 255, 0.075);

          color: #8f8a9b;
          font-size: 9px;
          letter-spacing: 0.1em;
        }

        @keyframes background-arrive {
          from {
            opacity: 0.5;
            transform: scale(1.06);
          }

          to {
            opacity: 1;
            transform: scale(1.025);
          }
        }

        @keyframes content-arrive {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 1500px) {
          .auth-layout {
            width: min(1300px, 89%);
          }
        }

        @media (max-width: 900px) {
          .auth-layout {
            width: min(550px, 90%);
            grid-template-columns: 1fr;
            gap: 32px;
            margin-top: 110px;
          }

          .auth-showcase {
            text-align: center;
          }

          .auth-showcase h1 {
            margin-top: 19px;
            font-size: clamp(38px, 7vw, 53px);
          }

          .auth-showcase-description {
            margin-inline: auto;
          }

          .auth-showcase-footer {
            justify-content: center;
            margin-top: 24px;
          }

          .auth-card {
            max-width: 470px;
            margin-inline: auto;
          }

          .auth-overlay {
            background: rgba(8, 8, 13, 0.79);
          }
        }

        @media (max-width: 520px) {
          .auth-page > :global(.auth-brand) {
            top: 24px;
            left: 20px;
          }

          .auth-brand-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .auth-brand-name {
            font-size: 17px;
          }

          .auth-brand-tagline {
            font-size: 7px;
          }

          .auth-layout {
            width: 90%;
            gap: 27px;
            margin-top: 100px;
            margin-bottom: 42px;
          }

          .auth-showcase h1 {
            font-size: 39px;
          }

          .auth-showcase-description {
            font-size: 13px;
          }

          .auth-eyebrow {
            font-size: 8px;
            letter-spacing: 0.14em;
          }

          .auth-showcase-footer {
            font-size: 8px;
            letter-spacing: 0.09em;
          }

          .auth-card {
            padding: 29px 22px 23px;
            border-radius: 18px;
          }

          .auth-card-heading h2 {
            font-size: 31px;
          }

          .auth-bottom-footer {
            width: 90%;
            font-size: 8px;
            letter-spacing: 0.04em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-background,
          .auth-showcase,
          .auth-card {
            animation: none;
          }

          .auth-spinner {
            animation-duration: 2s;
          }
        }
      `}</style>
    </main>
  );
}