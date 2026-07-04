import { Link } from "react-router-dom";
import logo from "../../assets/logo-light.png";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src={logo}
            alt="MAVEN Logo"
            className="h-9 w-9 object-contain"
          />

          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-wide text-white">
              MAVEN
            </span>

            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              AI Wealth Navigator
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="hidden md:flex items-center gap-8 text-slate-300">
          <a href="#features" className="hover:text-white transition">
            Features
          </a>

          <a href="#agents" className="hover:text-white transition">
            AI Agents
          </a>

          <a href="#about" className="hover:text-white transition">
            About
          </a>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-800 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}