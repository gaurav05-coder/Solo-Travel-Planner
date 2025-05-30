// utils/getCoordinates.js
const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

export default async function getCoordinates(places) {
  const markers = [];

  for (const name of places) {
    try {
      const res = await fetch(
        `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          name
        )}&format=json`
      );
      const data = await res.json();
      if (data && data[0]) {
        markers.push({
          name,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      }
    } catch (e) {
      console.error(`Failed to get coordinates for ${name}`);
    }
  }

  return markers;
}
