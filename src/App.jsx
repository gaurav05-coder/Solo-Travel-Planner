import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Plan from "./pages/Plan";
import Itinerary from "./pages/Itinerary";
import SavedTrips from "./pages/SavedTrips";
import TripDetails from "./pages/TripDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plan" element={<Plan />} />
        <Route path="/itinerary" element={<Itinerary />} />
<Route path="/itinerary/:tripId" element={<Itinerary />} />
<Route path="/dashboard" element={<Dashboard />} />

        <Route path="/saved" element={<SavedTrips />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Layout>
  );
}
