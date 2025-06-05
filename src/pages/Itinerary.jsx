import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { setDoc } from "firebase/firestore";


import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import ItineraryDay from "../components/ItineraryDay";
// import Map from "../components/Map";
// import getCoordinates from "../utils/getCoordinates";

export default function Itinerary() {
  const { user, loading: authLoading } = useAuth();

  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  // const [mapMarkers, setMapMarkers] = useState([]);

  useEffect(() => {
    if (!tripId || user === undefined) return; // wait until user loads
  
  
    const fetchTrip = async () => {
      try {
        // Try to get from user-specific trips
        const userTripRef = doc(db, "users", user.uid, "trips", tripId);
        let tripSnap = await getDoc(userTripRef);
  
        // If not found, fall back to top-level trips
        if (!tripSnap.exists()) {
          const generalTripRef = doc(db, "trips", tripId);
          tripSnap = await getDoc(generalTripRef);
        }
  
        // Still not found? Show error and redirect
        if (!tripSnap.exists()) {
          setError("Trip not found.");
          setTrip(null);
          return;
        }
  
        const tripData = tripSnap.data();
        setTrip(tripData);
        generateAIItinerary(tripData);
      } catch (error) {
        console.error("Error fetching trip:", error);
        setError("Failed to load trip data. Please try again.");
        setTrip(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTrip();
  }, [tripId, user]);
  

  async function generateAIItinerary(trip) {
    setLoading(true);
    setError("");
    try {
      const payload = {
        destination: trip.destination,
        interests: trip.interests,
        startDate: trip.startDate,
        endDate: trip.endDate,
      };

      const response = await fetch("http://localhost:5001/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("AI itinerary generation failed");

      const data = await response.json();
      if (!Array.isArray(data.itinerary)) throw new Error("Itinerary data invalid");

      setItinerary(data.itinerary);

    } catch (error) {
      console.error("Error generating itinerary:", error);
      setError("Failed to generate itinerary. Please try again later.");
      setItinerary([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddActivity(dayIdx) {
    const activity = prompt("Enter new activity:");
    if (activity) {
      setItinerary((prev) => {
        const copy = [...prev];
        copy[dayIdx].activities.push(activity);
        return copy;
      });
    }
  }

  function handleEditActivity(dayIdx, actIdx) {
    const activity = prompt("Edit activity:", itinerary[dayIdx].activities[actIdx]);
    if (activity) {
      setItinerary((prev) => {
        const copy = [...prev];
        copy[dayIdx].activities[actIdx] = activity;
        return copy;
      });
    }
  }

  function handleDeleteActivity(dayIdx, actIdx) {
    if (window.confirm("Delete this activity?")) {
      setItinerary((prev) => {
        const copy = [...prev];
        copy[dayIdx].activities.splice(actIdx, 1);
        return copy;
      });
    }
  }

  async function handleSaveTrip() {
    setSaveLoading(true);
    setSaveSuccess("");
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to save your trip.");
        setSaveLoading(false);
        return;
      }
      const tripToSave = {
        ...trip,
        itinerary,
        createdAt: serverTimestamp(),
      };
      const userTripsRef = collection(db, "users", user.uid, "trips");
      const tripRef = doc(db, "users", user.uid, "trips", tripId);
await setDoc(tripRef, { ...trip, itinerary, updatedAt: serverTimestamp() }, { merge: true });

      setSaveSuccess("Trip saved successfully!");
      setTimeout(() => {
        navigate("/saved");
      }, 1000);
    } catch (error) {
      console.error("Error saving trip:", error);
      setError("Failed to save trip. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center mt-24">
        <span className="inline-block w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></span>
        <div className="text-xl font-semibold text-blue-600 dark:text-blue-200">Loading user or trip...</div>
      </div>
    );
  }
  
  if (error) {
    return <div className="flex flex-col items-center mt-24 text-red-500 font-semibold text-lg">{error}</div>;
  }
  if (!trip) {
    return <div className="flex flex-col items-center mt-24 text-gray-500 font-semibold text-lg">Trip data not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto glass premium-shadow rounded-2xl p-10 mt-12 mb-16">
      <h2 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-400 to-purple-500 dark:from-blue-200 dark:via-purple-400 dark:to-yellow-300 drop-shadow-lg text-center">Your AI-Powered Itinerary</h2>

      {saveSuccess && <div className="mb-6 text-green-600 dark:text-green-300 text-center font-bold text-lg animate-pulse">{saveSuccess}</div>}
      {error && <div className="mb-6 text-red-500 text-center font-bold text-lg">{error}</div>}

      <div className="space-y-8">
        {itinerary.map((day, i) => (
          <ItineraryDay
            key={i}
            day={day}
            onAdd={() => handleAddActivity(i)}
            onEdit={(actIdx) => handleEditActivity(i, actIdx)}
            onDelete={(actIdx) => handleDeleteActivity(i, actIdx)}
          />
        ))}
      </div>

      <button
        className="mt-10 w-full bg-gradient-to-r from-blue-600 to-purple-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all disabled:opacity-60"
        onClick={handleSaveTrip}
        disabled={saveLoading}
      >
        {saveLoading ? (
          <span className="flex items-center justify-center">
            <span className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
            Saving...
          </span>
        ) : "Save Trip"}
      </button>
    </div>
  );
}
