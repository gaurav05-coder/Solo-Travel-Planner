import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Dashboard components
import DashboardCard from "../components/DashboardCard";
import PersonaCard from "../components/PersonaCard";
import RecommendedDestinations from "../components/RecommendedDestinations";
import TripStats from "../components/TripStats";
import InterestsChart from "../components/InterestsChart";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchTrips = async () => {
      try {
        const tripRef = collection(db, "users", user.uid, "trips");
        const tripSnap = await getDocs(tripRef);
        const data = tripSnap.docs.map((doc) => doc.data());
        setTrips(data);
      } catch (error) {
        console.error("Error fetching trips for dashboard:", error);
      }
    };

    fetchTrips();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-6 px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-800 dark:text-blue-200">
        🧭 Your Travel Dashboard
      </h1>

      {/* Travel Persona */}
      <DashboardCard title="🎒 Your Travel Persona">
        <PersonaCard trips={trips} />
      </DashboardCard>

      {/* Recommended Destinations */}
      <DashboardCard title="📍 Recommended Destinations">
        <RecommendedDestinations trips={trips} />
      </DashboardCard>

      {/* Trip Stats */}
      <DashboardCard title="📅 Your Trip Summary">
        <TripStats trips={trips} />
      </DashboardCard>

      {/* Interests Breakdown Chart */}
      <DashboardCard title="📊 Your Top Interests">
        <InterestsChart trips={trips} />
      </DashboardCard>

      {/* Travel Tip of the Week */}
      <DashboardCard title="💡 Travel Tip of the Week">
        <p className="text-gray-700 dark:text-gray-300">
          “Explore major attractions early in the morning or just before closing — fewer crowds and better photos!”
        </p>
      </DashboardCard>
    </div>
  );
}
