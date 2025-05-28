import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function SavedTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      if (!user) return;

      try {
        const q = query(collection(db, "trips"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center mt-12 text-lg text-red-600">
        Please <Link to="/login" className="underline text-blue-600">log in</Link> to view your saved trips.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-12 text-gray-600">Loading trips...</div>;
  }

  if (trips.length === 0) {
    return <div className="text-center mt-12 text-gray-600">You have no saved trips yet.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Saved Trips</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {trips.map(trip => (
          <div key={trip.id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Trip to {trip.destination}</h3>
              <p className="text-gray-600 mb-2">{trip.startDate} - {trip.endDate}</p>
            </div>
            <Link
              to={`/trip/${trip.id}`}
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
