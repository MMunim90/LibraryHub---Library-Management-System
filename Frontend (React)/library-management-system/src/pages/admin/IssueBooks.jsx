import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  Search,
  RefreshCw,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Hash,
  LoaderCircle,
  AlertCircle,
  ClipboardList,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

import { baseURL } from "../../services/BaseURL";
import { AuthContext } from "../../context/AuthContext";

const IssueBooks = () => {
  const { accessToken } = useContext(AuthContext);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const swalTheme = {
    background: "#0f172a",
    color: "#e2e8f0",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#475569",
    iconColor: "#60a5fa",
    showCancelButton: true,
    reverseButtons: true,
    customClass: {
      popup: "libraryhub-swal",
      title: "libraryhub-swal-title",
      confirmButton: "libraryhub-swal-button",
      cancelButton: "libraryhub-swal-button",
    },
  };

  const getErrorMessage = async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  // Load all reservations
  const fetchReservations = useCallback(async () => {
    if (!accessToken) {
      setReservations([]);
      setLoading(false);
      setError("Please log in to access reservations.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${baseURL}/admin/all_reservation`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await getErrorMessage(response);

      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Approve a reservation and issue its book
  const handleApprove = async (reservation) => {
    const result = await Swal.fire({
      ...swalTheme,
      icon: "question",
      title: "Approve Reservation?",
      html: `
        <div style="color:#cbd5e1;font-size:14px;line-height:1.8">
          Are you sure you want to issue this book?
          <br/>
          <span style="color:#93c5fd">Book ID: ${reservation.book_id}</span>
          <br/>
          <span style="color:#93c5fd">Member ID: ${reservation.user_id}</span>
        </div>
      `,
      confirmButtonText: "Yes, Issue Book",
      cancelButtonText: "Go Back",
    });

    if (!result.isConfirmed) return;

    setProcessingId(reservation.id);

    try {
      const response = await fetch(`${baseURL}/admin/create_issue`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book_id: reservation.book_id,
          user_id: reservation.user_id,
        }),
      });

      await getErrorMessage(response);

      await Swal.fire({
        ...swalTheme,
        showCancelButton: false,
        icon: "success",
        title: "Book Issued Successfully!",
        text: `The book for member #${reservation.user_id} has been issued.`,
        confirmButtonText: "Great!",
      });

      await fetchReservations();
    } catch (err) {
      await Swal.fire({
        ...swalTheme,
        showCancelButton: false,
        icon: "error",
        title: "Could Not Issue Book",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Reject a reservation
  const handleReject = async (reservation) => {
    const result = await Swal.fire({
      ...swalTheme,
      icon: "warning",
      title: "Reject Reservation?",
      text: `Are you sure you want to reject reservation #${reservation.id}?`,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      iconColor: "#f87171",
      confirmButtonText: "Yes, Reject It",
      cancelButtonText: "Keep Reservation",
    });

    if (!result.isConfirmed) return;

    setProcessingId(reservation.id);

    try {
      const response = await fetch(
        `${baseURL}/admin/cancel_reservation/${reservation.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await getErrorMessage(response);

      await Swal.fire({
        ...swalTheme,
        showCancelButton: false,
        icon: "success",
        title: "Reservation Rejected",
        text: `Reservation #${reservation.id} has been cancelled.`,
        confirmButtonText: "OK",
      });

      await fetchReservations();
    } catch (err) {
      await Swal.fire({
        ...swalTheme,
        showCancelButton: false,
        icon: "error",
        title: "Could Not Reject Reservation",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Filter reservations
  const filteredReservations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesSearch =
        !query ||
        String(reservation.id).includes(query) ||
        String(reservation.book_id).includes(query) ||
        String(reservation.user_id).includes(query) ||
        String(reservation.status || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        String(reservation.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, searchTerm, statusFilter]);

  const pendingCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "pending"
  ).length;

  const approvedCount = reservations.filter(
    (item) => item.status?.toLowerCase() === "approved"
  ).length;

  const rejectedCount = reservations.filter((item) =>
    ["rejected", "cancelled"].includes(
      item.status?.toLowerCase()
    )
  ).length;

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
      case "approved":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
      case "rejected":
      case "cancelled":
        return "border-red-400/20 bg-red-400/10 text-red-300";
      default:
        return "border-slate-400/20 bg-slate-400/10 text-slate-300";
    }
  };

  const statCards = [
    {
      title: "Total Reservations",
      value: reservations.length,
      icon: ClipboardList,
      color: "text-blue-300",
      iconBg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      title: "Pending Requests",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-300",
      iconBg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      title: "Approved",
      value: approvedCount,
      icon: CheckCircle2,
      color: "text-emerald-300",
      iconBg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      title: "Rejected / Cancelled",
      value: rejectedCount,
      icon: XCircle,
      color: "text-red-300",
      iconBg: "bg-red-400/10",
      border: "border-red-400/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-300">
              <ShieldCheck size={17} />
              <span>LibraryHub Administration</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Issue Books
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Review member reservations, issue books, and manage reservation
              requests from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchReservations}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:border-blue-300/50 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh Reservations
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`rounded-2xl border ${stat.border} bg-slate-900/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    <Icon size={24} className={stat.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="overflow-hidden rounded-2xl border border-blue-400/20 bg-slate-900/60 shadow-2xl shadow-black/20 backdrop-blur-sm">
          {/* Table header */}
          <div className="border-b border-slate-700/70 p-5 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <img className="h-9 w-9" src="../../public/icon.png" alt="" />
                  Reservation Requests
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredReservations.length} reservation
                  {filteredReservations.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
                <div className="relative sm:min-w-72">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reservation, book, member..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-4 text-center">
              <LoaderCircle
                size={38}
                className="animate-spin text-blue-300"
              />
              <div>
                <p className="font-medium text-slate-200">
                  Loading reservations...
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Please wait while we fetch the latest data.
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error state */
            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 rounded-full border border-red-400/20 bg-red-400/10 p-4">
                <AlertCircle size={30} className="text-red-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Unable to Load Reservations
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-400">{error}</p>
              <button
                type="button"
                onClick={fetchReservations}
                className="mt-5 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                Try Again
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 rounded-full border border-blue-400/20 bg-blue-400/10 p-5">
                <ClipboardList size={34} className="text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                No Reservations Found
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try changing your search term or status filter."
                  : "There are no reservations to display right now."}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-sm font-semibold text-blue-300 hover:text-blue-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-700 bg-slate-950/40">
                    <tr className="text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4 font-semibold">
                        Reservation
                      </th>
                      <th className="px-6 py-4 font-semibold">Book ID</th>
                      <th className="px-6 py-4 font-semibold">Member ID</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800/80">
                    {filteredReservations.map((reservation) => {
                      const isPending =
                        reservation.status?.toLowerCase() === "pending";
                      const isProcessing =
                        processingId === reservation.id;

                      return (
                        <tr
                          key={reservation.id}
                          className="transition hover:bg-blue-400/[0.04]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                                <Hash
                                  size={19}
                                  className="text-blue-300"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-100">
                                  #{reservation.id}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Reservation ID
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-200">
                              <BookOpen size={16} className="text-blue-300" />
                              {reservation.book_id}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-medium text-slate-200">
                              <Users size={15} className="text-blue-300" />
                              {reservation.user_id}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <CalendarDays
                                size={16}
                                className="shrink-0 text-blue-300"
                              />
                              <span>{formatDate(reservation.reservation_date)}</span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(reservation.status)}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {reservation.status || "Unknown"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              {isPending ? (
                                <>
                                  <button
                                    type="button"
                                    disabled={isProcessing || processingId !== null}
                                    onClick={() => handleApprove(reservation)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isProcessing ? (
                                      <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={15} />
                                    )}
                                    Approve
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isProcessing || processingId !== null}
                                    onClick={() => handleReject(reservation)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <XCircle size={15} />
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  No actions available
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / tablet cards */}
              <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:hidden">
                {filteredReservations.map((reservation) => {
                  const isPending =
                    reservation.status?.toLowerCase() === "pending";
                  const isProcessing = processingId === reservation.id;

                  return (
                    <div
                      key={reservation.id}
                      className="rounded-xl border border-slate-700/80 bg-slate-950/35 p-4 transition hover:border-blue-400/30 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl border border-blue-400/20 bg-blue-400/10 p-3">
                            <BookOpen size={16} className="text-blue-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              Reservation #{reservation.id}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Library reservation
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusStyle(reservation.status)}`}
                        >
                          {reservation.status || "Unknown"}
                        </span>
                      </div>

                      <div className="my-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                          <p className="text-xs text-slate-500">Book ID</p>
                          <p className="mt-1 font-semibold text-blue-200">
                            #{reservation.book_id}
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                          <p className="text-xs text-slate-500">Member ID</p>
                          <p className="mt-1 font-semibold text-blue-200">
                            #{reservation.user_id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
                        <CalendarDays
                          size={16}
                          className="mt-0.5 shrink-0 text-blue-300"
                        />
                        <span>{formatDate(reservation.reservation_date)}</span>
                      </div>

                      {isPending ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
                          <button
                            type="button"
                            disabled={isProcessing || processingId !== null}
                            onClick={() => handleApprove(reservation)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing || processingId !== null}
                            onClick={() => handleReject(reservation)}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
                          This reservation has already been processed.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          {!loading && !error && reservations.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-700/70 bg-slate-950/30 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {filteredReservations.length} of {reservations.length}{" "}
                reservations
              </p>
              <p className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-300" />
                Admin reservation management
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueBooks;