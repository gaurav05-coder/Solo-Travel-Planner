// Plan.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase"; // your firebase config
import { useAuth } from "../context/AuthContext";
import { getDoc, doc } from "firebase/firestore";

const interestsList = [
  "Nature",
  "Museums",
  "Nightlife",
  "Food",
  "History",
  "Shopping",
  "Beaches",
  "Adventure",
];

export default function Plan() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [interests, setInterests] = useState([]);
  const [visibility, setVisibility] = useState("private");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  function handleInterestChange(interest) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (!user) {
      setError("You must be logged in to plan a trip.");
      return;
    }
    if (!destination.trim()) {
      setError("Destination is required.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start and end dates are required.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }
    if (budget < 100) {
      setError("Budget must be at least $100.");
      return;
    }
    if (interests.length === 0) {
      setError("Please select at least one interest.");
      return;
    }

    setLoading(true);
    try {
      const userTripsRef = collection(db, "users", user.uid, "trips");
      const tripData = {
        destination,
        startDate,
        endDate,
        budget: Number(budget),
        interests,
        visibility,
        persona: "Foodie Drifter", // 👈 Add this
        likes: 0, // 👈 Optional but useful for Explore
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(userTripsRef, tripData);

      // 🛠 Wait until Firestore confirms the trip is available
      let retries = 0;
      let tripExists = false;
      
      while (retries < 5) {
        const tripSnap = await getDoc(docRef);
        if (tripSnap.exists()) {
          tripExists = true;
          break;
        }
        await new Promise((res) => setTimeout(res, 200)); // wait 200ms before retrying
        retries++;
      }
      
      if (tripExists) {
        navigate(`/itinerary/${docRef.id}`);
      } else {
        setError("Trip was saved but could not be found. Please try again.");
      }
      
    } catch (error) {
      console.error("Error saving trip:", error);
      setError("Failed to save trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="bg-white max-w-xl mx-auto p-8 rounded-lg shadow-md mt-8 text-center">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">Plan Your Trip</h2>
        <p className="mb-4 text-gray-700">Please <a href="/login" className="text-blue-600 underline">log in</a> to plan and save your trip.</p>
      </div>
    );
  }

  return (
    <form
      className="bg-white max-w-xl mx-auto p-8 rounded-lg shadow-md mt-8"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
        Plan Your Trip
      </h2>
      {error && <div className="mb-4 text-red-600 text-center font-medium">{error}</div>}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Destination</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-2 font-medium">Start Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label className="block mb-2 font-medium">End Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Budget (USD)</label>
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          min="100"
          max="5000"
          step="50"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
        <div className="text-right text-sm text-gray-600">${budget}</div>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Travel Interests</label>
        <div className="flex flex-wrap gap-2">
          {interestsList.map((interest) => (
            <button
              type="button"
              key={interest}
              className={`px-4 py-2 rounded-full border transition ${
                interests.includes(interest)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
              onClick={() => handleInterestChange(interest)}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Visibility</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            <span>Private</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            <span>Public</span>
          </label>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Saving...
          </span>
        ) : "Save Trip & Generate Itinerary"}
      </button>
    </form>
  );
}
