import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";


export default function Home() {
  // Testimonial carousel (simple state)
  const testimonials = [
    {
      quote: "The AI itinerary saved me hours of planning!",
      name: "Priya, India",
      avatar: "🇮🇳"
    },
    {
      quote: "Loved discovering trips from other solo travelers!",
      name: "Alex, UK",
      avatar: "🇬🇧"
    },
    {
      quote: "The dashboard insights are so motivating.",
      name: "Sam, USA",
      avatar: "🇺🇸"
    },
    {
      quote: "Exporting trips to PDF is a game changer!",
      name: "Marta, Spain",
      avatar: "🇪🇸"
    },
  ];
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  return (
    <section className="relative overflow-x-clip min-h-[100vh] flex flex-col gap-0 items-center bg-gradient-to-b from-white/60 via-blue-50 to-white dark:from-[#181e2a]/80 dark:via-[#232946]/80 dark:to-[#181e2a] premium-bg">
      {/* Animated blobs */}
      <div className="floating-blob floating-blob-1" />
      <div className="floating-blob floating-blob-2" />
      <div className="floating-blob floating-blob-3" />
      
      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center pt-20 pb-16 md:pb-32 z-10 relative">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-400 to-purple-500 drop-shadow-lg dark:from-blue-300 dark:via-purple-400 dark:to-yellow-300"
        >
          Your Ultimate Solo Travel AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-2xl md:text-3xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-10 font-medium"
        >
          Plan, explore, and analyze your solo journeys with next-gen AI, beautiful dashboards, and a global community.
        </motion.p>
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <motion.div whileHover={{ scale: 1.08 }}>
            <Link to="/plan">
              <button className="gradient-hero text-white px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-400">
                ✈️ Plan a Trip
              </button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08 }}>
            <Link to="/explore">
              <button className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all border-2 border-transparent hover:border-green-400">
                🌍 Explore Trips
              </button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08 }}>
            <Link to="/dashboard">
              <button className="bg-gradient-to-r from-purple-500 to-blue-400 text-white px-10 py-4 rounded-2xl text-2xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all border-2 border-transparent hover:border-purple-400">
                📊 Dashboard
              </button>
            </Link>
          </motion.div>
        </div>
        {/* App Preview Glass Card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="glass premium-shadow max-w-3xl w-full mx-auto mt-8 mb-0 py-8 px-6 flex flex-col items-center relative z-10">
          <div className="w-full flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className="flex-1 flex flex-col items-center">
              <img src="/app-preview.png" alt="App Preview" className="rounded-2xl shadow-2xl border-4 border-blue-100 dark:border-blue-900 w-full max-w-xs bg-white/50 dark:bg-[#232946]/50" />
            </div>
            <div className="flex-1 flex flex-col gap-4 items-start">
              <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-200 mb-2">Why Solo Travel Planner?</h3>
              <ul className="text-lg text-gray-700 dark:text-gray-200 space-y-2">
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-500 dark:text-blue-300">bolt</span> Instant AI Itineraries</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500 dark:text-green-300">groups</span> Community Trip Feed</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-500 dark:text-purple-300">insights</span> ML-powered Dashboard</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-yellow-500 dark:text-yellow-300">cloud_download</span> Export to PDF & Calendar</li>
                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-pink-500 dark:text-pink-300">person</span> Personalized Travel Persona</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      {/* Feature Grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mt-24 mb-16 px-4">
        <motion.div whileHover={{ y: -8, scale: 1.04 }} className="glass premium-shadow p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 bg-white/80 dark:bg-[#232946]/80">
          <span className="material-symbols-outlined text-4xl text-blue-500 dark:text-blue-300">bolt</span>
          <h3 className="font-extrabold text-xl text-blue-700 dark:text-blue-200">AI Itinerary Generator</h3>
          <p className="text-gray-700 dark:text-gray-200">Get a personalized, day-wise travel plan instantly, tailored to your interests and budget.</p>
        </motion.div>
        <motion.div whileHover={{ y: -8, scale: 1.04 }} className="glass premium-shadow p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 bg-white/80 dark:bg-[#232946]/80">
          <span className="material-symbols-outlined text-4xl text-green-500 dark:text-green-300">groups</span>
          <h3 className="font-extrabold text-xl text-green-700 dark:text-green-200">Community Explore Feed</h3>
          <p className="text-gray-700 dark:text-gray-200">Browse and interact with public trips from solo travelers worldwide. Like, comment, and clone trips.</p>
        </motion.div>
        <motion.div whileHover={{ y: -8, scale: 1.04 }} className="glass premium-shadow p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 bg-white/80 dark:bg-[#232946]/80">
          <span className="material-symbols-outlined text-4xl text-purple-500 dark:text-purple-300">insights</span>
          <h3 className="font-extrabold text-xl text-purple-700 dark:text-purple-200">ML-powered Dashboard</h3>
          <p className="text-gray-700 dark:text-gray-200">See your travel persona, analytics, and get city recommendations based on your style.</p>
        </motion.div>
      </div>
      {/* Testimonial Carousel */}
      <div className="relative z-10 w-full flex flex-col items-center mt-8 mb-20">
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-8">What Solo Travelers Say</h2>
        <div className="max-w-xl w-full mx-auto">
          <motion.div
            key={testimonialIdx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass p-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 text-lg md:text-xl"
          >
            <span className="text-4xl mb-2">{testimonials[testimonialIdx].avatar}</span>
            <div className="mb-2 font-semibold">“{testimonials[testimonialIdx].quote}”</div>
            <div className="text-base text-gray-600 dark:text-gray-300">— {testimonials[testimonialIdx].name}</div>
          </motion.div>
          <div className="flex justify-center gap-3 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIdx(idx)}
                className={`w-3 h-3 rounded-full ${testimonialIdx === idx ? "bg-blue-500 dark:bg-blue-300" : "bg-gray-300 dark:bg-gray-600"} transition`}
                aria-label={`Show testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Screenshots Section */}
      <div className="relative z-10 max-w-6xl mx-auto mb-24 px-4">
        <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-200 mb-10 text-center">App Screenshots</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="glass premium-shadow w-72 h-44 rounded-2xl shadow-2xl flex items-center justify-center text-2xl text-gray-400 dark:text-gray-600 bg-white/80 dark:bg-[#232946]/80">Screenshot 1</div>
          <div className="glass premium-shadow w-72 h-44 rounded-2xl shadow-2xl flex items-center justify-center text-2xl text-gray-400 dark:text-gray-600 bg-white/80 dark:bg-[#232946]/80">Screenshot 2</div>
          <div className="glass premium-shadow w-72 h-44 rounded-2xl shadow-2xl flex items-center justify-center text-2xl text-gray-400 dark:text-gray-600 bg-white/80 dark:bg-[#232946]/80">Screenshot 3</div>
        </div>
      </div>
    </section>
  );
}
