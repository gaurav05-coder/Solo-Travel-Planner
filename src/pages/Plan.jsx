// Plan.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase"; // your firebase config
import { useAuth } from "../context/AuthContext";

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
  const [budget, setBudget] = useState(500);
  const [interests, setInterests] = useState([]);
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

    if (!user) {
      alert("Please log in to save your trip.");
      return;
    }

    setLoading(true);

    try {
      const tripsRef = collection(db, "trips"); // Save trips in top-level 'trips' collection
      const docRef = await addDoc(tripsRef, {
        destination,
        startDate,
        endDate,
        budget,
        interests,
        createdAt: Timestamp.now(),
        userId: user.uid,
      });

      const savedTrip = {
        id: docRef.id,
        destination,
        startDate,
        endDate,
        budget,
        interests,
      };

      // Redirect to Itinerary page and pass the saved trip data in state
      navigate(`/itinerary/${docRef.id}`);



    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    
    
    <form
      className="bg-white max-w-xl mx-auto p-8 rounded-lg shadow-md mt-8"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
        Plan Your Trip
      </h2>
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
      <div className="mb-4">
        <label className="block mb-2 font-medium">Budget ($)</label>
        <input
          type="range"
          min="100"
          max="5000"
          step="50"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full"
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
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Trip & Generate Itinerary"}
      </button>
    </form>
  );
}
