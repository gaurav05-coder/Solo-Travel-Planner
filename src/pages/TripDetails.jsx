// src/pages/TripDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedItinerary, setEditedItinerary] = useState([]);
  const [saving, setSaving] = useState(false);
  const [similarTrips, setSimilarTrips] = useState([]);

  useEffect(() => {
    async function fetchTrip() {
      setLoading(true);
      setError("");
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const tripDoc = await getDoc(doc(db, "users", user.uid, "trips", tripId));
        if (tripDoc.exists()) {
          setTrip({ ...tripDoc.data(), id: tripId, userId: user.uid });
          setEditedItinerary(tripDoc.data().itinerary || []);
          fetchSimilarTrips(tripDoc.data());
        } else {
          setError("Trip not found.");
        }
      } catch {
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();
  }, [tripId]);

  async function fetchSimilarTrips(currentTrip) {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      let allTrips = [];

      for (const userDoc of usersSnap.docs) {
        const tripsSnap = await getDocs(collection(db, "users", userDoc.id, "trips"));
        tripsSnap.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data.visibility === "public" && docSnap.id !== currentTrip.id) {
            allTrips.push({ ...data, id: docSnap.id, userId: userDoc.id });
          }
        });
      }

      function computeSimilarity(a, b) {
        let score = 0;
        if (a.destination && b.destination && a.destination.toLowerCase() === b.destination.toLowerCase()) score += 5;
        if (a.interests && b.interests) {
          const overlap = a.interests.filter(i => b.interests.includes(i)).length;
          score += overlap * 2;
        }
        if (a.persona && b.persona && a.persona === b.persona) score += 2;
        return score;
      }

      const scored = allTrips.map(t => ({ ...t, _sim: computeSimilarity(currentTrip, t) }));
      scored.sort((a, b) => b._sim - a._sim);
      setSimilarTrips(scored.slice(0, 5));
    } catch {
      setSimilarTrips([]);
    }
  }

  function handleEdit() {
    setEditMode(true);
  }

  function handleCancel() {
    setEditMode(false);
    setEditedItinerary(trip.itinerary || []);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await updateDoc(doc(db, "users", user.uid, "trips", tripId), {
        itinerary: editedItinerary,
      });
      setTrip({ ...trip, itinerary: editedItinerary });
      setEditMode(false);
    } catch {
      setError("Failed to save itinerary.");
    }
    setSaving(false);
  }

  function handleItineraryChange(dayIdx, value) {
    setEditedItinerary(editedItinerary.map((day, idx) =>
      idx === dayIdx ? { ...day, activities: value.split("\n") } : day
    ));
  }

  function exportPDF() {
    if (!trip) return;
    const docx = new jsPDF();
    docx.setFontSize(18);
    docx.text(trip.destination, 10, 15);
    docx.setFontSize(12);
    docx.text(`Dates: ${trip.startDate} - ${trip.endDate}`, 10, 25);
    docx.text(`Interests: ${(trip.interests || []).join(", ")}`, 10, 32);
    docx.text(`Itinerary:`, 10, 40);
    let y = 47;
    editedItinerary.forEach((day) => {
      docx.text(`${day.day}:`, 12, y);
      y += 6;
      day.activities.forEach((act) => {
        docx.text(`- ${act}`, 16, y);
        y += 6;
      });
      y += 2;
      if (y > 270) {
        docx.addPage();
        y = 15;
      }
    });
    docx.save(`${trip.destination}-itinerary.pdf`);
  }

  function exportICS() {
    if (!trip || !Array.isArray(editedItinerary)) return;
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID=-//SoloTravelPlanner//EN\n";
    const start = new Date(trip.startDate);
    editedItinerary.forEach((day, idx) => {
      const eventDate = new Date(start);
      eventDate.setDate(start.getDate() + idx);
      const dt = eventDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      ics += `BEGIN:VEVENT\nSUMMARY:${trip.destination} - ${day.day}\nDESCRIPTION:${day.activities.join(", ")}\nDTSTART:${dt}\nDTEND:${dt}\nEND:VEVENT\n`;
    });
    ics += "END:VCALENDAR";
    const blob = new Blob([ics], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${trip.destination}-itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleMap() {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.destination)}`, "_blank");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-24">
        <span className="inline-block w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></span>
        <div className="text-xl font-semibold text-blue-600 dark:text-blue-200">Loading trip...</div>
      </div>
    );
  }

  if (error) {
    return <div className="flex flex-col items-center mt-24 text-red-500 font-semibold text-lg">{error}</div>;
  }

  if (!trip) {
    return <div className="flex flex-col items-center mt-24 text-gray-500 font-semibold text-lg">Trip not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto glass premium-shadow rounded-2xl p-10 mt-12 mb-16">
      <h1 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-400 to-purple-500 dark:from-blue-200 dark:via-purple-400 dark:to-yellow-300 drop-shadow-lg text-center">
        {trip.destination}
      </h1>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-4 py-2 font-semibold text-sm shadow">Dates: {trip.startDate} - {trip.endDate}</span>
        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full px-4 py-2 font-semibold text-sm shadow">Budget: ${trip.budget}</span>
        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full px-4 py-2 font-semibold text-sm shadow">Interests: {trip.interests?.join(", ")}</span>
      </div>

      {/* Smart Budget Breakdown (optional section) */}
      {trip.budget && (
        <div className="mt-6 mb-8">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">Smart Budget Breakdown</h3>
          <ul className="space-y-1 text-sm">
            {[
              { label: "Accommodation", percent: 0.4 },
              { label: "Food", percent: 0.25 },
              { label: "Transport", percent: 0.15 },
              { label: "Activities", percent: 0.15 },
              { label: "Miscellaneous", percent: 0.05 },
            ].map((item) => (
              <li key={item.label} className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-1">
                <span>{item.label}</span>
                <span>${(trip.budget * item.percent).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-6 mb-8">
        <button onClick={exportPDF} className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all">Export PDF</button>
        <button onClick={exportICS} className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all">Export to Calendar</button>
        <button onClick={handleMap} className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all">View Map</button>
      </div>

      {/* Edit Buttons */}
      <div className="flex gap-3 mb-6">
        {!editMode && (
          <button onClick={handleEdit} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all">✏️ Edit Itinerary</button>
        )}
        {editMode && (
          <>
            <button onClick={handleSave} className="bg-green-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all disabled:opacity-60" disabled={saving}>
              {saving ? (
                <span className="flex items-center">
                  <span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Saving...
                </span>
              ) : "Save"}
            </button>
            <button onClick={handleCancel} className="bg-gray-400 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all">Cancel</button>
          </>
        )}
      </div>

      {/* Itinerary */}
      <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mt-8 mb-4 text-center">Itinerary</h2>
      <ul className="space-y-5">
        {(editMode ? editedItinerary : trip.itinerary)?.map((day, idx) => (
          <li key={idx} className="glass bg-blue-50/60 dark:bg-blue-900/40 rounded-xl p-5 shadow">
            <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">{day.day}</div>
            {editMode ? (
              <textarea
                className="border rounded-xl w-full mt-2 p-3 text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-[#232946]/70 shadow"
                rows={3}
                value={day.activities.join("\n")}
                onChange={(e) => handleItineraryChange(idx, e.target.value)}
              />
            ) : (
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {day.activities.map((activity, i) => (
                  <li key={i}>{activity}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Similar Trips */}
      <div className="mt-12">
        <h3 className="font-bold text-blue-700 dark:text-blue-200 mb-4 text-xl">Similar Trips</h3>
        {similarTrips.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No similar trips found.</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {similarTrips.map((t) => (
              <div key={t.id} className="glass premium-shadow bg-blue-50/60 dark:bg-blue-900/40 rounded-xl p-5 flex flex-col gap-2 justify-between">
                <div>
                  <div className="font-bold text-blue-800 dark:text-blue-200 text-lg mb-1">{t.destination}</div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm mb-1">By User {t.userId.slice(-5)}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{t.startDate} - {t.endDate}</div>
                  <div className="text-gray-700 dark:text-gray-200 text-xs">Interests: {t.interests?.join(", ")}</div>
                  {t.persona && (
                    <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">Persona: {t.persona}</div>
                  )}
                </div>
                <button onClick={() => navigate(`/trip/${t.id}`)} className="mt-2 bg-gradient-to-r from-blue-600 to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:scale-105 hover:shadow-lg transition-all">View Trip</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TripDetails;
