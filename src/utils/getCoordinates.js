const LOCATIONIQ_API_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

export default async function getCoordinates(placeName, city) {
  const query = `${placeName}, ${city}`;
  const url = `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data && data[0]) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Failed to get coordinates for:", placeName, err);
  }

  return null;
}
