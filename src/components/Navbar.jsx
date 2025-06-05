import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Dark mode logic
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);
  return [dark, setDark];
}


export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/plan", label: "Plan a Trip" },
    { to: "/saved", label: "Saved Trips" },
  ];

  const [dark, setDark] = useDarkMode();
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="glass-navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 md:px-8">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2 text-3xl font-extrabold text-blue-700 dark:text-blue-200 tracking-tight drop-shadow-lg">
          <span className="inline-block bg-gradient-to-r from-blue-500 via-green-400 to-purple-500 bg-clip-text text-transparent">Solo</span>
          <span className="hidden sm:inline">Travel Planner</span>
        </Link>
        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 items-center text-lg font-medium">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors ${location.pathname === link.to ? "text-blue-600 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-300 transition-colors text-blue-700 dark:text-blue-300">Dashboard</Link>
          </li>
          <li>
            {user ? (
              <button
                onClick={handleLogout}
                className="text-gray-700 dark:text-gray-300 font-medium hover:text-blue-600 dark:hover:text-blue-300 transition-colors px-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-medium ${location.pathname === "/login" ? "text-blue-600 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}
              >
                Login
              </Link>
            )}
          </li>
          {/* Dark mode toggle */}
          <li>
  <button
    onClick={() => setDark((d) => !d)}
    className="glass-toggle flex items-center justify-center w-8 h-8 rounded-full transition-all focus:outline-none"
    aria-label="Toggle dark/light mode"
  >
    <span className="material-symbols-outlined align-middle">
      {dark ? "dark_mode" : "light_mode"}
    </span>
  </button>
</li>
        </ul>
        {/* Mobile Hamburger */}
        <button className="md:hidden text-3xl text-blue-700 dark:text-blue-200" onClick={() => setMobileMenu(m => !m)} aria-label="Open menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden bg-white/95 dark:bg-[#181e2a]/95 shadow-lg border-t border-blue-100 dark:border-blue-900">
          <ul className="flex flex-col gap-4 p-6 text-lg font-medium">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileMenu(false)}
                  className={`block py-2 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors ${location.pathname === link.to ? "text-blue-600 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/dashboard" onClick={() => setMobileMenu(false)} className="block py-2 px-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-blue-700 dark:text-blue-300">Dashboard</Link>
            </li>
            <li>
              {user ? (
                <button
                  onClick={() => { setMobileMenu(false); handleLogout(); }}
                  className="w-full text-left py-2 px-2 rounded text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenu(false)}
                  className={`block py-2 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors font-medium ${location.pathname === "/login" ? "text-blue-600 dark:text-blue-200" : "text-gray-700 dark:text-gray-300"}`}
                >
                  Login
                </Link>
              )}
            </li>
            {/* Dark mode toggle for mobile */}
            <li>
  <button
    onClick={() => setDark((d) => !d)}
    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-[#232946]/80 shadow border border-blue-200 dark:border-blue-800 text-xl text-blue-700 dark:text-yellow-200 hover:scale-110 transition-all focus:outline-none"
    aria-label="Toggle dark/light mode"
  >
    <span className="material-symbols-outlined align-middle">
      {dark ? "dark_mode" : "light_mode"}
    </span>
  </button>
</li>
          </ul>
        </div>
      )}
    </nav>
  );
}

