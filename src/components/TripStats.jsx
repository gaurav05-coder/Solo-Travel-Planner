export default function TripStats({ trips }) {
    const count = trips.length;
    const totalDays = trips.reduce((sum, t) => {
      const d = (new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24);
      return sum + d;
    }, 0);
    const avgDays = count > 0 ? (totalDays / count).toFixed(1) : 0;
  
    return (
      <div className="text-gray-700 dark:text-gray-300">
        <p>📌 Trips planned: <strong>{count}</strong></p>
        <p>⏱️ Avg. Trip Duration: <strong>{avgDays} days</strong></p>
        <p>🧭 Total Days Traveled: <strong>{totalDays}</strong></p>
      </div>
    );
  }
  