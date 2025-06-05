import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center mt-12">
        <span className="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
        <span className="text-gray-600">Checking authentication...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
