import { Link } from "react-router";
import { Info, Mail } from "lucide-react";
import { iconURL } from "../services/Icon";

const Footer = () => {
  return (
    <footer className="footer sm:footer-horizontal mt-10 p-10 border-t-1">
      <aside>
        <img className="h-25 w-25" src={iconURL} alt="" />
        <h2 className="text-2xl font-bold text-white">
          Library<span className="text-blue-300">Hub</span>
        </h2>
        <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
      </aside>
      <aside className="md:m-auto">
        <Link
          to="/about"
          className="flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <Info size={18} className="text-blue-300" />
          <p>About Us</p>
        </Link>

        <Link
          to="/contact"
          className="flex items-center gap-2 hover:text-blue-300 transition-colors"
        >
          <Mail size={18} className="text-blue-300" />
          <p>Contact</p>
        </Link>
      </aside>
    </footer>
  );
};

export default Footer;
