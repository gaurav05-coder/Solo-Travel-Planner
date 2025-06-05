// src/pages/UserProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function UserProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [persona, setPersona] = useState(null);

  // 🛠️ Fix: missing state variables
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function fetchUserTrips() {
      setLoading(true);
      setError(null);
      try {
        const tripsSnap = await getDocs(collection(db, "users", uid, "trips"));
        const publicTrips = tripsSnap.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(t => t.visibility === "public");
        setTrips(publicTrips);
        if (publicTrips.length > 0) {
          setPersona(publicTrips[0].persona || null);
        }
      } catch (err) {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchUserTrips();
  }, [uid]);

  useEffect(() => {
    if (auth.currentUser && auth.currentUser.uid === uid) {
      setIsCurrentUser(true);
      setAvatar(auth.currentUser.photoURL);
      setDisplayName(auth.currentUser.displayName);
    }
  }, [uid]);

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      {loading && <div className="text-center py-8">Loading profile...</div>}
      {error && <div className="text-red-500 text-center py-8">{error}</div>}
      {!loading && !error && (
        <>
          <div className="mb-4 flex items-center gap-3">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-2xl font-bold text-blue-700">
                {uid.slice(-2)}
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="font-semibold text-lg">{displayName || `User ${uid.slice(-5)}`}</span>
              {persona && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {persona}
                </span>
              )}
            </div>
            {isCurrentUser && (
              <button
                onClick={() => navigate("/profile-edit")}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold mb-4 text-blue-700">Public Trips</h2>
          {trips.length === 0 ? (
            <div className="text-gray-500">No public trips yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl shadow p-5 flex flex-col gap-2"
                >
                  <div className="text-lg font-semibold text-blue-700">{trip.destination}</div>
                  <div className="text-sm text-gray-500">
                    {trip.startDate} - {trip.endDate}
                  </div>
                  <div className="text-sm text-gray-700">
                    Interests: {trip.interests?.join(", ")}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <a
                      href={`/trip/${trip.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Trip
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
