import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, increment, collection, getDocs, addDoc, onSnapshot, query, where, collectionGroup } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";

export default function TripPublic() {
  const { userId, tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [similarTrips, setSimilarTrips] = useState([]);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    let unsubTrip = null;
    let unsubComments = null;

    async function fetchTrip() {
      setLoading(true);
      setError(null);
      setTrip(null);
      setComments([]);
      setSimilarTrips([]);
      try {
        const tripDocRef = doc(db, "users", userId, "trips", tripId);
        const tripSnap = await getDoc(tripDocRef);
        if (tripSnap.exists() && tripSnap.data().visibility === "public") {
          const foundTrip = { ...tripSnap.data(), id: tripId, userId };
          setTrip(foundTrip);
          // Fetch displayName for trip author
          getDoc(doc(db, "users", userId)).then((d) => {
            if (d.exists()) setUserNames(prev => ({ ...prev, [userId]: d.data().displayName || `User ${userId.slice(-5)}` }));
          });
          // Real-time updates for trip
          unsubTrip = onSnapshot(tripDocRef, (snap) => {
            if (snap.exists()) {
              setTrip({ ...snap.data(), id: tripId, userId });
            }
          });
          // Real-time updates for comments
          const commentsRef = collection(db, "users", userId, "trips", tripId, "comments");
          unsubComments = onSnapshot(commentsRef, (commentsSnap) => {
            setComments(commentsSnap.docs.map(doc => doc.data()));
            // Fetch displayNames for all comment authors
            const commentUserIds = Array.from(new Set(commentsSnap.docs.map(doc => doc.data().user)));
            const toFetch = commentUserIds.filter(uid => uid && !userNames[uid]);
            if (toFetch.length > 0) {
              Promise.all(toFetch.map(uid => getDoc(doc(db, "users", uid)))).then(docs => {
                const names = {};
                docs.forEach((d, i) => {
                  if (d.exists()) names[toFetch[i]] = d.data().displayName || `User ${toFetch[i].slice(-5)}`;
                });
                setUserNames(prev => ({ ...prev, ...names }));
              });
            }
          });
          fetchSimilarTrips(foundTrip);
        } else {
          setError("Trip not found or not public.");
        }
      } catch (err) {
        setError("Failed to load trip. " + (err.message || err.code || err));
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();

    return () => {
      if (unsubTrip) unsubTrip();
      if (unsubComments) unsubComments();
    };
  }, [tripId, userId]);

  // Fetch and compute similar trips
  async function fetchSimilarTrips(currentTrip) {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      let allTrips = [];
      for (const userDoc of usersSnap.docs) {
        const tripsSnap = await getDocs(collection(db, "users", userDoc.id, "trips"));
        tripsSnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.visibility === "public" && doc.id !== currentTrip.id) {
            allTrips.push({ ...data, id: doc.id, userId: userDoc.id });
          }
        });
      }
      // Compute similarity
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
    } catch (e) {
      setSimilarTrips([]);
    }
  }

  // Fetch comments for the trip
  async function fetchComments(tripObj) {
    setCommentLoading(true);
    try {
      const commentsSnap = await getDocs(collection(db, "users", tripObj.userId, "trips", tripObj.id, "comments"));
      setComments(commentsSnap.docs.map(doc => doc.data()));
    } catch {
      setComments([]);
    }
    setCommentLoading(false);
  }

  // Add comment
  async function submitComment() {
    if (!commentText.trim() || !trip) return;
    setCommentSubmitting(true);
    try {
      await addDoc(collection(db, "users", trip.userId, "trips", trip.id, "comments"), {
        text: commentText,
        createdAt: new Date().toISOString(),
        user: user ? user.uid : "anon"
      });
      setCommentText(""); // Real-time updates will update UI
    } catch {}
    setCommentSubmitting(false);
  }

  // Like handler
  async function handleLike() {
    if (!trip || likeLoading) return;
    setLikeLoading(true);
    try {
      const tripRef = doc(db, "users", trip.userId, "trips", trip.id);
      await updateDoc(tripRef, { likes: increment(1) });
      // Real-time updates will update UI
    } catch (err) {
      console.error("Failed to like trip:", err);
      alert("Failed to like trip. " + (err.message || err.code || err));
    }
    setLikeLoading(false);
  }

  // Clone trip
  async function handleClone() {
    if (!user) {
      alert("You must be logged in to clone trips.");
      return;
    }
    setCloneLoading(true);
    setCloneSuccess("");
    try {
      const userTripsRef = collection(db, "users", user.uid, "trips");
      const { id, userId, likes, ...rest } = trip;
      await addDoc(userTripsRef, { ...rest, clonedFrom: { userId: trip.userId, tripId: trip.id }, createdAt: new Date().toISOString(), visibility: "private" });
      setCloneSuccess("Trip cloned to your account!");
      setTimeout(() => setCloneSuccess(""), 2000);
    } catch {
      setCloneSuccess("Failed to clone trip.");
    }
    setCloneLoading(false);
  }

  // Export to PDF
  function exportPDF() {
    if (!trip) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(trip.destination, 10, 15);
    doc.setFontSize(12);
    doc.text(`By User ${trip.userId.slice(-5)}`, 10, 25);
    doc.text(`Dates: ${trip.startDate} - ${trip.endDate}`, 10, 32);
    doc.text(`Interests: ${(trip.interests || []).join(", ")}`, 10, 39);
    doc.text(`Itinerary:`, 10, 48);
    let y = 55;
    if (Array.isArray(trip.itinerary)) {
      trip.itinerary.forEach((day, idx) => {
        doc.text(`${day.day}:`, 12, y);
        y += 6;
        day.activities.forEach((act, i) => {
          doc.text(`- ${act}`, 16, y);
          y += 6;
        });
        y += 2;
        if (y > 270) {
          doc.addPage();
          y = 15;
        }
      });
    }
    doc.save(`${trip.destination}-trip.pdf`);
  }

  // Export to ICS (calendar)
  function exportICS() {
    if (!trip || !Array.isArray(trip.itinerary)) return;
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID=-//SoloTravelPlanner//EN\n";
    // Parse start date
    const start = new Date(trip.startDate);
    trip.itinerary.forEach((day, idx) => {
      let eventDate = new Date(start);
      eventDate.setDate(start.getDate() + idx);
      const dt = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      ics += `BEGIN:VEVENT\nSUMMARY:${trip.destination} - ${day.day}\nDESCRIPTION:${day.activities.join(', ')}\nDTSTART:${dt}\nDTEND:${dt}\nEND:VEVENT\n`;
    });
    ics += "END:VCALENDAR";
    const blob = new Blob([ics], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${trip.destination}-trip.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) return <div className="text-center py-8">Loading trip...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!trip) return <div className="text-gray-500 text-center py-8">Trip not found or not public.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">{trip.destination}</h1>
      <div className="mb-2 text-gray-600">By <Link to={`/user/${trip.userId}`} className="text-blue-600 hover:underline">User {trip.userId.slice(-5)}</Link></div>
      <div className="mb-2 text-gray-500">{trip.startDate} - {trip.endDate}</div>
      <div className="mb-4 text-gray-700">Interests: {trip.interests?.join(", ")}</div>
      {/* Export Buttons */}
      <div className="flex gap-3 mb-4">
        <button onClick={exportPDF} className="bg-indigo-600 text-white px-3 py-2 rounded text-sm hover:bg-indigo-700 transition" aria-label="Export trip as PDF">Export to PDF</button>
        <button onClick={exportICS} className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition" aria-label="Export trip as Calendar">Export to Calendar</button>
      </div>
      <div className="flex gap-4 mb-6">
        <button onClick={handleLike} disabled={likeLoading} className="text-pink-600 text-lg flex items-center gap-1" aria-label="Like this trip">
          ❤️ {trip.likes || 0} {likeLoading && <span className="ml-1 animate-spin">⏳</span>}
        </button>
        <button onClick={handleClone} disabled={cloneLoading} className="text-green-700 underline hover:no-underline" aria-label="Clone trip to your account">
          {cloneLoading ? "Cloning..." : "Clone Trip"}
        </button>
        <button onClick={() => fetchComments(trip)} className="text-blue-600 underline hover:no-underline" aria-label="Show comments">💬 Comments</button>
      </div>
      {cloneSuccess && <div className="mb-3 text-green-600 font-medium">{cloneSuccess}</div>}
      <h2 className="text-xl font-semibold text-blue-700 mt-6 mb-3">Itinerary</h2>
      {trip.itinerary ? (
        <ul className="space-y-3">
          {trip.itinerary.map((day, idx) => (
            <li key={idx} className="glass premium-shadow rounded-lg p-3 bg-white/80 dark:bg-[#232946]/80">
              <div className="font-medium text-blue-800 dark:text-blue-100">{day.day}</div>
              <ul className="list-disc ml-6 text-gray-700 dark:text-gray-200">
                {day.activities.map((activity, i) => (
                  <li key={i}>{activity}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 dark:text-gray-300">No itinerary available.</div>
      )}
      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="font-bold text-blue-700 mb-2">Comments</h3>
        {commentLoading ? (
          <div>Loading comments...</div>
        ) : (
          <div className="space-y-2 mb-3">
            {comments.length === 0 && <div className="text-gray-500 dark:text-gray-300">No comments yet.</div>}
            {comments.map((c, i) => (
              <div key={i} className="glass premium-shadow rounded px-3 py-2 text-gray-700 dark:text-gray-100 bg-white/90 dark:bg-[#232946]/70 text-sm">
                <span className="font-medium text-blue-800 dark:text-blue-100">{userNames[c.user] || (c.user ? `User ${c.user.slice(-5)}` : "Anon")}:</span> {c.text}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled={commentSubmitting}
            maxLength={200}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            onClick={submitComment}
            disabled={commentSubmitting || !commentText.trim()}
          >
            {commentSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    {/* Similar Trips Section */}
    <div className="mt-10">
      <h3 className="font-bold text-blue-700 mb-2 text-lg">Similar Trips</h3>
      {similarTrips.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-300">No similar trips found.</div>
      ) : (
        <div className="grid gap-4">
          {similarTrips.map((t) => (
            <div key={t.id} className="glass premium-shadow rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between transition-all hover:scale-[1.01] hover:shadow-2xl bg-white/80 dark:bg-[#232946]/80">
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-100 text-lg">{t.destination}</div>
                <div className="text-gray-600 dark:text-gray-200 text-sm mb-1">By <Link to={`/user/${t.userId}`} className="text-blue-600 hover:underline">{userNames[t.userId] || `User ${t.userId.slice(-5)}`}</Link></div>
                <div className="text-gray-500 dark:text-gray-300 text-xs">{t.startDate} - {t.endDate}</div>
                <div className="text-gray-700 dark:text-gray-100 text-xs">Interests: {t.interests?.join(", ")}</div>
                {t.persona && <div className="text-xs text-purple-500 dark:text-purple-200 mt-1">Persona: {t.persona}</div>}
              </div>
              <Link to={`/trip/${t.userId}/${t.id}`} className="mt-2 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition">View Trip</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}
