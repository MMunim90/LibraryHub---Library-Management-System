import { Link, NavLink } from "react-router";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import {
  BookOpen,
  Info,
  Mail,
  UserRound,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { iconURL } from "../services/Icon";

const Navbar = () => {
  const { authUser, logout } = useContext(AuthContext);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-blue-500/15 text-blue-300 font-semibold border border-blue-400/30"
        : "text-slate-300 hover:bg-white/5 hover:text-blue-200"
    }`;

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              aria-label="Menu"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {" "}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />{" "}
            </svg>
          </div>
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-4 shadow gap-2"
          >
            <li>
              <NavLink to="/allBooks" className={navLinkClass}>
                <BookOpen size={18} />
                Books
              </NavLink>
            </li>

            <li>
              <NavLink to="/about" className={navLinkClass}>
                <Info size={18} />
                About Us
              </NavLink>
            </li>

            <li>
              <NavLink to="/contact" className={navLinkClass}>
                <Mail size={18} />
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
        <Link to={"/"} className="btn btn-ghost text-xl">
          <img className="h-9 w-9" src={iconURL} alt="" />
          <h2 className="text-xl font-bold text-white">
            Library<span className="text-blue-300">Hub</span>
          </h2>
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-8">
          <li>
            <NavLink to="/allBooks" className={navLinkClass}>
              <BookOpen size={18} />
              Books
            </NavLink>
          </li>

          <li>
            <NavLink to="/about" className={navLinkClass}>
              <Info size={18} />
              About Us
            </NavLink>
          </li>

          <li>
            <NavLink to="/contact" className={navLinkClass}>
              <Mail size={18} />
              Contact
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        {/* Login Button */}

        {authUser ? (
          <div className="dropdown dropdown-end mr-2 md:mr-8">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 border border-blue-400 flex items-center justify-center">
                <span className="text-blue-300 text-lg font-bold uppercase">
                  {authUser?.email?.charAt(0) || "U"}
                </span>
              </div>
            </div>
            <ul
              tabIndex={-1}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-4 shadow gap-2"
            >
              <li>
                <Link to={"/profile"} className="flex items-center gap-2">
                  <UserRound size={18} />
                  Profile
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard/myReserve"
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  to="/"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <button
            className="btn btn-primary mr-2 md:mr-8"
            onClick={() => document.getElementById("my_modal_3").showModal()}
          >
            Login
          </button>
        )}

        {/* Login Modal */}
        <dialog
          id="my_modal_3"
          className="modal modal-bottom sm:modal-middle p-2"
        >
          <Login />
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        {/* Signup Modal */}
        <dialog
          id="signup_modal"
          className="modal modal-bottom sm:modal-middle p-2"
        >
          <SignUp />
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export default Navbar;
