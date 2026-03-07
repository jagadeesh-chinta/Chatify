import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

function ChatsList() {
  const { getFavourites, chats, isUsersLoading, setSelectedUser, unreadCounts } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [lastMessages, setLastMessages] = useState({});

  useEffect(() => {
    getFavourites();
  }, [getFavourites]);

  // Fetch last message for each favourite
  useEffect(() => {
    const fetchLastMessages = async () => {
      const messages = {};
      for (const chat of chats) {
        try {
          const res = await axiosInstance.get(`/messages/${chat._id}`);
          // Handle both array format and { messages, isDeleted } format
          const messagesArray = res.data.messages || res.data;
          if (Array.isArray(messagesArray) && messagesArray.length > 0) {
            messages[chat._id] = messagesArray[messagesArray.length - 1];
          }
        } catch (error) {
          console.log("Error fetching messages for", chat._id);
        }
      }
      setLastMessages(messages);
    };

    if (chats.length > 0) {
      fetchLastMessages();
    }
  }, [chats]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const lastMessage = lastMessages[chat._id];
        const unreadData = unreadCounts[chat._id];
        const unreadCount = unreadData?.count || 0;
        
        // Use unread data's last message if available (more recent)
        const messagePreview = unreadData?.lastMessage 
          ? unreadData.lastMessage 
          : lastMessage
            ? lastMessage.text || "(Image)"
            : "No messages yet";

        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-3 md:p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 active:bg-cyan-500/30 transition-colors min-h-[60px]"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className="size-10 md:size-12 rounded-full">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 font-medium truncate text-sm md:text-base">{chat.fullName}</h4>
                <p className={`text-xs md:text-sm truncate ${unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                  {messagePreview}
                </p>
              </div>
              {/* Unread count badge */}
              {unreadCount > 0 && (
                <div className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ChatsList;
