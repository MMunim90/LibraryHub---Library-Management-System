import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  UserRound,
  Tag,
  Library,
  CheckCircle2,
  AlertCircle,
  BookmarkPlus,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";
import { baseURL } from "../services/BaseURL";
import { AuthContext } from "../context/AuthContext";

const BookDetails = () => {
  const { book_id, id } = useParams();
  // console.log(id);
  const bookId = book_id || id;
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reservationStatus, setReservationStatus] = useState(null);
  const [reservationChecking, setReservationChecking] = useState(true);
  const { accessToken } = useContext(AuthContext);
  //   console.log(accessToken);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    const fetchBookDetails = async () => {
      setLoading(true);
      setError("");
      setBook(null);
      setImageFailed(false);

      try {
        const response = await fetch(`${baseURL}/books/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (response.status === 404) {
          throw new Error("Book not found.");
        }

        if (!response.ok) {
          throw new Error("Unable to load book details.");
        }

        const data = await response.json();
        setBook(data);
        // console.log(book);
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

    if (bookId || id) {
      fetchBookDetails();
    } else {
      setError("Book ID is missing from the URL.");
      setLoading(false);
    }

    return () => controller.abort();
  }, [bookId, id]);

  useEffect(() => {
    const checkReservation = async () => {
      if (!accessToken || !bookId) {
        setReservationStatus(null);
        setReservationChecking(false);
        return;
      }

      setReservationChecking(true);

      try {
        const response = await fetch(`${baseURL}/reserve/my`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }

        const reservations = await response.json();

        const matchingReservations = reservations
          .filter(
            (reservation) => String(reservation.book_id) === String(bookId),
          )
          .sort(
            (a, b) =>
              new Date(b.reservation_date) - new Date(a.reservation_date),
          );

        // Use the most recent reservation for this book.
        const latestReservation = matchingReservations[0];

        const status = latestReservation?.status?.toLowerCase();

        if (status === "pending" || status === "approved") {
          setReservationStatus(status);
        } else {
          // No reservation, or the latest one was cancelled/rejected.
          setReservationStatus(null);
        }
      } catch (error) {
        console.error("Reservation check failed:", error);
      } finally {
        setReservationChecking(false);
      }
    };

    checkReservation();
  }, [accessToken, bookId]);

  const handleReserve = async () => {
    if (!book || book.available_copies <= 0 || reserveLoading) return;

    if (!accessToken) {
      await Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to reserve this book.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#3b82f6",
        iconColor: "#60a5fa",
      });
      return;
    }

    setReserveLoading(true);

    try {
      const response = await fetch(`${baseURL}/reserve/${bookId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || data?.message || "Failed to reserve this book.",
        );
      }

      setReservationStatus("pending");

      await Swal.fire({
        icon: "success",
        title: "Reservation Successful!",
        text: `${book.title} has been reserved. Please wait for admin approval.`,
        background: "#0f172a",
        color: "#e2e8f0",
        iconColor: "#60a5fa",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Reservation Failed",
        text: error.message || "Something went wrong.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#3b82f6",
        iconColor: "#f87171",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });
    } finally {
      setReserveLoading(false);
    }
  };

  const isAvailable = book?.available_copies > 0;

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-100">
        <span className="loading loading-spinner loading-lg text-blue-300" />
        <p className="text-sm text-slate-400">Loading book details...</p>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-blue-400/15 bg-slate-900/50 p-8 text-center shadow-2xl">
          <AlertCircle size={48} className="mx-auto mb-4 text-blue-300" />
          <h1 className="text-2xl font-bold text-white">Book Not Found</h1>
          <p className="mt-3 text-slate-400">
            {error || "We couldn't find this book."}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn mt-6 border-blue-400/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-slate-100">
      {/* Top Navigation */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 rounded-xl border border-blue-400/15 bg-slate-900/30 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/40 hover:text-blue-300"
        >
          <ArrowLeft
            size={18}
            className="text-blue-300 transition group-hover:-translate-x-1"
          />
          Back to Books
        </button>
      </div>

      {/* Main Book Details */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          {/* Book Cover */}
          <div className="mx-auto w-full max-w-md lg:sticky lg:top-8">
            <div className="relative overflow-hidden rounded-3xl border border-blue-300/20 bg-slate-900/40 p-4 shadow-2xl shadow-black/30 sm:p-6">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-blue-400/20 bg-gradient-to-br from-slate-800 via-blue-950 to-indigo-950">
                {book.cover_image && !imageFailed ? (
                  <img
                    src={book.cover_image}
                    alt={`Cover of ${book.title}`}
                    className="absolute inset-0 h-full w-full object-contain"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden p-6 text-center sm:p-8">
                    <div className="absolute -right-16 top-10 h-44 w-44 rounded-full border border-blue-300/10" />
                    <div className="absolute -bottom-20 -left-12 h-60 w-60 rounded-full border border-blue-300/10" />

                    <div className="relative flex w-full items-center justify-between gap-2">
                      <img
                        className="h-11 w-11"
                        src="../../public/icon.png"
                        alt=""
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/70 sm:text-xs">
                        LibraryHub
                      </span>
                    </div>

                    <div className="relative my-6">
                      <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-blue-300" />

                      <h2 className="break-words text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                        {book.title}
                      </h2>

                      <p className="mt-4 break-words text-sm leading-6 text-blue-200 sm:text-base">
                        {book.author}
                      </p>
                    </div>

                    <div className="relative w-full border-t border-blue-300/20 pt-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        Explore · Learn · Grow
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative mt-5 flex items-center justify-between gap-3 rounded-xl border border-blue-400/10 bg-slate-950/40 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck size={18} className="text-blue-300" />
                  <span>Library collection</span>
                </div>

                <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
                  ID #{book.id}
                </span>
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                <Tag size={14} />
                {book.category || "Uncategorized"}
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  isAvailable
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-red-400/20 bg-red-400/10 text-red-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isAvailable ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {isAvailable ? "Available" : "Out of Stock"}
              </span>
            </div>

            <h1 className="mt-6 break-words text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {book.title}
            </h1>

            <div className="mt-5 flex items-start gap-3">
              <UserRound size={21} className="mt-0.5 shrink-0 text-blue-300" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Written by
                </p>
                <p className="mt-1 text-base leading-7 text-slate-300 sm:text-lg">
                  {book.author}
                </p>
              </div>
            </div>

            <div className="my-7 h-px bg-gradient-to-r from-blue-400/40 via-indigo-400/20 to-transparent" />

            {/* Price */}
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-blue-400/15 bg-slate-900/35 p-5 sm:p-6">
              <div>
                <p className="text-sm text-slate-400">Book price</p>
                <p className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="mr-1 text-xl font-semibold text-blue-300">
                    ৳
                  </span>
                  {Number(book.price).toLocaleString("en-BD")}
                </p>
              </div>

              <div className="rounded-xl border border-blue-400/15 bg-blue-400/5 p-3 text-blue-300">
                <img className="h-11 w-11" src="../../public/icon.png" alt="" />
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <img className="h-9 w-9" src="../../public/icon.png" alt="" />
                About This Book
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300 sm:text-base">
                {book.description ||
                  "No description is available for this book yet."}
              </p>
            </div>

            {/* Copies Information */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-blue-400/15 bg-slate-900/35 p-4 sm:p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                  <Library size={21} />
                </div>
                <p className="text-sm text-slate-400">Total Copies</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {book.total_copies ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-400/15 bg-slate-900/35 p-4 sm:p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                  <CheckCircle2 size={21} />
                </div>
                <p className="text-sm text-slate-400">Available Copies</p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    isAvailable ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {book.available_copies ?? 0}
                </p>
              </div>
            </div>

            {/* Reservation Section */}
            <div className="mt-8 rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 p-5 sm:p-6">
              {reservationChecking ? (
                <>
                  <h2 className="text-lg font-bold text-white">
                    Checking Reservation Status...
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Please wait while we check your reservation.
                  </p>
                  <span className="loading loading-spinner loading-sm mt-4 text-blue-300" />
                </>
              ) : reservationStatus === "pending" ? (
                <>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="text-amber-300" size={22} />
                    <h2 className="text-lg font-bold text-white">
                      Reservation Pending
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    You have already reserved this book. Please wait for the
                    librarian to approve your request.
                  </p>
                  <span className="mt-4 inline-flex rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                    Awaiting Approval
                  </span>
                </>
              ) : reservationStatus === "approved" ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-300" size={22} />
                    <h2 className="text-lg font-bold text-white">
                      Reservation Approved
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Your reservation has been approved by the librarian. Please
                    follow the library's borrowing instructions.
                  </p>
                  <span className="mt-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    Approved
                  </span>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-white">
                    Ready to explore this book?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {book.available_copies > 0
                      ? "Reserve your copy and take the next step in your learning journey."
                      : "All copies are currently unavailable. Please check back later."}
                  </p>

                  <button
                    type="button"
                    onClick={handleReserve}
                    disabled={
                      !isAvailable || reserveLoading || reservationChecking
                    }
                    className="btn mt-5 h-12 w-full border-0 bg-blue-500 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 sm:w-auto sm:min-w-56"
                  >
                    {reserveLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <BookmarkPlus size={20} />
                    )}
                    {isAvailable
                      ? "Reserve This Book"
                      : "Currently Unavailable"}
                  </button>
                </>
              )}

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Reservation availability depends on your library's borrowing
                policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookDetails;
