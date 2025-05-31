import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [mapMarkers, setMapMarkers] = useState([]);

  useEffect(() => {
    if (!tripId || !user) return;
  
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
          alert("Trip not found.");
          navigate("/plan");
          return;
        }
  
        const tripData = tripSnap.data();
        setTrip(tripData);
        generateAIItinerary(tripData);
      } catch (error) {
        console.error("Error fetching trip:", error);
        alert("Failed to load trip data.");
        navigate("/plan");
      }
    };
  
    fetchTrip();
  }, [tripId, user]);
  

  async function generateAIItinerary(trip) {
    setLoading(true);
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

      /*
      const markers = [];
      for (let i = 0; i < data.itinerary.length; i++) {
        const dayObj = data.itinerary[i];
        for (let activity of dayObj.activities) {
          const coords = await getCoordinates(activity, trip.destination);
          if (coords) {
            markers.push({
              day: dayObj.day,
              activity,
              coords,
            });
          }
        }
      }
      setMapMarkers(markers);
      */
    } catch (error) {
      console.error("Error generating itinerary:", error);
      alert("AI failed to generate itinerary.");
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
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to save your trip.");
        return;
      }

      const tripToSave = {
        ...trip,
        itinerary,
        createdAt: serverTimestamp(),
      };

      const userTripsRef = collection(db, "users", user.uid, "trips");
      await addDoc(userTripsRef, tripToSave);

      alert("Trip saved successfully!");
      navigate("/saved");
    } catch (error) {
      console.error("Error saving trip:", error);
      alert("Failed to save trip.");
    }
  }

  if (loading || !trip) {
    return <div className="text-center mt-20">Generating your itinerary...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Your Itinerary</h2>

      {itinerary.map((day, i) => (
        <ItineraryDay
          key={i}
          day={day}
          onAdd={() => handleAddActivity(i)}
          onEdit={(actIdx) => handleEditActivity(i, actIdx)}
          onDelete={(actIdx) => handleDeleteActivity(i, actIdx)}
        />
      ))}

      {/* Map commented out */}
      {/* {mapMarkers.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-blue-600">Map View</h3>
          <Map markers={mapMarkers} />
        </div>
      )} */}

      <button
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
        onClick={handleSaveTrip}
      >
        Save Trip
      </button>
    </div>
  );
}
