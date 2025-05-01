// src/components/Logout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { LogOut } from "lucide-react";

export default function Logout() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h1 className="mb-6 text-2xl font-bold text-red-600">Logout</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-400">Are you sure you want to log out?</p>
      
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex items-center justify-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <LogOut className="w-5 h-5 mr-2" />
        )}
        {loading ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}