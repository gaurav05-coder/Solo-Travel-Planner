import { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  addDoc,
  onSnapshot,
  query,
  where,
  collectionGroup,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Explore() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentTrip, setCommentTrip] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [filterDestination, setFilterDestination] = useState("");
  const [filterInterests, setFilterInterests] = useState([]);
  const [filterPersona, setFilterPersona] = useState("");
  const [userNames, setUserNames] = useState({});

  const allInterests = [
    "Nature", "Museums", "Nightlife", "Food", "History",
    "Shopping", "Beaches", "Adventure",
  ];
  const allPersonas = [
    "Culture Explorer", "Nature Nomad", "Foodie Drifter",
    "Urban Adventurer", "Relaxed Wanderer",
  ];

  // 🔁 Real-time fetch of all public trips
  useEffect(() => {
    async function fetchTrips() {
      try {
        setLoading(true);
        setError(null);
        let allTrips = [];
        console.log("🚀 Fetching public trips using collectionGroup query...");

        const q = query(
          collectionGroup(db, "trips"),
          where("visibility", "==", "public")
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          // doc.ref.parent.parent.id gives the userId
          allTrips.push({ ...doc.data(), id: doc.id, userId: doc.ref.parent.parent.id });
        });

        console.log("🔥 Total public trips fetched:", allTrips.length);
        console.log("🧳 Trip data:", allTrips);
        setTrips(allTrips);
        // Fetch user names for all userIds in trips
        const uniqueUserIds = [...new Set(allTrips.map(t => t.userId))];
        const namesToFetch = uniqueUserIds.filter(uid => !userNames[uid]);
        if (namesToFetch.length > 0) {
          Promise.all(namesToFetch.map(uid => getDoc(doc(db, "users", uid)))).then(docs => {
            const names = {};
            docs.forEach((d, i) => {
              if (d.exists()) names[namesToFetch[i]] = d.data().displayName || `User ${namesToFetch[i].slice(-5)}`;
            });
            setUserNames(prev => ({ ...prev, ...names }));
          });
        }
        if (allTrips.length === 0) {
          console.warn("⚠️ No public trips found. Check Firestore data and security rules for the 'trips' collection group.");
        }
      } catch (err) {
        console.error("Error fetching public trips with collectionGroup:", err);
        setError("Failed to load public trips. " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTrips();
  }, []);
  
  

  // ❤️ Like a trip
  async function handleLike(trip) {
    try {
      const tripRef = doc(db, "users", trip.userId, "trips", trip.id);
      await updateDoc(tripRef, { likes: increment(1) });
    } catch (err) {
      console.error("Failed to like trip:", err);
      alert("Failed to like trip. " + (err.message || err.code || err));
    }
  }

  // 💬 Comment logic
  function openComments(trip) {
    setCommentTrip(trip);
    setCommentLoading(true);
    setComments([]);
  }

  const unsubCommentsRef = useRef(null);
  useEffect(() => {
    if (!commentTrip) return;

    const commentsRef = collection(
      db,
      "users",
      commentTrip.userId,
      "trips",
      commentTrip.id,
      "comments"
    );

    unsubCommentsRef.current = onSnapshot(
      commentsRef,
      (snap) => {
        setComments(snap.docs.map((doc) => doc.data()));
        setCommentLoading(false);
      },
      () => {
        setComments([]);
        setCommentLoading(false);
      }
    );

    return () => {
      if (unsubCommentsRef.current) unsubCommentsRef.current();
    };
  }, [commentTrip]);

  async function submitComment() {
    if (!commentText.trim() || !commentTrip) return;

    setCommentSubmitting(true);
    try {
      await addDoc(
        collection(
          db,
          "users",
          commentTrip.userId,
          "trips",
          commentTrip.id,
          "comments"
        ),
        {
          text: commentText,
          createdAt: new Date().toISOString(),
        }
      );
      setCommentText("");
    } catch {}
    setCommentSubmitting(false);
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-400 to-purple-500 dark:from-blue-200 dark:via-purple-400 dark:to-yellow-300 drop-shadow-lg text-center">
        🌍 Explore Public Trips
      </h1>

      {/* Filters */}
      <form className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 glass premium-shadow p-6">
        <div>
          <label className="block mb-1 font-semibold text-blue-700 dark:text-blue-300">Destination</label>
          <input
            className="border rounded-xl px-3 py-2 w-full bg-white/70 dark:bg-[#232946]/80 shadow focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Search destination..."
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-green-700 dark:text-green-300">Interests</label>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`px-3 py-1 rounded-full border font-medium shadow-sm transition-all ${
                  filterInterests.includes(interest)
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
                }`}
                onClick={() =>
                  setFilterInterests((prev) =>
                    prev.includes(interest)
                      ? prev.filter((i) => i !== interest)
                      : [...prev, interest]
                  )
                }
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-purple-700 dark:text-purple-300">Persona</label>
          <select
            className="border rounded-xl px-3 py-2 w-full bg-white/70 dark:bg-[#232946]/80 shadow focus:ring-2 focus:ring-purple-400 transition"
            value={filterPersona}
            onChange={(e) => setFilterPersona(e.target.value)}
          >
            <option value="">All</option>
            {allPersonas.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Trip Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full text-center py-16">
            <span className="inline-block w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            <div className="mt-4 text-blue-600 font-semibold">Loading trips...</div>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-16 text-red-500 font-semibold">{error}</div>
        ) : trips.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500 font-semibold">No public trips found.</div>
        ) : (
          trips
            .filter((trip) =>
              !filterDestination || trip.destination?.toLowerCase().includes(filterDestination.toLowerCase())
            )
            .filter(
              (trip) =>
                filterInterests.length === 0 ||
                (trip.interests &&
                  filterInterests.every((i) => trip.interests.includes(i)))
            )
            .filter((trip) => !filterPersona || (trip.persona && trip.persona === filterPersona))

            .map((trip) => (
              <div
                key={trip.id}
                className="glass premium-shadow rounded-2xl p-6 flex flex-col gap-2 transition-all hover:scale-[1.025] hover:shadow-2xl"
              >
                <div className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-1">{trip.destination}</div>
                <div className="text-gray-600 dark:text-gray-300">
                  By <span className="font-medium">{userNames[trip.userId] || `User ${trip.userId.slice(-5)}`}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {trip.startDate} - {trip.endDate}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Interests: {trip.interests?.join(", ")}
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleLike(trip)}
                    className="text-pink-600 dark:text-pink-300 hover:scale-110 transition"
                  >
                    ❤️ {trip.likes || 0}
                  </button>
                  <button
                    onClick={() => openComments(trip)}
                    className="text-blue-600 dark:text-blue-300 underline hover:no-underline transition"
                  >
                    💬 Comments
                  </button>
                  <a
  href={`/trip/${trip.userId}/${trip.id}`}
  className="text-blue-600 dark:text-blue-200 hover:underline transition"
>
  View Full Trip
</a>
                </div>
              </div>
            ))
        )}
      </div>

      {/* 💬 Comment Modal */}
      {commentTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="glass premium-shadow w-full max-w-md rounded-2xl shadow-2xl p-8 relative animate-fadeIn">
            <button
              className="absolute right-4 top-4 text-3xl text-gray-600 dark:text-gray-300 hover:text-red-500"
              onClick={() => setCommentTrip(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200">Comments</h2>
            {commentLoading ? (
              <div className="text-center py-6 text-blue-600 font-semibold">Loading comments...</div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto mb-3">
                {comments.length === 0 && <div className="text-gray-500">No comments yet.</div>}
                {comments.map((c, i) => (
                  <div key={i} className="bg-blue-50 dark:bg-blue-900 rounded px-3 py-2 text-gray-700 dark:text-gray-200 text-sm shadow">
                    {c.text}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <input
                className="flex-1 border rounded-xl px-3 py-2 bg-white/70 dark:bg-[#232946]/80 shadow"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={commentSubmitting}
                maxLength={200}
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-500 text-white px-5 py-2 rounded-xl font-semibold shadow hover:scale-105 transition-all disabled:opacity-60"
                onClick={submitComment}
                disabled={commentSubmitting || !commentText.trim()}
              >
                {commentSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
