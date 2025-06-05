import { useEffect, useState } from "react";
import { getPhoto, extractKeywords } from "../utils/getPhoto";

export default function ItineraryDay({ day, onAdd, onEdit, onDelete }) {
  const [photos, setPhotos] = useState({});

  useEffect(() => {
    async function fetchPhotos(itineraryActivities) {
      if (!Array.isArray(itineraryActivities)) return;

      const newPhotos = {};
      for (const activity of itineraryActivities) {
        const keywords = extractKeywords(activity);

        try {
          const photoUrl = await getPhoto(keywords);
          newPhotos[activity] = photoUrl;
        } catch (err) {

          newPhotos[activity] = null; // fallback image or null
        }
      }
      setPhotos(newPhotos);
    }

    fetchPhotos(day.activities);
  }, [day.activities]);

  return (
    <div className="mb-8 border rounded-3xl p-6 shadow bg-gray-50">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-2xl text-indigo-700">{day.day}</h3>
        <button
          className="text-sm bg-green-100 text-green-700 px-4 py-1 rounded-lg hover:bg-green-200 transition"
          onClick={onAdd}
        >
          + Add Activity
        </button>
      </div>

      {/* Activities List */}
      <ul className="space-y-5">
        {day.activities.map((activity, idx) => (
          <li
            key={idx}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white px-4 py-4 rounded-2xl shadow-md"
          >
            {/* Image */}
            {photos[activity] ? (
              <img
                src={photos[activity]}
                alt={`Photo of ${activity}`}
                className="w-full sm:w-40 h-32 object-cover rounded-xl shadow"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                alt={`No photo found for ${activity}`}
                className="w-full sm:w-40 h-32 object-cover rounded-xl shadow opacity-60"
              />
            )}

            {/* Activity Info */}
            <div className="flex-1 w-full">
              <div className="text-base font-medium text-gray-800 mb-2">
                {activity}
              </div>
              <div className="flex gap-4">
                <button
                  className="text-sm text-blue-500 hover:underline"
                  onClick={() => onEdit(idx)}
                >
                  Edit
                </button>
                <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={() => onDelete(idx)}
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
