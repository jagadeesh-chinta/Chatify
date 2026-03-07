import { XIcon, Heart, MoreVertical, UserMinus, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader({ onViewProfile, onRemoveFriend }) {
  const { selectedUser, setSelectedUser, friendStatus, toggleFavourite, isFavourite } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const isOnline = onlineUsers.includes(selectedUser._id);

  // Check if user is favourite when selected user changes
  useEffect(() => {
    const checkFavourite = async () => {
      const result = await isFavourite(selectedUser._id);
      setIsFav(result);
    };
    checkFavourite();
  }, [selectedUser._id, isFavourite]);

  // Reset isFav when friend status changes to not_friends
  useEffect(() => {
    if (friendStatus?.status === "not_friends") {
      setIsFav(false);
    }
  }, [friendStatus]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleToggleFavourite = async () => {
    setIsLoading(true);
    const result = await toggleFavourite(selectedUser._id);
    if (result !== null) {
      setIsFav(result);
    }
    setIsLoading(false);
  };

  const handleRemoveFriend = () => {
    setShowMenu(false);
    onRemoveFriend && onRemoveFriend();
  };

  const handleProfileClick = () => {
    onViewProfile && onViewProfile();
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  // Only show heart icon if users are friends
  const areFriends = friendStatus?.status === "friends";

  return (
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-3 md:px-6 flex-1"
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Back button - visible on mobile only */}
        <button 
          onClick={handleBack}
          className="md:hidden p-2 -ml-1 rounded-full hover:bg-slate-700/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>

        <button 
          onClick={handleProfileClick}
          className={`avatar ${isOnline ? "online" : "offline"} cursor-pointer hover:ring-2 hover:ring-cyan-500 rounded-full transition-all`}
        >
          <div className="w-10 md:w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </button>

        <div>
          <h3 className="text-slate-200 font-medium text-sm md:text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{selectedUser.fullName}</h3>
          <p className="text-slate-400 text-xs md:text-sm">{isOnline ? "Online" : "Offline"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {areFriends && (
          <>
            <button
              onClick={handleToggleFavourite}
              disabled={isLoading}
              className="transition-colors cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {isFav ? (
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500 hover:fill-pink-600 hover:text-pink-600" />
              ) : (
                <Heart className="w-5 h-5 text-pink-400 border-pink-400 hover:text-pink-500 hover:border-pink-500 transition-colors" />
              )}
            </button>

            {/* Three dots menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-full hover:bg-slate-700/50 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <MoreVertical className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={handleRemoveFriend}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700/50 transition-colors text-sm min-h-[44px]"
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Friend
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Close button - hidden on mobile (use back button instead) */}
        <button onClick={handleBack} className="hidden md:block p-2">
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
