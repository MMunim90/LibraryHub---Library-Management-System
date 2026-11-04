import { House, Search, ArrowLeft, Library } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { iconURL } from "../services/Icon";

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white flex flex-col overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute -top-32 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <img className="h-9 w-9" src={iconURL} alt="" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">LibraryHub</h1>
              <p className="text-xs text-slate-400">
                Your gateway to knowledge
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-slate-300 hover:text-blue-300 transition-colors"
          >
            <House size={17} />
            Home
          </Link>
        </nav>
      </header>

      {/* Error Content */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Book Illustration */}
          <div className="relative mx-auto w-36 h-36 md:w-44 md:h-44 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative w-28 h-32 md:w-32 md:h-36 rounded-2xl border border-blue-300/30 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 shadow-2xl flex flex-col items-center justify-center rotate-[-6deg]">
              <img className="h-23 w-23" src={iconURL} alt="" />

              <div className="mt-3 w-12 h-1 rounded-full bg-blue-300/50" />
            </div>

            <span className="absolute top-1 right-0 w-10 h-10 rounded-xl bg-indigo-400/10 border border-indigo-300/20 flex items-center justify-center">
              <Search size={19} className="text-blue-300" />
            </span>

            <span className="absolute bottom-1 left-0 w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-300/20 flex items-center justify-center">
              <Library size={19} className="text-blue-300" />
            </span>
          </div>

          {/* 404 */}
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-[0.3em]">
            Error 404
          </p>

          <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            Page not found<span className="text-blue-300">.</span>
          </h2>

          <p className="mt-6 text-base md:text-lg text-slate-300 leading-8 max-w-xl mx-auto">
            Oops! It looks like this page has been misplaced on our bookshelf.
            The link may be broken, or the page may have been moved.
          </p>

          {/* Actions */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="btn w-full sm:w-auto bg-blue-300 hover:bg-blue-200 text-slate-950 border-0 px-7"
            >
              <House size={18} />
              Back to Home
            </Link>

            <Link
              to="/allBooks"
              className="btn w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 px-7"
            >
              <Search size={18} className="text-blue-300" />
              Explore Books
            </Link>
          </div>

          {/* Go Back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-7 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go back to the previous page
          </button>

          <div className="mt-12 flex items-center justify-center gap-3 text-sm text-slate-400">
            <span className="h-px w-10 bg-white/15" />
            <span>Every lost page leads to a new discovery.</span>
            <span className="h-px w-10 bg-white/15" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} LibraryHub. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-blue-300 transition-colors">
              About Us
            </Link>

            <Link
              to="/contact"
              className="hover:text-blue-300 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
