import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // adjust path if needed
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect to home or dashboard
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow p-8 mt-16">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Sign In</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Password</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition mb-4"
        >
          Login
        </button>
      </form>
      <div className="text-center text-gray-600">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
      </div>
    </div>
  );
}
