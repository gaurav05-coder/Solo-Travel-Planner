import { useState, useEffect } from "react";


export default function RecommendedDestinations({ trips }) {
    // For now use static persona → cities map, or match by interests
    const personaMap = {
      "Culture Explorer": ["Kyoto", "Rome", "Varanasi"],
      "Nature Nomad": ["Uttarakhand", "Banff", "Bali"],
      "Foodie Drifter": ["Bangkok", "Istanbul", "Mexico City"],
      "City Hopper": ["New York", "Berlin", "Singapore"],
    };
  
    const [persona, setPersona] = useState(null);
  
    useEffect(() => {
      // Call the same logic as PersonaCard (optional optimization: lift persona to parent state)
      // For now, fake one
      setPersona("Culture Explorer");
    }, []);
  
    if (!persona) return <p className="text-gray-500">Loading suggestions...</p>;
  
    return (
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-blue-800">
        {personaMap[persona]?.map(city => (
          <li key={city} className="bg-blue-50 dark:bg-gray-800 p-3 rounded-lg shadow text-center">{city}</li>
        ))}
      </ul>
    );
  }
  