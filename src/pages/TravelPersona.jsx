import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TravelPersona() {
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState(1000);
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const interestOptions = [
    "Culture", "Adventure", "Nature", "Food", "History", "Nightlife", "Relaxation", "Shopping"
  ];

  const handleInterestChange = (opt) => {
    setInterests((prev) => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:5001/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests, budget, duration })
      });
      if (!res.ok) throw new Error("Failed to analyze persona");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not get persona. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">Discover Your Travel Persona</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium mb-2">Select your interests:</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(opt => (
              <button type="button" key={opt} onClick={() => handleInterestChange(opt)}
                className={`px-3 py-1 rounded border ${interests.includes(opt) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>{opt}</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Budget (USD):</label>
          <input type="number" min="100" max="20000" value={budget} onChange={e => setBudget(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full" />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Trip Duration (days):</label>
          <input type="number" min="1" max="60" value={duration} onChange={e => setDuration(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full" />
        </div>
        <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded font-semibold" disabled={loading}>
          {loading ? "Analyzing..." : "Find My Persona"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {result && (
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h2 className="text-xl font-bold text-blue-700 mb-2">Your Persona: {result.persona}</h2>
          <div className="mb-2">Cluster Group: <span className="font-semibold">{result.cluster}</span></div>
          <div className="text-gray-600">{result.description || "You love to travel in your own unique way!"}</div>
          <button className="mt-4 underline text-blue-700" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      )}
    </div>
  );
}
