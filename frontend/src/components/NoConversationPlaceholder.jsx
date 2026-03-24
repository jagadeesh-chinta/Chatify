import { useState, useEffect, useCallback } from "react";
import { MessageCircleIcon, Search } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const NoConversationPlaceholder = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Debounced search function
  const searchUsers = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/messages/search?query=${encodeURIComponent(query)}`);
      setSearchResults(res.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchUsers]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Search Bar at Top */}
      <div className="p-4 border-b border-white/10 chat-gradient-header chat-glass-strong">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 chat-glass rounded-full text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-[#00c6ff]/50 transition-all"
          />
        </div>
      </div>

      {/* Search Results or Default Message */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery.trim().length > 0 ? (
          <div className="p-4">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserClick(user)}
                    className="chat-list-item flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                  >
                    <div className={`avatar ${onlineUsers.includes(user._id) ? "online" : "offline"}`}>
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={user.profilePic || "/avatar.png"}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-200 font-medium">{user.fullName}</h4>
                      <p className="text-slate-400 text-xs">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No users found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="size-20 bg-gradient-to-br from-[#00c6ff]/25 to-[#00ffcc]/15 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_24px_rgba(0,198,255,0.2)]">
              <MessageCircleIcon className="size-10 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-2">Select a conversation</h3>
            <p className="text-slate-400 max-w-md">
              Choose a contact from the sidebar or search for any user above to start chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoConversationPlaceholder;
