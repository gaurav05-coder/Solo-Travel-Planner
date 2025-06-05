export default function LearnMore() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">About Solo Travel Planner</h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-6">
          <b>Solo Travel Planner</b> is your intelligent companion for planning, organizing, and maximizing your solo adventures. Enjoy AI-powered itinerary generation, a personal travel assistant chatbot, secure trip management, and a personalized dashboard—all designed for solo explorers.
        </p>
        <ul className="max-w-xl mx-auto text-left text-base md:text-lg text-gray-700 list-disc pl-6 space-y-2">
          <li>✨ <b>AI Itinerary:</b> Generate day-wise, interest-based plans for any destination.</li>
          <li>🤖 <b>Personal Chatbot:</b> Get travel tips, destination info, and instant help 24/7.</li>
          <li>🔒 <b>Secure & Private:</b> All your trips are stored securely and only visible to you.</li>
          <li>📊 <b>Personalized Dashboard:</b> See your travel persona, stats, and recommendations.</li>
          <li>💬 <b>Community (coming soon):</b> Share trips and connect with other solo travelers.</li>
        </ul>
      </div>
      <div className="mt-8">
        <a href="/plan" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow hover:bg-blue-700 transition">Start Planning Now</a>
      </div>
    </section>
  );
}
