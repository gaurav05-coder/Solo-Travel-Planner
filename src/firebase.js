import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // ✅ ADD THIS LINE
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3skFdXWSNfvk1hKYFknRvnGU6u4batTM",
  authDomain: "solo-travel-planner-e3620.firebaseapp.com",
  projectId: "solo-travel-planner-e3620",
  storageBucket: "solo-travel-planner-e3620.appspot.com", // ✅ FIXED typo: should be .app**spot**.com
  messagingSenderId: "227631490389",
  appId: "1:227631490389:web:8b83050eccb1a26e6dfbdc",
  measurementId: "G-3Z2H80DDXY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ ADD THIS LINE
