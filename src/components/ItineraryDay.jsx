export default function ItineraryDay({ day, onAdd, onEdit, onDelete }) {
  return (
    <div className="mb-8 border rounded-xl p-4 shadow bg-gray-50">
      {/* Day Heading */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-blue-700">{day.day}</h3>
        <button
          className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
          onClick={onAdd}
        >
          + Add Activity
        </button>
      </div>

      {/* Activity List */}
      <ul className="space-y-2">
        {day.activities.map((activity, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between bg-white px-3 py-2 rounded shadow"
          >
            <span>{activity}</span>
            <div className="flex gap-2">
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() => onEdit(idx)}
              >
                Edit
              </button>
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => onDelete(idx)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
