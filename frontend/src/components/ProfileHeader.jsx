import { useState, useRef, useEffect } from "react";
import { VolumeOffIcon, Volume2Icon, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="p-4 md:p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-10 md:size-14 rounded-full overflow-hidden relative group cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <img
                src={authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
            </button>
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-200 font-medium text-sm md:text-base max-w-[120px] sm:max-w-[150px] md:max-w-[180px] truncate">
              {authUser.fullName}
            </h3>

            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 md:gap-4 items-center">
          {/* THREE DOTS MENU */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md p-2 shadow-lg z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-slate-700 rounded transition-colors min-h-[44px]"
                >
                  Profile
                </button>
                <div className="border-t border-slate-600 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/chatkey");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-slate-700 rounded transition-colors min-h-[44px]"
                >
                  ChatKey
                </button>
                <div className="border-t border-slate-600 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/restore-chat");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-slate-700 rounded transition-colors min-h-[44px]"
                >
                  Restore Chat
                </button>
                <div className="border-t border-slate-600 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/requests");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-slate-700 rounded transition-colors min-h-[44px]"
                >
                  Requests
                </button>
                <div className="border-t border-slate-600 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-slate-700 rounded transition-colors min-h-[44px]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;
