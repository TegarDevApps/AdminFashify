// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./auth-context";

export const ProtectedRoute = () => {
  const { isAdmin, loading } = useAuth();
  
  // While auth state is being determined, show nothing or a loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user is not an admin, redirect to login
  if (!isAdmin) {
    return <Navigate to="/login" />;
  }
  
  // Otherwise, render child routes
  return <Outlet />;
};