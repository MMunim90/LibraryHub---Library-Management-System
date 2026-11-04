import { Link, useNavigate } from "react-router";
import {
  ShieldX,
  LockKeyhole,
  ArrowLeft,
  House,
  ShieldCheck,
} from "lucide-react";
import { iconURL } from "../services/Icon";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-12 text-slate-100">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-xl">
        {/* Brand */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-3 shadow-lg shadow-blue-950/30">
            <img className="h-8 w-8" src={iconURL} alt="" />
          </div>

          <span className="text-2xl font-bold tracking-tight text-white">
            Library<span className="text-blue-300">Hub</span>
          </span>
        </Link>

        {/* Forbidden Card */}
        <div className="rounded-3xl border border-blue-300/20 bg-slate-900/60 p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
          {/* Icon */}
          <div className="relative mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-full border border-blue-300/20 bg-blue-400/10">
            <div className="absolute inset-2 rounded-full border border-dashed border-blue-300/30" />

            <ShieldX size={58} strokeWidth={1.5} className="text-blue-300" />

            <div className="absolute -right-1 -top-1 rounded-full border border-slate-800 bg-indigo-500/20 p-2">
              <LockKeyhole size={19} className="text-blue-200" />
            </div>
          </div>

          {/* Error Code */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2">
            <ShieldCheck size={15} className="text-blue-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Error 403 · Forbidden
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Access Denied
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
            Sorry, you don't have permission to access this page. It may require
            a different account or additional privileges.
          </p>

          {/* Information Panel */}
          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-blue-300/15 bg-blue-400/[0.06] p-4 text-left">
            <LockKeyhole size={21} className="mt-0.5 shrink-0 text-blue-300" />

            <div>
              <p className="text-sm font-semibold text-blue-100">
                This area is restricted
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-400 sm:text-sm">
                Please sign in with an account that has the required
                permissions, or contact your administrator for help.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
            >
              <House size={18} />
              Back to Home
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-blue-400/5 px-6 py-3 font-semibold text-blue-100 transition hover:bg-blue-400/15 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-blue-300/10 pt-5">
            <p className="text-xs text-slate-500">
              Need assistance? Contact the LibraryHub administrator.
            </p>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="mt-6 text-center text-xs tracking-wide text-slate-500">
          LibraryHub · Your knowledge, your library.
        </p>
      </div>
    </div>
  );
};

export default Forbidden;
