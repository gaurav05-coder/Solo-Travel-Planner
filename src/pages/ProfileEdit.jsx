import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfileEdit() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(user?.photoURL || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch displayName from Firestore on mount
  import("firebase/firestore").then(({ doc, getDoc, db }) => {
    getDoc(doc(db, "users", user.uid)).then((d) => {
      if (d.exists()) setDisplayName(d.data().displayName || "");
    });
  });

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let photoURL = avatar;
      if (file) {
        const fileRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(fileRef, file);
        photoURL = await getDownloadURL(fileRef);
      }
      await updateProfile(user, { displayName, photoURL });
      await updateDoc(doc(db, "users", user.uid), { displayName, photoURL });
      setSuccess("Profile updated!");
      // Optionally, force reload of user context
      window.location.reload();
    } catch {
      setError("Failed to update profile.");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Edit Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Display Name</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={50}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Avatar</label>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
          {avatar && <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full mt-2" />}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded font-semibold" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
