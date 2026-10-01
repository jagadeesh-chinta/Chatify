import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

import { useShallow } from "zustand/react/shallow";

function ChatsList() {
  const navigate = useNavigate();
  const { getFavourites, chats, isUsersLoading, setSelectedUser, unreadCounts, selectedUser, globalLastMessages, fetchGlobalLastMessages } = useChatStore(useShallow(state => ({
    getFavourites: state.getFavourites,
    chats: state.chats,
    isUsersLoading: state.isUsersLoading,
    setSelectedUser: state.setSelectedUser,
    unreadCounts: state.unreadCounts,
    selectedUser: state.selectedUser,
    globalLastMessages: state.globalLastMessages,
    fetchGlobalLastMessages: state.fetchGlobalLastMessages
  })));
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getFavourites();
  }, [getFavourites]);

  // Fetch last message for each favourite
  useEffect(() => {
    if (chats.length > 0) {
      const userIds = chats.map(chat => chat._id);
      fetchGlobalLastMessages(userIds);
    }
  }, [chats, fetchGlobalLastMessages]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const lastMessage = globalLastMessages[chat._id];
        const unreadData = unreadCounts[chat._id];
        const unreadCount = unreadData?.count || 0;
        
        let messagePreview = "No messages yet";
        if (lastMessage && lastMessage.text) {
          messagePreview = lastMessage.text;
        }

        return (
          <div
            key={chat._id}
            className={`chat-list-item p-2 md:p-3 rounded-lg cursor-pointer min-h-[48px] ${selectedUser?._id === chat._id ? "chat-list-item-active" : ""}`}
            onClick={() => {
              setSelectedUser(chat);
              if (window.location.pathname !== "/") {
                navigate("/");
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
                <div className="size-9 md:size-10 rounded-full">
                  <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-300 font-medium truncate text-sm">{chat.fullName}</h4>
                <p className={`text-xs truncate ${unreadCount > 0 ? "text-slate-200 font-medium" : "text-slate-400"}`}>
                  {messagePreview}
                </p>
              </div>
              {/* Unread count badge */}
              {unreadCount > 0 && (
                <div className="chat-unread-badge flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
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
