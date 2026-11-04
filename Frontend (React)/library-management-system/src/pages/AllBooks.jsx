import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Library,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";
import BookCard from "../components/BookCard";
import { baseURL } from "../services/BaseURL";
import { iconURL } from "../services/Icon";

const API_URL = `${baseURL}/books/all`;

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchBooks = async () => {
      try {
        setError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load books. Please try again.");
        }

        const data = await response.json();

        setBooks(
          Array.isArray(data)
            ? data
            : Array.isArray(data.books)
              ? data.books
              : [],
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(books.map((book) => book.category).filter(Boolean)),
    ],
    [books],
  );

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.category?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" || book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [books, searchTerm, selectedCategory]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-blue-400/10" style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1718217213243-432ae99bfcdb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D)",
        }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-blue-950/40 to-gray-900"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-300">
                <Library size={16} />
                Explore LibraryHub
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Discover Your Next{" "}
                <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  Great Read.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Explore a world of knowledge, discover new perspectives, and
                find the perfect book for your next learning adventure.
              </p>
            </div>

            <div className="flex w-full items-center gap-4 rounded-2xl border border-blue-400/20 bg-slate-900/50 p-5 shadow-xl shadow-black/10 backdrop-blur-md md:w-auto md:min-w-64">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                <img className="h-11 w-11" src={iconURL} alt="" />
              </div>

              <div>
                <p className="text-3xl font-bold text-white">
                  {loading ? "—" : books.length}
                </p>
                <p className="text-sm text-slate-400">
                  Books in our collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Browse Our Collection
          </h2>
          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Find your favorite books from our growing collection.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 rounded-2xl border border-blue-400/15 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-4 shadow-lg backdrop-blur-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or category..."
                className="input h-12 w-full border-blue-400/20 bg-slate-950/60 pl-12 pr-10 text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-blue-400/10 hover:text-blue-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <SlidersHorizontal size={20} className="shrink-0 text-blue-300" />

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select h-12 w-full border-blue-400/20 bg-slate-950/60 text-slate-200 focus:border-blue-400 focus:outline-none lg:w-56"
                aria-label="Filter by category"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-slate-900 text-white"
                  >
                    {category === "All" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Information */}
        {!loading && !error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-400">
              Showing{" "}
              <span className="font-semibold text-blue-300">
                {filteredBooks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-200">
                {books.length}
              </span>{" "}
              books
            </p>

            {(searchTerm || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="text-sm font-medium text-blue-300 transition hover:text-blue-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4">
            <span className="loading loading-spinner loading-lg text-blue-300" />
            <p className="text-sm text-slate-400">
              Discovering books for you...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-400/20 bg-red-500/5 px-6 py-12 text-center">
            <AlertCircle size={42} className="mx-auto mb-4 text-red-300" />
            <h3 className="text-xl font-bold text-white">
              Couldn't load books
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              {error}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="btn mt-6 border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Book Grid */}
        {!loading && !error && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBooks.length === 0 && (
          <div className="rounded-2xl border border-blue-400/15 bg-slate-900/30 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
              <Search size={30} className="text-blue-300" />
            </div>

            <h3 className="text-xl font-bold text-white">No books found</h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              We couldn't find any books matching your search. Try another
              title, author, or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="btn mt-6 border-blue-400/30 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-blue-400/20  bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-7 sm:p-10">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                Every book opens a new world.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Keep exploring, keep learning, and let your next great discovery
                begin here.
              </p>
            </div>

            <img className="h-20 w-20 hidden shrink-0 text-blue-300/70 sm:block" src={iconURL} alt="" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllBooks;
