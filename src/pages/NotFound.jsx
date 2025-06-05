import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <h1 className="text-5xl font-bold text-blue-700 mb-4">404</h1>
      <p className="text-lg text-gray-700 mb-4">Oops! The page you are looking for does not exist.</p>
      <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition">
        Go Home
      </Link>
    </div>
  );
}
