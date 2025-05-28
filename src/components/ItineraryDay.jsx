export default function ItineraryDay({ day, onAdd, onEdit, onDelete }) {
  return (
    <div className="mb-8 border-b pb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg text-blue-600">{day.date}</h3>
        <button
          className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
          onClick={onAdd}
        >
          + Add Activity
        </button>
      </div>
      <ul className="space-y-2">
        {day.activities.map((activity, idx) => (
          <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
            <span>{activity}</span>
            <div className="flex gap-2">
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() => onEdit(idx)}
              >Edit</button>
              <button
                className="text-xs text-red-500 hover:underline"
                onClick={() => onDelete(idx)}
              >Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
