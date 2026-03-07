import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

function GlobalMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <>
      <div className="absolute top-4 right-4 z-40">
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2"
          >
            <MoreVertical className="w-6 h-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md p-2 shadow-lg">
              <button
                onClick={() => {
                  navigate("/requests");
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 rounded transition-colors"
              >
                Requests
              </button>
              <div className="border-t border-slate-600 my-1"></div>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default GlobalMenu;
