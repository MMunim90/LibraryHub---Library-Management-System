import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  LibraryBig,
  BookCopy,
  CircleDollarSign,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  Layers3,
  UserRound,
  Tag,
} from "lucide-react";
import Swal from "sweetalert2";

import { baseURL } from "../../services/BaseURL";
import { AuthContext } from "../../context/AuthContext";

const BOOKS_URL = `${baseURL}/books/all`;
const CREATE_BOOK_URL = `${baseURL}/admin/create_book`;

const initialForm = {
  title: "",
  author: "",
  category: "",
  description: "",
  price: 0,
  total_copies: 1,
  available_copies: 1,
  cover_image: "",
};

const swalTheme = {
  background: "#0f172a",
  color: "#e2e8f0",
  confirmButtonColor: "#60a5fa",
  cancelButtonColor: "#475569",
  iconColor: "#60a5fa",
};

const ManageBooks = () => {
  const { accessToken } = useContext(AuthContext);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken],
  );

  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();
      return (
        data.detail ||
        data.message ||
        `Request failed with status ${response.status}`
      );
    } catch {
      return `Request failed with status ${response.status}`;
    }
  };

  const showAlert = (title, text, icon = "success") =>
    Swal.fire({
      ...swalTheme,
      title,
      text,
      icon,
      confirmButtonText: "Okay",
      customClass: {
        popup: "libraryhub-swal",
        title: "libraryhub-swal-title",
        confirmButton: "libraryhub-swal-button",
      },
    });

  const fetchBooks = useCallback(
    async (showRefresh = false) => {
      if (!accessToken) {
        setBooks([]);
        setError("Please log in with an authorized account.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const response = await fetch(BOOKS_URL, {
          method: "GET",
          headers: authHeaders,
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load books.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, authHeaders],
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return books;

    return books.filter((book) =>
      [book.title, book.author, book.category, String(book.id)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [books, searchTerm]);

  const totalCopies = books.reduce(
    (sum, book) => sum + (Number(book.total_copies) || 0),
    0,
  );

  const availableCopies = books.reduce(
    (sum, book) => sum + (Number(book.available_copies) || 0),
    0,
  );

  const openCreateModal = () => {
    setEditingBook(null);
    setForm({ ...initialForm });
    setModalOpen(true);
  };

  const openUpdateModal = (book) => {
    setEditingBook(book);

    setForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      description: book.description || "",
      price: Number(book.price) || 0,
      total_copies: Number(book.total_copies) || 0,
      available_copies: Number(book.available_copies) || 0,
      cover_image: book.cover_image || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingBook(null);
    setForm({ ...initialForm });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = { ...previous, [name]: value };

      // Keep available copies within the total copies count.
      if (name === "total_copies") {
        const total = Number(value);
        if (Number.isFinite(total) && total >= 0) {
          updated.available_copies = Math.min(
            Number(previous.available_copies) || 0,
            total,
          );
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!accessToken) {
      showAlert("Authentication required", "Please log in again.", "error");
      return;
    }

    const total = Number(form.total_copies);
    const available = Number(form.available_copies);
    const price = Number(form.price);

    if (!form.title.trim() || !form.author.trim() || !form.category.trim()) {
      showAlert(
        "Missing information",
        "Title, author, and category are required.",
        "warning",
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(total) ||
      total < (editingBook ? 0 : 1)
    ) {
      showAlert(
        "Invalid book details",
        "Price must be non-negative and total copies must be a valid whole number.",
        "warning",
      );
      return;
    }

    if (
      editingBook &&
      (!Number.isInteger(available) || available < 0 || available > total)
    ) {
      showAlert(
        "Invalid available copies",
        "Available copies must be between zero and total copies.",
        "warning",
      );
      return;
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      total_copies: Number(form.total_copies),
      cover_image: form.cover_image.trim(),
    };

    if (editingBook) {
      payload.available_copies = Number(form.available_copies);
    }

    setSubmitting(true);

    try {
      const url = editingBook
        ? `${baseURL}/admin/update_book/${editingBook.id}`
        : CREATE_BOOK_URL;

      const response = await fetch(url, {
        method: editingBook ? "PUT" : "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setModalOpen(false);
      setEditingBook(null);
      setForm({ ...initialForm });

      await fetchBooks();

      await showAlert(
        editingBook ? "Book updated!" : "Book added!",
        editingBook
          ? "The book details have been updated successfully."
          : "The new book has been added to your library.",
        "success",
      );
    } catch (err) {
      showAlert(
        "Operation failed",
        err.message || "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (book) => {
    const result = await Swal.fire({
      ...swalTheme,
      title: "Delete this book?",
      text: `"${book.title}" will be removed from the library.`,
      icon: "warning",
      iconColor: "#f87171",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete It",
      cancelButtonText: "Keep Book",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
      customClass: {
        popup: "libraryhub-swal",
        title: "libraryhub-swal-title",
        confirmButton: "libraryhub-swal-button",
        cancelButton: "libraryhub-swal-button",
      },
    });

    if (!result.isConfirmed) return;

    if (!accessToken) {
      showAlert("Authentication required", "Please log in again.", "error");
      return;
    }

    setDeletingId(book.id);

    try {
      const response = await fetch(`${baseURL}/admin/delete_book/${book.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setBooks((previous) => previous.filter((item) => item.id !== book.id));

      await showAlert(
        "Book deleted",
        "The book has been removed successfully.",
        "success",
      );
    } catch (err) {
      showAlert(
        "Delete failed",
        err.message || "Unable to delete this book.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-blue-300/20 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

  const labelClass = "mb-2 block text-sm font-medium text-slate-300";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-300">
              <LibraryBig size={18} />
              <span>LibraryHub / Administration</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Manage Books
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Add new books, update existing records, and keep your library
              collection organized.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/30 bg-blue-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <Plus size={20} />
            Add New Book
          </button>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-300/20 bg-slate-900/50 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Titles</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {books.length}
                </p>
              </div>
              <div className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-3">
                <img className="h-7 w-7" src="../../public/icon.png" alt="" />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Different books in your collection
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/20 bg-slate-900/50 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Copies</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {totalCopies}
                </p>
              </div>
              <div className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-3">
                <BookCopy className="text-blue-300" size={25} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Copies across all book titles
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/20 bg-slate-900/50 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Available Copies</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {availableCopies}
                </p>
              </div>
              <div className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-3">
                <CheckCircle2 className="text-blue-300" size={25} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Copies currently available
            </p>
          </div>
        </section>

        {/* Books table */}
        <section className="overflow-hidden rounded-2xl border border-blue-300/20 bg-slate-900/60 shadow-2xl shadow-slate-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-blue-300/15 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Book Collection
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {filteredBooks.length}{" "}
                {filteredBooks.length === 1 ? "book" : "books"} found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search title, author, category..."
                  className="w-full rounded-xl border border-blue-300/20 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400 sm:w-72"
                />
              </label>

              <button
                type="button"
                onClick={() => fetchBooks(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-blue-400/10 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm text-red-200">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </p>
              <button
                type="button"
                onClick={() => fetchBooks(true)}
                className="self-start text-sm font-semibold text-blue-300 hover:text-blue-200 sm:self-auto"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3">
              <LoaderCircle size={36} className="animate-spin text-blue-300" />
              <p className="text-sm text-slate-400">Loading your books...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
              <div className="rounded-2xl border border-blue-300/20 bg-blue-400/10 p-4">
                <BookOpen size={32} className="text-blue-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {searchTerm ? "No matching books" : "Your collection is empty"}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                {searchTerm
                  ? "Try another title, author, category, or book ID."
                  : "Add your first book to start building your library collection."}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  <Plus size={18} />
                  Add Your First Book
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-blue-300/15 bg-slate-950/40 text-xs uppercase tracking-wider text-blue-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Book</th>
                    <th className="px-5 py-4 font-semibold">Category</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Copies</th>
                    <th className="px-5 py-4 font-semibold">Availability</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-blue-300/10">
                  {filteredBooks.map((book) => {
                    const total = Number(book.total_copies) || 0;
                    const available = Number(book.available_copies) || 0;

                    return (
                      <tr
                        key={book.id}
                        className="transition hover:bg-blue-400/[0.04]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-blue-300/20 bg-blue-400/10">
                              {book.cover_image ? (
                                <img
                                  src={book.cover_image}
                                  alt={book.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <img
                                  className="h-7 w-7"
                                  src="../../public/icon.png"
                                  alt=""
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-xs truncate font-semibold text-white">
                                {book.title}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                                <UserRound
                                  size={13}
                                  className="text-blue-300"
                                />
                                <span className="max-w-xs truncate">
                                  {book.author}
                                </span>
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                ID: {book.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300/15 bg-blue-400/10 px-2.5 py-1.5 text-xs text-blue-200">
                            <Tag size={13} />
                            {book.category || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-200">
                          <span className="inline-flex items-center gap-1">
                            <CircleDollarSign
                              size={16}
                              className="text-blue-300"
                            />
                            ৳{Number(book.price || 0).toLocaleString("en-BD")}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-slate-200">
                            {available}{" "}
                            <span className="text-slate-500">/ {total}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Available / Total
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                              available > 0
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                available > 0
                                  ? "bg-emerald-300"
                                  : "bg-amber-300"
                              }`}
                            />
                            {available > 0 ? "Available" : "Out of stock"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openUpdateModal(book)}
                              title="Update book"
                              aria-label={`Update ${book.title}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/40 hover:bg-blue-400/20"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(book)}
                              disabled={deletingId === book.id}
                              title="Delete book"
                              aria-label={`Delete ${book.title}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === book.id ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredBooks.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-blue-300/15 bg-slate-950/20 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span>
                Showing {filteredBooks.length} of {books.length} books
              </span>
              <span className="flex items-center gap-1.5">
                <Layers3 size={14} className="text-blue-300" />
                LibraryHub Admin Panel
              </span>
            </div>
          )}
        </section>
      </div>

      {/* Create / Update Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-modal-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-300/25 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 shadow-2xl shadow-black/40"
          >
            <div className="flex items-center justify-between border-b border-blue-300/15 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-3">
                  {editingBook ? (
                    <Pencil size={22} className="text-blue-300" />
                  ) : (
                    <Plus size={22} className="text-blue-300" />
                  )}
                </div>
                <div>
                  <h2
                    id="book-modal-title"
                    className="text-xl font-bold text-white"
                  >
                    {editingBook ? "Update Book" : "Add New Book"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {editingBook
                      ? `Editing book #${editingBook.id}`
                      : "Enter the details of the new book"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close modal"
                className="rounded-lg border border-blue-300/15 p-2 text-slate-400 transition hover:bg-blue-400/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Book Title <span className="text-blue-300">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Clean Code"
                    className={inputClass}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="author" className={labelClass}>
                    Author <span className="text-blue-300">*</span>
                  </label>
                  <input
                    id="author"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="e.g. Robert C. Martin"
                    className={inputClass}
                    required
                    maxLength={150}
                  />
                </div>

                <div>
                  <label htmlFor="category" className={labelClass}>
                    Category <span className="text-blue-300">*</span>
                  </label>
                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineering"
                    className={inputClass}
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor="price" className={labelClass}>
                    Price (৳)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="total_copies" className={labelClass}>
                    Total Copies
                  </label>
                  <input
                    id="total_copies"
                    name="total_copies"
                    type="number"
                    min={editingBook ? "0" : "1"}
                    step="1"
                    value={form.total_copies}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                {editingBook && (
                  <div>
                    <label htmlFor="available_copies" className={labelClass}>
                      Available Copies
                    </label>
                    <input
                      id="available_copies"
                      name="available_copies"
                      type="number"
                      min="0"
                      max={form.total_copies}
                      step="1"
                      value={form.available_copies}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Cannot exceed the total number of copies.
                    </p>
                  </div>
                )}
              </div>

              {editingBook && (
                <div>
                  <label htmlFor="cover_image" className={labelClass}>
                    Cover Image URL
                  </label>

                  <input
                    id="cover_image"
                    name="cover_image"
                    type="url"
                    value={form.cover_image}
                    onChange={handleChange}
                    placeholder="https://example.com/book-cover.jpg"
                    className={inputClass}
                  />

                  {form.cover_image && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs text-slate-400">
                        Cover preview
                      </p>
                      <img
                        src={form.cover_image}
                        alt="Book cover preview"
                        className="h-32 w-24 rounded-lg border border-blue-300/20 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        onLoad={(e) => {
                          e.currentTarget.style.display = "block";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a short description about this book..."
                  rows={4}
                  className={`${inputClass} resize-y`}
                  maxLength={3000}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-blue-300/15 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-blue-300/20 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-blue-400/10 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingBook ? <Pencil size={17} /> : <Plus size={18} />}
                      {editingBook ? "Save Changes" : "Add Book"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
