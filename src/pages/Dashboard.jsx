import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { getDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Dashboard components
import DashboardCard from "../components/DashboardCard";
import PersonaCard from "../components/PersonaCard";
import RecommendedDestinations from "../components/RecommendedDestinations";
import TripStats from "../components/TripStats";
import InterestsChart from "../components/InterestsChart";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();

  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState(null);
  const [persona, setPersona] = useState(null);
  const [personaLoading, setPersonaLoading] = useState(false);
  const [personaError, setPersonaError] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  // Fetch trips
  useEffect(() => {
    if (!user) return;
    setTripsLoading(true);
    setTripsError(null);
    const fetchTrips = async () => {
      try {
        const tripRef = collection(db, "users", user.uid, "trips");
        const tripSnap = await getDocs(tripRef);
        const data = tripSnap.docs.map((doc) => doc.data());
        setTrips(data);
        // Likes and comments analytics
        let likes = 0;
        let comments = 0;
        await Promise.all(tripSnap.docs.map(async (docSnap) => {
          const d = docSnap.data();
          likes += d.likes || 0;
          const commentsSnap = await getDocs(collection(db, "users", user.uid, "trips", docSnap.id, "comments"));
          comments += commentsSnap.docs.length;
        }));
        setLikesCount(likes);
        setCommentsCount(comments);
      } catch (error) {
        setTripsError("Failed to load your trips. Please try again later.");
        setTrips([]);
      } finally {
        setTripsLoading(false);
      }
    };
    fetchTrips();
  }, [user]);

  // Fetch persona after trips are loaded
  useEffect(() => {
    if (!user || trips.length === 0) return;
    setPersonaLoading(true);
    setPersonaError(null);
    const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
    const avgBudget = totalBudget / trips.length;
    const avgDuration = trips.reduce((sum, t) => {
      const d = (new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24);
      return sum + d;
    }, 0) / trips.length;
    const allInterests = trips.flatMap(t => t.interests || []);
    const uniqueInterests = [...new Set(allInterests)];
    const fetchPersona = async () => {
      try {
        const res = await fetch("http://localhost:5001/persona", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interests: uniqueInterests,
            budget: avgBudget,
            duration: avgDuration
          }),
        });
        const data = await res.json();
        if (data.persona) setPersona(data.persona);
        else throw new Error("No persona returned");
      } catch (error) {
        setPersonaError("Failed to analyze your persona. Try again later.");
        setPersona(null);
      } finally {
        setPersonaLoading(false);
      }
    };
    fetchPersona();
  }, [user, trips]);

  const Spinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-400 to-purple-500 dark:from-blue-200 dark:via-purple-400 dark:to-yellow-300 drop-shadow-lg text-center">
        🧭 Your Travel Dashboard
      </h1>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Travel Persona */}
        <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.6}} className="glass premium-shadow">
          <DashboardCard title={<span className="text-xl font-bold">🎒 Your Travel Persona</span>}>
            {personaLoading ? <Spinner /> : personaError ? <p className="text-red-500">{personaError}</p> : (
              <div className="flex flex-col md:flex-row items-center gap-3">
                <PersonaCard persona={persona} />
                {persona && <span className="ml-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-semibold shadow">{persona}</span>}
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2 rounded-xl mt-2 font-semibold hover:scale-105 hover:shadow-lg transition-all"
                  onClick={() => navigate("/travel-persona")}
                  aria-label="Retake Travel Persona"
                >
                  🔁 Retake Persona
                </button>
              </div>
            )}
          </DashboardCard>
        </motion.div>
        {/* Recommended Destinations */}
        <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.7}} className="glass premium-shadow">
          <DashboardCard title={<span className="text-xl font-bold">📍 Recommended Destinations</span>}>
            {personaLoading ? <Spinner /> : personaError ? <p className="text-red-500">{personaError}</p> : <RecommendedDestinations persona={persona} />}
          </DashboardCard>
        </motion.div>
        {/* Trip Stats */}
        <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.8}} className="glass premium-shadow">
          <DashboardCard title={<span className="text-xl font-bold">📅 Your Trip Summary</span>}>
            {tripsLoading ? <Spinner /> : tripsError ? <p className="text-red-500">{tripsError}</p> : <TripStats trips={trips} />}
          </DashboardCard>
        </motion.div>
        {/* Interests Breakdown Chart */}
        <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.9}} className="glass premium-shadow">
          <DashboardCard title={<span className="text-xl font-bold">📊 Your Top Interests</span>}>
            {tripsLoading ? <Spinner /> : tripsError ? <p className="text-red-500">{tripsError}</p> : <InterestsChart trips={trips} />}
          </DashboardCard>
        </motion.div>
      </div>
      {/* Travel Tip of the Week */}
      <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:1.0}} className="glass premium-shadow mt-8">
        <DashboardCard title={<span className="text-xl font-bold">💡 Travel Tip of the Week</span>}>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            “Explore major attractions early in the morning or just before closing — fewer crowds and better photos!”
          </p>
        </DashboardCard>
      </motion.div>
      {/* Likes, Comments, Public Profile */}
      <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:1.1}} className="glass premium-shadow mt-8">
        <DashboardCard title={<span className="text-xl font-bold">🔗 Community Stats & Profile</span>}>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="bg-pink-100 dark:bg-pink-900 rounded-xl px-4 py-2 text-pink-700 dark:text-pink-200 font-semibold shadow">❤️ Likes Received: {likesCount}</div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded-xl px-4 py-2 text-blue-700 dark:text-blue-200 font-semibold shadow">💬 Comments: {commentsCount}</div>
            <Link to={`/user/${user?.uid}`} className="bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-xl px-4 py-2 font-semibold shadow hover:scale-105 hover:shadow-lg transition-all underline hover:no-underline">View Public Profile</Link>
          </div>
        </DashboardCard>
      </motion.div>
    </div>
  );
}
