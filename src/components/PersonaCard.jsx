import { useEffect, useState } from "react";

export default function PersonaCard({ trips }) {
  const [persona, setPersona] = useState(null);

  useEffect(() => {
    if (trips.length === 0) return;

    const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0);
    const avgBudget = totalBudget / trips.length;

    const avgDuration = trips.reduce((sum, t) => {
      const d = (new Date(t.endDate) - new Date(t.startDate)) / (1000 * 60 * 60 * 24);
      return sum + d;
    }, 0) / trips.length;

    const allInterests = trips.flatMap(t => t.interests);
    const uniqueInterests = [...new Set(allInterests)];

    const analyzePersona = async () => {
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
      setPersona(data.persona);
    };

    analyzePersona();
  }, [trips]);

  return (
    <div>
      {persona ? (
        <div className="text-center text-xl font-bold text-blue-800 dark:text-blue-200">
          You are a <span className="underline">{persona}</span> 🧭
        </div>
      ) : (
        <p className="text-gray-500">Analyzing your travel history...</p>
      )}
    </div>
  );
}
