import { useState, useRef, useEffect } from "react";
import { VolumeOffIcon, Volume2Icon, MoreVertical, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useNotificationStore } from "../store/useNotificationStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const { unreadCount, fetchUnreadCount } = useNotificationStore();
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

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <div className="p-4 md:p-6 border-b border-white/10 chat-gradient-header chat-glass-strong">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-10 md:size-14 rounded-full overflow-hidden relative group cursor-pointer ring-2 ring-white/10 hover:ring-[#00c6ff]/60 transition-all duration-300"
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

            <p className="text-xs flex items-center gap-1.5 chat-text-muted">
              <span className="chat-dot-online" />
              Online
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 md:gap-4 items-center">
          <button
            onClick={onToggleTheme}
            className="ripple-btn chat-btn text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* THREE DOTS MENU */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="ripple-btn chat-btn relative text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <MoreVertical className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 chat-glass-strong rounded-md p-2 shadow-lg z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-white/10 rounded transition-colors min-h-[44px]"
                >
                  Profile
                </button>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/chatkey");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-white/10 rounded transition-colors min-h-[44px]"
                >
                  ChatKey
                </button>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/restore-chat");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-white/10 rounded transition-colors min-h-[44px]"
                >
                  Restore Chat
                </button>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/requests");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-white/10 rounded transition-colors min-h-[44px]"
                >
                  Requests
                </button>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={() => {
                    navigate("/notifications");
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-white/10 rounded transition-colors min-h-[44px] flex items-center justify-between"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-slate-200 hover:bg-white/10 rounded transition-colors min-h-[44px]"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* SOUND TOGGLE BTN */}
          <button
            className="ripple-btn chat-btn text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
