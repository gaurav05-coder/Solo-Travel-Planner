import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function TripDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      if (!user) return;

      setLoading(true);
      try {
        const docRef = doc(db, "users", user.uid, "trips", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTrip(docSnap.data());
        } else {
          setTrip(null);
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        setTrip(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchTrip();
  }, [id, user]);

  if (!user) return <p className="text-center mt-8 text-red-600">Please log in.</p>;
  if (loading) return <p className="text-center mt-8 text-gray-600">Loading trip details...</p>;
  if (!trip) return <p className="text-center mt-8 text-red-500">Trip not found.</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Trip to {trip.destination}</h2>
      <p className="mb-2"><strong>Dates:</strong> {trip.startDate} - {trip.endDate}</p>
      <p className="mb-2"><strong>Budget:</strong> ${trip.budget}</p>
      <p className="mb-4"><strong>Interests:</strong> {trip.interests?.join(", ")}</p>
      {trip.budget && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Smart Budget Breakdown</h3>
          <ul className="space-y-1 text-sm">
            {[
              { label: "Accommodation", percent: 0.4 },
              { label: "Food", percent: 0.25 },
              { label: "Transport", percent: 0.15 },
              { label: "Activities", percent: 0.15 },
              { label: "Miscellaneous", percent: 0.05 },
            ].map((item) => (
              <li key={item.label} className="flex justify-between border-b py-1">
                <span>{item.label}</span>
                <span>${(trip.budget * item.percent).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
