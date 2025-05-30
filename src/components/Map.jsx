// src/components/Map.jsx
import React from "react";

const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

export default function Map({ center, places }) {
  if (!center || !center.lat || !center.lng || !Array.isArray(places)) return null;

  // Generate markers
  const markers = places
    .map((place) => `${place.lat},${place.lng}`)
    .join("|");

  const mapUrl = `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_API_KEY}&center=${center.lat},${center.lng}&zoom=13&size=600x300&markers=${markers}`;

  return (
    <img
      src={mapUrl}
      alt="Map"
      className="w-full mt-4 rounded-lg border"
    />
  );
}
