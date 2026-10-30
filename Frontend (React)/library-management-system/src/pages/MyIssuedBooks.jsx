import { useContext, useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  DollarSign,
  LibraryBig,
  LoaderCircle,
  RefreshCw,
  Search,
  AlertCircle,
  XCircle,
} from "lucide-react";

import { baseURL } from "../services/BaseURL";
import { AuthContext } from "../context/AuthContext";

const MyIssuedBooks = () => {
  const { accessToken } = useContext(AuthContext);

  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchIssuedBooks = async (isRefresh = false) => {
    if (!accessToken) {
      setIssuedBooks([]);
      setError("Please log in to view your issued books.");
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${baseURL}/issues/my`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please log in again."
            : "Failed to load your issued books."
        );
      }

      const data = await response.json();

      const records = Array.isArray(data)
        ? data
        : data.issues || data.items || [];

      setIssuedBooks(records);
    } catch (err) {
      console.error("Fetch issued books error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, [accessToken]);

  const getStatus = (book) => {
  const status = (book.status || "").trim().toLowerCase();

  if (status === "returned" || book.return_date) {
    return "returned";
  }

  if (status === "issued" || status === "approved") {
    if (isOverdue(book.due_date)) {
      return "overdue";
    }

    return "issued";
  }

  return status || "unknown";
};

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;

    return new Date(dueDate).getTime() < Date.now();
  };

  const filteredBooks = useMemo(() => {
    return issuedBooks.filter((book) => {
      const matchesSearch =
        String(book.book_id).includes(searchTerm.trim()) ||
        String(book.id).includes(searchTerm.trim()) ||
        (book.status || "")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase());

      const status = getStatus(book);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [issuedBooks, searchTerm, statusFilter]);

  const activeBooks = issuedBooks.filter(
    (book) => getStatus(book) === "issued" || getStatus(book) === "overdue"
  ).length;

  const overdueBooks = issuedBooks.filter(
    (book) => getStatus(book) === "overdue"
  ).length;

  const unpaidFines = issuedBooks
    .filter((book) => !book.fine_paid)
    .reduce((total, book) => total + Number(book.fine_amount || 0), 0);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not available";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "issued":
        return "border-blue-400/30 bg-blue-400/10 text-blue-300";
      case "returned":
        return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
      case "overdue":
        return "border-red-400/30 bg-red-400/10 text-red-300";
      default:
        return "border-slate-400/30 bg-slate-400/10 text-slate-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "issued":
        return <Clock size={15} />;
      case "returned":
        return <CheckCircle2 size={15} />;
      case "overdue":
        return <AlertCircle size={15} />;
      default:
        return <BookOpen size={15} />;
    }
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;

    const difference = new Date(dueDate).getTime() - Date.now();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-3">
                <BookMarked className="h-7 w-7 text-blue-300" />
              </div>

              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                Member Dashboard
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              My Issued Books
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Keep track of your borrowed books, due dates, return history,
              and outstanding fines in one place.
            </p>
          </div>

          <button
            onClick={() => fetchIssuedBooks(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-200 transition hover:border-blue-300/60 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Books"}
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-blue-400/20 bg-slate-900/50 p-5 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Records</p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  {issuedBooks.length}
                </h2>
              </div>
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-3">
                <LibraryBig className="h-6 w-6 text-blue-300" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              All your issue records
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-slate-900/50 p-5 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Currently Borrowed</p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  {activeBooks}
                </h2>
              </div>
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3">
                <BookOpen className="h-6 w-6 text-cyan-300" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Books not yet returned
            </p>
          </div>

          <div className="rounded-2xl border border-red-400/20 bg-slate-900/50 p-5 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Overdue Books</p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  {overdueBooks}
                </h2>
              </div>
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3">
                <AlertCircle className="h-6 w-6 text-red-300" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Books past their due date
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-slate-900/50 p-5 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Unpaid Fines</p>
                <h2 className="mt-2 text-3xl font-bold text-white">
                  ৳{unpaidFines.toLocaleString("en-BD")}
                </h2>
              </div>
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
                <DollarSign className="h-6 w-6 text-amber-300" />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Outstanding fine amount
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className="mb-6 rounded-2xl border border-blue-400/20 bg-slate-900/50 p-5 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Your Borrowing History
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Search by book ID, issue record ID, or status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search records..."
                  className="w-full rounded-xl border border-blue-400/25 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-blue-400/25 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-400"
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-300" />
              <div>
                <h3 className="font-bold text-red-200">
                  Unable to Load Issued Books
                </h3>
                <p className="mt-1 text-sm text-red-200/80">{error}</p>
              </div>
            </div>

            <button
              onClick={() => fetchIssuedBooks()}
              className="rounded-lg border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-blue-400/20 bg-slate-900/40">
            <LoaderCircle className="mb-4 h-12 w-12 animate-spin text-blue-300" />
            <p className="font-medium text-blue-100">
              Loading your issued books...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Please wait a moment.
            </p>
          </div>
        ) : !error && filteredBooks.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-blue-400/20 bg-slate-900/40 px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
              <BookOpen className="h-10 w-10 text-blue-300" />
            </div>

            <h3 className="text-xl font-bold text-white">
              {issuedBooks.length === 0
                ? "No Issued Books Yet"
                : "No Matching Records"}
            </h3>

            <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">
              {issuedBooks.length === 0
                ? "You haven't borrowed any books yet. Once a librarian issues a book to you, it will appear here."
                : "Try changing your search term or status filter to find your records."}
            </p>

            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : !error ? (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-blue-400/20 bg-slate-900/50 shadow-xl lg:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-blue-400/20 bg-slate-950/50">
                    <tr className="text-xs uppercase tracking-wider text-blue-200">
                      <th className="px-6 py-5 font-semibold">Book / Issue ID</th>
                      <th className="px-6 py-5 font-semibold">Issue Date</th>
                      <th className="px-6 py-5 font-semibold">Due Date</th>
                      <th className="px-6 py-5 font-semibold">Status</th>
                      <th className="px-6 py-5 font-semibold">Fine</th>
                      <th className="px-6 py-5 font-semibold">Return Date</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-blue-400/10">
                    {filteredBooks.map((book) => {
                      const status = getStatus(book);
                      const daysRemaining = getDaysRemaining(book.due_date);

                      return (
                        <tr
                          key={book.id}
                          className="transition hover:bg-blue-400/5"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-3">
                                <BookOpen className="h-5 w-5 text-blue-300" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  Book #{book.book_id}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Issue ID: #{book.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-300">
                            {formatDate(book.issue_date)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <p className={`text-sm font-medium ${status === "overdue" ? "text-red-300" : "text-slate-300"}`}>
                              {formatDate(book.due_date)}
                            </p>

                            {status === "issued" && daysRemaining !== null && (
                              <p className="mt-1 text-xs text-cyan-300">
                                {daysRemaining === 0
                                  ? "Due today"
                                  : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
                              </p>
                            )}

                            {status === "overdue" && (
                              <p className="mt-1 text-xs text-red-300">
                                {Math.abs(daysRemaining || 0)} day(s) overdue
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(status)}`}>
                              {getStatusIcon(status)}
                              {status}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5">
                            <p className="font-semibold text-white">
                              ৳{Number(book.fine_amount || 0).toLocaleString("en-BD")}
                            </p>
                            <p className={`mt-1 text-xs ${book.fine_paid ? "text-emerald-300" : Number(book.fine_amount || 0) > 0 ? "text-amber-300" : "text-slate-500"}`}>
                              {book.fine_paid
                                ? "Paid"
                                : Number(book.fine_amount || 0) > 0
                                  ? "Unpaid"
                                  : "No fine"}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-300">
                            {formatDate(book.return_date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-blue-400/20 px-6 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-blue-200">
                    {filteredBooks.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-blue-200">
                    {issuedBooks.length}
                  </span>{" "}
                  issue records
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={15} className="text-blue-300" />
                  Keep track of your due dates
                </p>
              </div>
            </div>

            {/* Responsive mobile cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
              {filteredBooks.map((book) => {
                const status = getStatus(book);
                const daysRemaining = getDaysRemaining(book.due_date);

                return (
                  <div
                    key={book.id}
                    className="rounded-2xl border border-blue-400/20 bg-slate-900/50 p-5 shadow-lg transition hover:border-blue-300/40"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-3">
                          <BookMarked className="h-6 w-6 text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">
                            Book #{book.book_id}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            Issue ID: #{book.id}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3 border-b border-blue-400/10 pb-3">
                        <span className="text-sm text-slate-400">Issue Date</span>
                        <span className="text-right text-sm text-slate-200">
                          {formatDate(book.issue_date)}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3 border-b border-blue-400/10 pb-3">
                        <span className="text-sm text-slate-400">Due Date</span>
                        <div className="text-right">
                          <p className={`text-sm ${status === "overdue" ? "text-red-300" : "text-slate-200"}`}>
                            {formatDate(book.due_date)}
                          </p>
                          {status === "issued" && daysRemaining !== null && (
                            <p className="mt-1 text-xs text-cyan-300">
                              {daysRemaining === 0
                                ? "Due today"
                                : `${daysRemaining} day(s) left`}
                            </p>
                          )}
                          {status === "overdue" && (
                            <p className="mt-1 text-xs text-red-300">
                              {Math.abs(daysRemaining || 0)} day(s) overdue
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3 border-b border-blue-400/10 pb-3">
                        <span className="text-sm text-slate-400">Fine Amount</span>
                        <div className="text-right">
                          <p className="font-semibold text-white">
                            ৳{Number(book.fine_amount || 0).toLocaleString("en-BD")}
                          </p>
                          <p className={`mt-1 text-xs ${book.fine_paid ? "text-emerald-300" : Number(book.fine_amount || 0) > 0 ? "text-amber-300" : "text-slate-500"}`}>
                            {book.fine_paid
                              ? "Paid"
                              : Number(book.fine_amount || 0) > 0
                                ? "Unpaid"
                                : "No fine"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm text-slate-400">Return Date</span>
                        <span className="text-right text-sm text-slate-200">
                          {formatDate(book.return_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Book titles are not included in the issue response, so records
              are identified by Book ID. A book's details can be loaded
              separately using its book ID.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MyIssuedBooks;