
export default function RecommendedDestinations({ persona }) {
    // For now use static persona → cities map, or match by interests
    const personaMap = {
      "Culture Explorer": ["Kyoto", "Rome", "Varanasi"],
      "Nature Nomad": ["Uttarakhand", "Banff", "Bali"],
      "Foodie Drifter": ["Bangkok", "Istanbul", "Mexico City"],
      "City Hopper": ["New York", "Berlin", "Singapore"],
    };
  
  if (!persona) return <p className="text-gray-500">Loading suggestions...</p>;

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-blue-800" aria-label="Recommended cities">
      {personaMap[persona]?.map(city => (
        <li key={city} className="bg-blue-50 dark:bg-gray-800 p-3 rounded-lg shadow text-center">{city}</li>
      ))}
    </ul>
  );
}