import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {useNavigate } from "react-router-dom";

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

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">Solo Travel Planner</Link>
        <ul className="flex gap-6 items-center">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`hover:text-blue-600 transition-colors font-medium ${
                  location.pathname === link.to ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</Link>

          <li>
            {user ? (
              <button
                onClick={handleLogout}
                className="text-gray-700 font-medium hover:text-blue-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`hover:text-blue-600 transition-colors font-medium ${
                  location.pathname === "/login" ? "text-blue-600" : "text-gray-700"
                }`}
              >
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}

