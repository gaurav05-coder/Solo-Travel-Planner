// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

import Home from "./pages/Home";
import LearnMore from "./pages/LearnMore";
import Explore from "./pages/Explore";

import Plan from "./pages/Plan";
import Itinerary from "./pages/Itinerary";
import SavedTrips from "./pages/SavedTrips";
import TripDetails from "./pages/TripDetails";
import TripPublic from "./pages/TripPublic";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";

import UserProfile from "./pages/UserProfile";
import ProfileEdit from "./pages/ProfileEdit";
import TravelPersona from "./pages/TravelPersona";
import NotFound from "./pages/NotFound";
import AIChatWidget from "./components/AIChatWidget";

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/explore" element={<Explore />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <PrivateRoute>
              <Plan />
            </PrivateRoute>
          }
        />
        <Route
          path="/itinerary/:tripId"
          element={
            <PrivateRoute>
              <Itinerary />
            </PrivateRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <PrivateRoute>
              <SavedTrips />
            </PrivateRoute>
          }
        />
        <Route path="/trip/:userId/:tripId" element={<TripPublic />} />

        <Route
          path="/user/:uid"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile-edit"
          element={
            <PrivateRoute>
              <ProfileEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/travel-persona"
          element={
            <PrivateRoute>
              <TravelPersona />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Chat Assistant */}
      <AIChatWidget />
    </Layout>
  );
}
