import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">Welcome to Solo Travel Planner</h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-xl mx-auto mb-6">
          Plan your next solo adventure with ease. Discover, organize, and personalize your journeys. Empower your solo travel experience!
        </p>
        <Link to="/plan">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition">Start Planning</button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <Link to="/saved" className="text-blue-600 hover:underline">Saved Trips</Link>
        <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
        <Link to="/learn-more" className="text-blue-600 hover:underline">Learn More</Link>
      </div>
    </section>
  );
}
