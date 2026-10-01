import { XIcon, Heart, ArrowLeft, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import { useShallow } from "zustand/react/shallow";

function ChatHeader({ onViewProfile, onRemoveFriend }) {
  const { selectedUser, setSelectedUser, friendStatus, toggleFavourite, isFavourite, typingUsers, chatPreference } = useChatStore(useShallow(state => ({
    selectedUser: state.selectedUser,
    setSelectedUser: state.setSelectedUser,
    friendStatus: state.friendStatus,
    toggleFavourite: state.toggleFavourite,
    isFavourite: state.isFavourite,
    typingUsers: state.typingUsers,
    chatPreference: state.chatPreference,
  })));
  const { onlineUsers } = useAuthStore();
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = !!typingUsers[selectedUser._id];

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



  const handleToggleFavourite = async () => {
    setIsLoading(true);
    const result = await toggleFavourite(selectedUser._id);
    if (result !== null) {
      setIsFav(result);
    }
    setIsLoading(false);
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
      className="flex justify-between items-center chat-gradient-header chat-glass-strong border-b border-white/10 max-h-[84px] px-3 md:px-6 flex-1"
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Back button - visible on mobile only */}
        <button 
          onClick={handleBack}
          className="md:hidden ripple-btn chat-btn p-2 -ml-1 rounded-full hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>

        <button 
          onClick={handleProfileClick}
          className={`avatar ${isOnline ? "online" : "offline"} cursor-pointer hover:ring-2 hover:ring-[#00c6ff] rounded-full transition-all`}
        >
          <div className="w-10 md:w-12 rounded-full">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </button>

        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={handleProfileClick}>
          <h3 className="text-slate-200 font-medium text-sm md:text-base truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{chatPreference?.nickname || selectedUser.fullName}</h3>
          <p className="text-xs md:text-sm flex items-center gap-1.5 chat-text-muted">
            {isTyping ? (
              <>
                <span className="text-cyan-300">User is typing</span>
                <span className="typing-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </>
            ) : (
              <>
                {isOnline ? <span className="chat-dot-online" /> : null}
                {isOnline ? "Online" : "Offline"}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {areFriends && (
          <>
            <button
              onClick={handleToggleFavourite}
              disabled={isLoading}
              className="ripple-btn chat-btn transition-colors cursor-pointer p-2 min-w-[44px] min-h-[44px] rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              {isFav ? (
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500 hover:fill-pink-600 hover:text-pink-600" />
              ) : (
                <Heart className="w-5 h-5 text-pink-400 border-pink-400 hover:text-pink-500 hover:border-pink-500 transition-colors" />
              )}
            </button>


          </>
        )}

        {/* Settings button to view user profile */}
        <button onClick={handleProfileClick} className="ripple-btn chat-btn p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
          <Settings className="w-5 h-5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer" />
        </button>

        {/* Close button - hidden on mobile (use back button instead) */}
        <button onClick={handleBack} className="hidden md:block ripple-btn chat-btn p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
          <XIcon className="w-5 h-5 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
