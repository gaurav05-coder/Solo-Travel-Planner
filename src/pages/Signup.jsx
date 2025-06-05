import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // adjust the path as needed
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Update displayName in Auth profile
      await user.updateProfile({ displayName });
      // Save user doc in Firestore
      await import("firebase/firestore").then(({ doc, setDoc, db }) => {
        setDoc(doc(db, "users", user.uid), {
          email,
          displayName,
          createdAt: new Date().toISOString(),
        });
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow p-8 mt-16">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={50}
            placeholder="Your Name"
          />
        </div>
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
          Create Account
        </button>
      </form>
      <div className="text-center text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </div>
    </div>
  );
}
