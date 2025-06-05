import { useEffect, useState } from "react";

export default function PersonaCard({ persona }) {


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
