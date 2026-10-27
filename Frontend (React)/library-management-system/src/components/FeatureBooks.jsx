import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  LibraryBig,
  Sparkles,
  GraduationCap,
} from "lucide-react";

import { baseURL } from "../services/BaseURL";
import BookCard from "./BookCard";

const FeatureBooks = () => {
  const [featureBooks, setFeatureBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${baseURL}/books/all`);

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();
        setFeatureBooks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching featured books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-10 lg:px-10">
      {/* Background decoration */}
      {/* <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" /> */}

      <div className="relative mx-auto max-w-8xl">
        {/* Section heading */}
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200">
              <Sparkles size={16} className="text-blue-300" />
              Welcome to LibraryHub
            </div>

            <h2 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Discover Your Next
              <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                Favorite Book
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore knowledge, discover new ideas, and find the perfect
              resources for your learning journey. Your next great read starts
              here.
            </p>
          </div>

          <Link
            to="/allBooks"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-blue-300/25 bg-blue-400/10 px-5 py-3 text-sm font-semibold text-blue-200 transition hover:border-blue-300/50 hover:bg-blue-400/20"
          >
            Explore Library
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-stretch">
          {/* Library introduction */}
          <div className="flex flex-col justify-between rounded-3xl border border-blue-300/15 bg-slate-900/50 p-6 shadow-xl shadow-slate-950/10 backdrop-blur-sm sm:p-8">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-400/10">
                <LibraryBig size={25} className="text-blue-300" />
              </div>

              <h3 className="text-xl font-bold text-white sm:text-2xl">
                Your Smart Library Management System
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                LibraryHub makes discovering and managing books simple. Browse a
                growing digital collection, explore detailed book information,
                and check availability in one convenient place.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                Whether you are a student searching for academic resources, a
                developer improving your programming skills, or a curious reader
                exploring new subjects, LibraryHub helps you find resources to
                support your goals.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-blue-300/10 bg-blue-400/[0.06] p-4">
                <BookOpen size={21} className="mt-0.5 shrink-0 text-blue-300" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Explore Books
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Discover books across different subjects.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-blue-300/10 bg-blue-400/[0.06] p-4">
                <GraduationCap
                  size={22}
                  className="mt-0.5 shrink-0 text-blue-300"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Learn Without Limits
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Find resources for your next learning goal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured books: fixed-size cards on every screen */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Featured Collection
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Handpicked reads for curious minds
                </p>
              </div>

              <span className="rounded-lg border border-blue-300/15 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
                {Math.min(featureBooks.length, 2)} Books
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
              {featureBooks.slice(0, 2).map((book) => (
                <div
                  key={book.id}
                  className="h-[440px] w-[280px] shrink-0 overflow-hidden rounded-lg border border-blue-300/20 bg-slate-900/70 shadow-lg shadow-slate-950/20 transition duration-300 hover:-translate-y-1 hover:border-blue-300/40 hover:shadow-blue-950/40 [&>*]:h-full [&>*]:w-full"
                >
                  <BookCard book={book} />
                </div>
              ))}

              {/* View all card: same dimensions as BookCard wrappers */}
              <Link
                to="/allBooks"
                className="group relative flex h-[440px] w-[280px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-blue-300/30 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-slate-900/80 p-6 text-center transition duration-300 hover:border-blue-300/60 hover:bg-blue-400/10"
              >
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-400/10 blur-2xl transition group-hover:bg-blue-400/20" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/25 bg-blue-400/10 transition group-hover:scale-110">
                  <LibraryBig size={30} className="text-blue-300" />
                </div>

                <h4 className="relative mt-6 text-xl font-bold text-white">
                  There's More to Explore
                </h4>

                <p className="relative mt-3 text-sm leading-6 text-slate-400">
                  Browse the complete collection and discover your next favorite
                  book.
                </p>

                <span className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-400 px-5 py-3 text-sm font-bold text-slate-950 transition group-hover:bg-blue-300">
                  View All Books
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-8 pt-6 text-center">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-blue-200">LibraryHub</span> —
            Discover Books, Explore Knowledge, and Learn Without Limits.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureBooks;
