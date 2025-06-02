export default function DashboardCard({ title, children }) {
    return (
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md border border-blue-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">{title}</h2>
        {children}
      </div>
    );
  }
  