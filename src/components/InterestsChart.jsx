import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6366F1", "#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA", "#F472B6", "#10B981"];

export default function InterestsChart({ trips }) {
  // Count frequency of each interest
  const interestCounts = {};
  trips.forEach((trip) => {
    trip.interests.forEach((interest) => {
      interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    });
  });

  const chartData = Object.entries(interestCounts).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) return <p className="text-gray-500">No interests to show yet.</p>;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
