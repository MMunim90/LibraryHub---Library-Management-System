import { useContext, useState } from "react";
import { NavLink, Outlet } from "react-router";
import {
  Home,
  BookmarkCheck,
  Menu,
  X,
  UserRound,
  BookOpen,
  Users,
  ClipboardList,
  BookMarked,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const {authUser} = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const librarian = authUser?.role === "librarian";

  const navItems = [
    {
      title: "Home",
      path: "/",
      icon: Home,
    },
    {
      title: "Profile",
      path: "/profile",
      icon: UserRound,
    },
    {
      title: "My Reservations",
      path: "/dashboard/myReserve",
      icon: BookmarkCheck,
    },
    {
      title: "My Issued Books",
      path: "/dashboard/myIssuedBooks",
      icon: BookMarked,
    },
    librarian && {
      title: "Manage Books",
      path: "/dashboard/manageBooks",
      icon: BookOpen,
    },
    librarian && {
      title: "Manage Users",
      path: "/dashboard/manageUsers",
      icon: Users,
    },
    librarian && {
      title: "Issue Book",
      path: "/dashboard/issueBooks",
      icon: ClipboardList,
    },
    
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-blue-300/20 bg-slate-950 p-4 shadow-2xl transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        ${sidebarOpen ? "lg:w-72" : "lg:w-72"}`}
      >
        {/* Logo and Close Button */}
        <div className="mb-10 flex items-center justify-between px-2 pt-4">
          <NavLink
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <img className="h-11 w-11" src="../../public/icon.png" alt="" />

            <h2 className="text-xl font-bold text-white">
              Library<span className="text-blue-300">Hub</span>
            </h2>
          </NavLink>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-400/10 hover:text-blue-200 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation Label */}
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>

        {/* Navigation Links */}
        <nav>
          <ul className="menu w-full gap-2 p-0">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl py-3 transition ${
                        isActive
                          ? "border border-blue-300/20 bg-blue-500/15 font-semibold text-blue-200"
                          : "text-slate-300 hover:bg-blue-400/10 hover:text-blue-200"
                      }`
                    }
                  >
                    <Icon size={19} className="text-blue-300" />
                    {item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto rounded-xl border border-blue-300/15 bg-blue-400/5 p-3">
          <p className="text-sm font-semibold text-blue-200">
            LibraryHub Dashboard
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Manage your library activities in one place.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:pl-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-blue-300/15 bg-slate-950/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            className="rounded-xl border border-blue-300/20 bg-blue-400/10 p-2.5 text-blue-200 transition hover:bg-blue-400/20"
          >
            {sidebarOpen ? <Menu size={21} /> : <Menu size={21} />}
          </button>

          <div>
            <p className="font-semibold text-white">Dashboard</p>
            <p className="text-xs text-slate-400">Welcome to LibraryHub</p>
          </div>
        </header>

        {/* Nested Route Content */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
