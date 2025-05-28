import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    async function fetchTrip() {
      const docRef = doc(db, "trips", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTrip(docSnap.data());
      } else {
        setTrip(null);
      }
    }

    fetchTrip();
  }, [id]);

  if (!trip) {
    return <p className="text-center mt-8 text-red-500">Trip not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Trip to {trip.destination}</h2>
      <p className="mb-2"><strong>Dates:</strong> {trip.startDate} - {trip.endDate}</p>
      <p className="mb-2"><strong>Budget:</strong> ${trip.budget}</p>
      <p><strong>Interests:</strong> {trip.interests?.join(", ")}</p>
    </div>
  );
}
