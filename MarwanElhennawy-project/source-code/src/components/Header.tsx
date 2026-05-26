import { useNavigate } from "react-router-dom";
import { Search, LogOut } from "lucide-react";
import { logout } from "../services/auth";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-[#ffcc00] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* LEFT SIDE - LOGO */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="bg-[#d40511] px-4 py-2 rounded">
                <span className="text-white font-bold">DHL</span>
              </div>

              <h1 className="text-[#d40511] font-semibold">
                Knowledge Base Dashboard
              </h1>
            </button>
          </div>

          {/* RIGHT SIDE - ACTIONS */}
          <div className="flex items-center gap-4">

            {/* SEARCH BUTTON */}
            <button
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Search className="w-5 h-5 text-[#d40511]" />
              <span className="text-gray-700">Search</span>
            </button>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#d40511] text-white rounded-lg hover:bg-[#b00410] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}