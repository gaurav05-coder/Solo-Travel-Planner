export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-500 text-center py-4 mt-8">
      <div className="container mx-auto">
        <span>&copy; {new Date().getFullYear()} Solo Travel Planner. All rights reserved.</span>
      </div>
    </footer>
  );
}
