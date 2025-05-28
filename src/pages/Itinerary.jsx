import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ItineraryDay from "../components/ItineraryDay";

const dummyItinerary = [
  {
    day: 1,
    date: "Day 1",
    activities: ["Arrive at destination", "Check in to hotel", "Explore city center"]
  },
  {
    day: 2,
    date: "Day 2",
    activities: ["Visit main museum", "Lunch at local cafe", "Evening walk in park"]
  },
  {
    day: 3,
    date: "Day 3",
    activities: ["Day trip to nearby town", "Try local food", "Night market"]
  }
];

export default function Itinerary() {
  const location = useLocation();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(dummyItinerary);

  function handleAddActivity(dayIdx) {
    const activity = prompt("Enter new activity:");
    if (activity) {
      setItinerary(itinerary => {
        const copy = [...itinerary];
        copy[dayIdx].activities.push(activity);
        return copy;
      });
    }
  }

  function handleEditActivity(dayIdx, actIdx) {
    const activity = prompt("Edit activity:", itinerary[dayIdx].activities[actIdx]);
    if (activity) {
      setItinerary(itinerary => {
        const copy = [...itinerary];
        copy[dayIdx].activities[actIdx] = activity;
        return copy;
      });
    }
  }

  function handleDeleteActivity(dayIdx, actIdx) {
    if (window.confirm("Delete this activity?")) {
      setItinerary(itinerary => {
        const copy = [...itinerary];
        copy[dayIdx].activities.splice(actIdx, 1);
        return copy;
      });
    }
  }

  function handleSaveTrip() {
    // fake saving, just go to saved trips
    navigate("/saved");
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Your Itinerary</h2>
      {itinerary.map((day, i) => (
        <ItineraryDay
          key={i}
          day={day}
          onAdd={() => handleAddActivity(i)}
          onEdit={actIdx => handleEditActivity(i, actIdx)}
          onDelete={actIdx => handleDeleteActivity(i, actIdx)}
        />
      ))}
      <button
        className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
        onClick={handleSaveTrip}
      >
        Save Trip
      </button>
    </div>
  );
}
