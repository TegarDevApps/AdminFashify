import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react";
import profileImg from "@/assets/profile-image.jpg";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { auth } from "../routes/db/firebase";
import { useAuth } from "../routes/auth/auth-context";

export const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { adminData } = useAuth();
  const navigate = useNavigate();
  
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Mendapatkan inisial dari displayName
  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white  dark:bg-slate-900">
      <div className="font-bold text-xl dark:text-white">Admin Dashboard</div>
      
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle will be added here */}
        
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            3
          </span>
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={toggleDropdown}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white">
              {getInitials(adminData?.displayName)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium dark:text-white">{adminData?.displayName || "Admin"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{adminData?.role || "User"}</div>
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Profile
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Settings
              </a>
              <button 
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
