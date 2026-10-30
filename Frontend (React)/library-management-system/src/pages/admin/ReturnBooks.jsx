import { useContext, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  BookCheck,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Clock,
  DollarSign,
  LoaderCircle,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
} from "lucide-react";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/AuthContext";
import { baseURL } from "../../services/BaseURL";

const ReturnBooks = () => {
  const { accessToken } = useContext(AuthContext);

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("return");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch all issue records
  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);

      try {
        const response = await fetch(`${baseURL}/admin/all_issue`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load issue records");
        }

        setIssues(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Fetch issues error:", error);

        Swal.fire({
          icon: "error",
          title: "Unable to Load Records",
          text: error.message,
          background: "#0f172a",
          color: "#e2e8f0",
          confirmButtonColor: "#3b82f6",
          customClass: {
            popup: "libraryhub-swal",
            title: "libraryhub-swal-title",
            confirmButton: "libraryhub-swal-button",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchIssues();
    }
  }, [accessToken, refreshKey]);

  // Date formatter
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Currency formatter
  const formatFine = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  // Return book
  const handleReturnBook = async (issue) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Return This Book?",
      text: `Are you sure you want to return Issue #${issue.id}?`,
      background: "#0f172a",
      color: "#e2e8f0",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#475569",
      iconColor: "#60a5fa",
      showCancelButton: true,
      confirmButtonText: "Yes, Return Book",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "libraryhub-swal",
        title: "libraryhub-swal-title",
        confirmButton: "libraryhub-swal-button",
      },
    });

    if (!result.isConfirmed) return;

    setActionLoading(`return-${issue.id}`);

    try {
      const response = await fetch(`${baseURL}/admin/return_book/${issue.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to return book");
      }

      await Swal.fire({
        icon: "success",
        title: "Book Returned!",
        text: `${data.message}. Fine: ${formatFine(data["Fine amount"])}`,
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#3b82f6",
        iconColor: "#34d399",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Return Failed",
        text: error.message,
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Pay fine
  const handleFinePayment = async (issue) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Confirm Fine Payment?",
      html: `
        <div style="color:#cbd5e1">
          <p>Issue ID: <strong>#${issue.id}</strong></p>
          <p style="margin-top:10px">Fine Amount:</p>
          <h2 style="color:#60a5fa;font-size:28px;font-weight:700">
            ${formatFine(issue.fine_amount)}
          </h2>
        </div>
      `,
      background: "#0f172a",
      color: "#e2e8f0",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#475569",
      iconColor: "#60a5fa",
      showCancelButton: true,
      confirmButtonText: "Confirm Payment",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "libraryhub-swal",
        title: "libraryhub-swal-title",
        confirmButton: "libraryhub-swal-button",
      },
    });

    if (!result.isConfirmed) return;

    setActionLoading(`fine-${issue.id}`);

    try {
      const response = await fetch(`${baseURL}/admin/fine/pay/${issue.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Fine payment failed");
      }

      await Swal.fire({
        icon: "success",
        title: "Payment Successful!",
        text: data.message || "Fine paid successfully.",
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#3b82f6",
        iconColor: "#34d399",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: error.message,
        background: "#0f172a",
        color: "#e2e8f0",
        confirmButtonColor: "#3b82f6",
        customClass: {
          popup: "libraryhub-swal",
          title: "libraryhub-swal-title",
          confirmButton: "libraryhub-swal-button",
        },
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Summary calculations
  const activeIssues = issues.filter((issue) => issue.status === "issued");

  const returnedIssues = issues.filter((issue) => issue.status === "returned");

  const unpaidFines = issues.filter(
    (issue) =>
      issue.status === "returned" &&
      Number(issue.fine_amount) > 0 &&
      !issue.fine_paid,
  );

  const totalUnpaidFine = unpaidFines.reduce(
    (total, issue) => total + Number(issue.fine_amount || 0),
    0,
  );

  // Filter records according to selected tab and search
  const filteredIssues = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return issues.filter((issue) => {
      const matchesSearch =
        String(issue.id).includes(keyword) ||
        String(issue.book_id).includes(keyword) ||
        String(issue.user_id).includes(keyword) ||
        issue.status?.toLowerCase().includes(keyword);

      if (activeTab === "return") {
        return issue.status === "issued" && matchesSearch;
      }

      return (
        issue.status === "returned" &&
        Number(issue.fine_amount) > 0 &&
        !issue.fine_paid &&
        matchesSearch
      );
    });
  }, [issues, activeTab, searchTerm]);

  const summaryCards = [
    {
      title: "Currently Issued",
      value: activeIssues.length,
      icon: BookOpen,
      color: "text-blue-300",
      bg: "bg-blue-400/10",
    },
    {
      title: "Returned Books",
      value: returnedIssues.length,
      icon: BookCheck,
      color: "text-emerald-300",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Unpaid Fines",
      value: unpaidFines.length,
      icon: AlertCircle,
      color: "text-amber-300",
      bg: "bg-amber-400/10",
    },
    {
      title: "Outstanding Amount",
      value: formatFine(totalUnpaidFine),
      icon: Wallet,
      color: "text-purple-300",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-blue-300">
              <ArrowLeftRight size={17} />
              <span>Librarian / Book Management</span>
            </div>

            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Return & Fine Management
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage book returns, track outstanding fines, and record payments.
            </p>
          </div>

          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-blue-400/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-400/20 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh Records
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-2xl border border-blue-300/15 bg-slate-900/60 p-5 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{card.title}</p>
                    <h2 className="mt-3 text-2xl font-bold text-white">
                      {card.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-3 ${card.bg}`}>
                    <Icon size={25} className={card.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Management Panel */}
        <section className="overflow-hidden rounded-2xl border border-blue-300/15 bg-slate-900/60 shadow-2xl backdrop-blur-sm">
          {/* Tabs */}
          <div className="border-b border-blue-300/15 p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Library Operations
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Select an operation to manage library records.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/70 p-1">
                <button
                  onClick={() => {
                    setActiveTab("return");
                    setSearchTerm("");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    activeTab === "return"
                      ? "bg-blue-500/20 text-blue-200 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BookCheck size={17} />
                  Return Book
                </button>

                <button
                  onClick={() => {
                    setActiveTab("fine");
                    setSearchTerm("");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    activeTab === "fine"
                      ? "bg-blue-500/20 text-blue-200 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <CircleDollarSign size={17} />
                  Fine Payment
                </button>
              </div>
            </div>
          </div>

          {/* Search and Count */}
          <div className="flex flex-col justify-between gap-4 border-b border-blue-300/10 p-4 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h3 className="font-semibold text-white">
                {activeTab === "return"
                  ? "Issued Books"
                  : "Outstanding Fine Payments"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {filteredIssues.length} record(s) found
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by issue, book or user ID..."
                className="w-full rounded-xl border border-blue-300/20 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Records */}
          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3">
              <LoaderCircle size={35} className="animate-spin text-blue-300" />
              <p className="text-sm text-slate-400">Loading issue records...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
              <div className="mb-4 rounded-2xl bg-blue-400/10 p-5">
                {activeTab === "return" ? (
                  <BookOpen size={36} className="text-blue-300" />
                ) : (
                  <Wallet size={36} className="text-blue-300" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-white">
                {activeTab === "return"
                  ? "No Issued Books Found"
                  : "No Outstanding Fines"}
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-400">
                {activeTab === "return"
                  ? "There are currently no books waiting to be returned."
                  : "All fine payments have been completed. No unpaid fines are available."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Issue ID</th>
                      <th className="px-6 py-4">Book / Member</th>
                      <th className="px-6 py-4">Issue Date</th>
                      {activeTab === "return" ? (
                        <th className="px-6 py-4">Due Date</th>
                      ) : (
                        <th className="px-6 py-4">Fine Amount</th>
                      )}
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-blue-300/10">
                    {filteredIssues.map((issue) => (
                      <tr
                        key={issue.id}
                        className="transition hover:bg-blue-400/5"
                      >
                        <td className="px-6 py-5 font-semibold text-blue-200">
                          #{issue.id}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-400/10 p-2">
                              <BookOpen size={19} className="text-blue-300" />
                            </div>

                            <div>
                              <p className="font-medium text-white">
                                Book #{issue.book_id}
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                <UserRound size={12} />
                                Member #{issue.user_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {formatDate(issue.issue_date)}
                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {activeTab === "return"
                            ? formatDate(issue.due_date)
                            : formatFine(issue.fine_amount)}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                              activeTab === "return"
                                ? "bg-blue-400/10 text-blue-300"
                                : "bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {activeTab === "return" ? "Issued" : "Unpaid Fine"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right">
                          {activeTab === "return" ? (
                            <button
                              onClick={() => handleReturnBook(issue)}
                              disabled={actionLoading !== null}
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-500/15 px-4 py-2.5 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading === `return-${issue.id}` ? (
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <BookCheck size={15} />
                              )}
                              Return Book
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFinePayment(issue)}
                              disabled={actionLoading !== null}
                              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {actionLoading === `fine-${issue.id}` ? (
                                <LoaderCircle
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <DollarSign size={15} />
                              )}
                              Pay Fine
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="rounded-xl border border-blue-300/15 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-400/10 p-3">
                          <BookOpen size={22} className="text-blue-300" />
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            Book #{issue.book_id}
                          </p>
                          <p className="text-xs text-slate-400">
                            Issue #{issue.id}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                        {activeTab === "return" ? "Issued" : "Unpaid"}
                      </span>
                    </div>

                    <div className="my-4 space-y-3 border-y border-blue-300/10 py-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-400">
                          <UserRound size={15} />
                          Member
                        </span>
                        <span className="text-slate-200">#{issue.user_id}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-400">
                          <CalendarDays size={15} />
                          Issue Date
                        </span>
                        <span className="text-slate-200">
                          {formatDate(issue.issue_date)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-400">
                          {activeTab === "return" ? (
                            <Clock size={15} />
                          ) : (
                            <DollarSign size={15} />
                          )}
                          {activeTab === "return" ? "Due Date" : "Fine"}
                        </span>
                        <span className="font-semibold text-blue-200">
                          {activeTab === "return"
                            ? formatDate(issue.due_date)
                            : formatFine(issue.fine_amount)}
                        </span>
                      </div>
                    </div>

                    {activeTab === "return" ? (
                      <button
                        onClick={() => handleReturnBook(issue)}
                        disabled={actionLoading !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500/15 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/25 disabled:opacity-50"
                      >
                        {actionLoading === `return-${issue.id}` ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <BookCheck size={17} />
                        )}
                        Return Book
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFinePayment(issue)}
                        disabled={actionLoading !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/15 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        {actionLoading === `fine-${issue.id}` ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <DollarSign size={17} />
                        )}
                        Pay Fine
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Information Note */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-300/15 bg-blue-400/5 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-300" />
          <div>
            <p className="text-sm font-semibold text-blue-200">
              Important Information
            </p>
            <p className="mt-1 text-xs leading-6 text-slate-400">
              Returning a book automatically updates its availability and
              calculates any applicable fine. Fine payments are recorded
              separately after a book has been returned.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnBooks;
