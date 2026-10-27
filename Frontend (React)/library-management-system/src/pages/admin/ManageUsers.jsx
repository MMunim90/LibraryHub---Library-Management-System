import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UserCog,
  Mail,
  Phone,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  UserX,
  User,
} from "lucide-react";
import Swal from "sweetalert2";

import { baseURL } from "../../services/BaseURL";
import { AuthContext } from "../../context/AuthContext";

const API_URL = `${baseURL}/admin/users/all`;

const swalTheme = {
  background: "#0f172a",
  color: "#e2e8f0",
  confirmButtonColor: "#60a5fa",
  cancelButtonColor: "#475569",
  iconColor: "#60a5fa",
  customClass: {
    popup: "libraryhub-swal",
    title: "libraryhub-swal-title",
    confirmButton: "libraryhub-swal-button",
    cancelButton: "libraryhub-swal-button",
  },
};

const roles = ["member", "librarian"];

const roleStyles = {
  librarian: "border-blue-400/30 bg-blue-500/10 text-blue-300",
  member: "border-slate-400/30 bg-slate-500/10 text-slate-300",
};

const ManageUsers = () => {
  const { accessToken } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("member");
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const authHeaders = useCallback(
    (json = false) => ({
      Authorization: `Bearer ${accessToken}`,
      ...(json ? { "Content-Type": "application/json" } : {}),
    }),
    [accessToken],
  );

  const readResponse = async (response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.detail || data?.message || `Request failed (${response.status})`,
      );
    }

    return data;
  };

  // Load all users
  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        setUsers([]);
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: authHeaders(),
        });

        const data = await readResponse(response);

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected users response.");
        }

        // Never use or display password hashes in the UI.
        setUsers(data.map(({ hash_password, password, ...user }) => user));
      } catch (err) {
        setError(err.message || "Failed to load users.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, authHeaders],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search and filter
  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = `${user.firstname || ""} ${user.lastname || ""}`
        .trim()
        .toLowerCase();

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        String(user.username || "")
          .toLowerCase()
          .includes(query) ||
        String(user.email || "")
          .toLowerCase()
          .includes(query) ||
        String(user.phone_number || "")
          .toLowerCase()
          .includes(query) ||
        String(user.id).includes(query);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active === true) ||
        (statusFilter === "inactive" && user.is_active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => user.is_active === true).length,
      librarians: users.filter((user) => user.role === "librarian").length,
      members: users.filter((user) => user.role === "member").length,
    }),
    [users],
  );

  const openRoleModal = (user) => {
    setEditingUser(user);
    setSelectedRole(user.role || "member");
  };

  const closeRoleModal = () => {
    if (updating) return;
    setEditingUser(null);
    setSelectedRole("member");
  };

  // Update user role.
  // Assumes the backend accepts user_id as a query parameter
  // and role in the JSON body.
  const handleUpdateRole = async (e) => {
    e.preventDefault();

    if (!editingUser || selectedRole === editingUser.role) {
      closeRoleModal();
      return;
    }

    setUpdating(true);

    try {
      const url = new URL(`${baseURL}/admin/update_user_role`);
      url.searchParams.set("user_id", editingUser.id);

      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ role: selectedRole }),
      });

      await readResponse(response);

      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingUser.id ? { ...user, role: selectedRole } : user,
        ),
      );

      setEditingUser(null);

      await Swal.fire({
        ...swalTheme,
        icon: "success",
        title: "Role Updated",
        text: `${editingUser.username || editingUser.email} is now a ${selectedRole}.`,
        confirmButtonText: "Okay",
      });
    } catch (err) {
      await Swal.fire({
        ...swalTheme,
        icon: "error",
        iconColor: "#f87171",
        title: "Update Failed",
        text: err.message || "Could not update the user's role.",
        confirmButtonText: "Okay",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Remove user
  const handleRemoveUser = async (user) => {
    const result = await Swal.fire({
      ...swalTheme,
      icon: "warning",
      iconColor: "#f87171",
      title: "Remove this user?",
      text: `${user.firstname || user.username || user.email} will be removed from LibraryHub.`,
      showCancelButton: true,
      confirmButtonText: "Yes, Remove User",
      cancelButtonText: "Keep User",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(user.id);

    try {
      const response = await fetch(`${baseURL}/admin/remove_user/${user.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      await readResponse(response);

      setUsers((previous) => previous.filter((item) => item.id !== user.id));

      await Swal.fire({
        ...swalTheme,
        icon: "success",
        title: "User Removed",
        text: "The user has been removed successfully.",
        confirmButtonText: "Okay",
      });
    } catch (err) {
      await Swal.fire({
        ...swalTheme,
        icon: "error",
        iconColor: "#f87171",
        title: "Removal Failed",
        text: err.message || "Could not remove this user.",
        confirmButtonText: "Okay",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-blue-300/20 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10";

  const fullName = (user) =>
    `${user.firstname || ""} ${user.lastname || ""}`.trim() ||
    user.username ||
    "Unnamed User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-4 text-slate-200 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-blue-300">
              <Users size={17} />
              <span>Administration / Users</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Manage Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage LibraryHub members, and librarians permissions from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-blue-300/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:border-blue-300/40 hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:self-center"
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Users"}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Users",
              value: stats.total,
              icon: Users,
              color: "text-blue-300",
              iconBg: "bg-blue-400/10",
            },
            {
              label: "Active Accounts",
              value: stats.active,
              icon: CheckCircle2,
              color: "text-emerald-300",
              iconBg: "bg-emerald-400/10",
            },
            {
              label: "Librarians",
              value: stats.librarians,
              icon: ShieldCheck,
              color: "text-sky-300",
              iconBg: "bg-sky-400/10",
            },
            {
              label: "Members",
              value: stats.members,
              icon: User,
              color: "text-purple-300",
              iconBg: "bg-purple-400/10",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-blue-300/15 bg-slate-900/45 p-5 shadow-lg shadow-black/10 backdrop-blur-sm transition hover:border-blue-300/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-3 text-3xl font-bold text-white">
                      {loading ? "—" : stat.value}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border border-blue-300/10 p-3 ${stat.iconBg}`}
                  >
                    <Icon size={24} className={stat.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Users section */}
        <section className="overflow-hidden rounded-2xl border border-blue-300/20 bg-slate-900/50 shadow-xl shadow-black/10 backdrop-blur-sm">
          <div className="border-b border-blue-300/15 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Library Users
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {loading
                    ? "Loading user records..."
                    : `${filteredUsers.length} of ${users.length} users shown`}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[650px]">
                <div className="relative sm:col-span-1">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className={`${inputClass} pl-10`}
                    aria-label="Search users"
                  />
                </div>

                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={`${inputClass} appearance-none pr-9`}
                    aria-label="Filter by role"
                  >
                    <option value="all">All Roles</option>
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-300"
                  />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`${inputClass} appearance-none pr-9`}
                    aria-label="Filter by account status"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-300"
                />
                <div>
                  <p className="font-medium text-red-200">
                    Could not load users
                  </p>
                  <p className="mt-1 break-words text-sm text-red-200/70">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchUsers(true)}
                className="rounded-lg border border-red-300/20 px-4 py-2 text-sm font-medium text-red-200 hover:bg-red-400/10"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && !error ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8">
              <LoaderCircle size={36} className="animate-spin text-blue-300" />
              <p className="text-sm text-slate-400">Loading users...</p>
            </div>
          ) : !error && filteredUsers.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <div className="rounded-2xl border border-blue-300/15 bg-blue-400/10 p-4">
                <UserX size={34} className="text-blue-300" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                No users found
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                Try changing your search keywords or filters to find users.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-4 rounded-lg border border-blue-300/20 px-4 py-2 text-sm text-blue-200 transition hover:bg-blue-400/10"
              >
                Clear Filters
              </button>
            </div>
          ) : !error ? (
            <>
              {/* Responsive table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="border-b border-blue-300/15 bg-slate-950/35">
                    <tr className="text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-4 font-semibold">User</th>
                      <th className="px-5 py-4 font-semibold">Contact</th>
                      <th className="px-5 py-4 font-semibold">Role</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-blue-300/10">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-blue-400/[0.04]"
                      >
                        {/* User info */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-300/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-sm font-bold uppercase text-blue-200">
                              {(
                                user.firstname?.[0] ||
                                user.username?.[0] ||
                                user.email?.[0] ||
                                "U"
                              ).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate font-semibold text-slate-100">
                                {fullName(user)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                @{user.username || "username"}
                                <span className="mx-1.5">·</span>
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <Mail
                                size={14}
                                className="shrink-0 text-blue-300"
                              />
                              <span className="max-w-[220px] truncate">
                                {user.email || "No email"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Phone
                                size={13}
                                className="shrink-0 text-blue-300"
                              />
                              {user.phone_number || "No phone number"}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                              roleStyles[user.role] || roleStyles.member
                            }`}
                          >
                            {user.role === "librarian" ? (
                              <UserCog size={13} />
                            ) : (
                              <UserRound size={13} />
                            )}
                            {user.role || "Unknown"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                              user.is_active === true
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                                : "border-red-400/20 bg-red-500/10 text-red-300"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.is_active === true
                                  ? "bg-emerald-300"
                                  : "bg-red-300"
                              }`}
                            />
                            {user.is_active === true ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openRoleModal(user)}
                              title="Update user role"
                              aria-label={`Update role for ${fullName(user)}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-300/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:border-blue-300/40 hover:bg-blue-500/20"
                            >
                              <Pencil size={14} />
                              <span>Role</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveUser(user)}
                              disabled={deletingId === user.id}
                              title="Remove user"
                              aria-label={`Remove ${fullName(user)}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === user.id ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-blue-300/15 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {filteredUsers.length} user
                  {filteredUsers.length !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-300" />
                  User management dashboard
                </span>
              </div>
            </>
          ) : null}
        </section>

        {/* Update role modal */}
        {editingUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeRoleModal();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="update-role-title"
              className="w-full max-w-md rounded-2xl border border-blue-300/20 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-5 shadow-2xl shadow-black/40 sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-3">
                    <ShieldCheck size={23} className="text-blue-300" />
                  </div>

                  <div>
                    <h2
                      id="update-role-title"
                      className="text-lg font-bold text-white"
                    >
                      Update User Role
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Change account permissions
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeRoleModal}
                  disabled={updating}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mt-6 rounded-xl border border-blue-300/15 bg-slate-950/40 p-4">
                <p className="font-semibold text-slate-100">
                  {fullName(editingUser)}
                </p>
                <p className="mt-1 break-all text-sm text-slate-400">
                  {editingUser.email}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Current role: {editingUser.role}
                </p>
              </div>

              <form onSubmit={handleUpdateRole} className="mt-5 space-y-5">
                <div>
                  <label
                    htmlFor="user-role"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Select New Role
                  </label>

                  <div className="relative">
                    <select
                      id="user-role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className={`${inputClass} appearance-none pr-10`}
                      required
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-300"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Librarian role may grant elevated permissions. Only assign
                    roles appropriate for this user's responsibilities.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeRoleModal}
                    disabled={updating}
                    className="rounded-xl border border-slate-600/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating || selectedRole === editingUser.role}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/20 bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
