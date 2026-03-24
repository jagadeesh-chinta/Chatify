import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import { useNotificationStore } from "../store/useNotificationStore";

function ChatPage() {
  const { 
    activeTab, 
    selectedUser, 
    subscribeToFriendRequests, 
    unsubscribeFromFriendRequests,
    subscribeToFriendRemoval,
    unsubscribeFromFriendRemoval,
    subscribeToUnreadUpdates,
    fetchUnreadCounts,
  } = useChatStore();
  const {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    fetchUnreadCount,
  } = useNotificationStore();

  const [theme, setTheme] = useState(() => localStorage.getItem("chatTheme") || "dark");

  useEffect(() => {
    localStorage.setItem("chatTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    // Subscribe to real-time friend request events
    subscribeToFriendRequests();
    // Subscribe to friend removal events
    subscribeToFriendRemoval();
    // Subscribe to unread message updates
    subscribeToUnreadUpdates();
    // Fetch initial unread counts
    fetchUnreadCounts();
    // Subscribe to notification updates and fetch badge count
    subscribeToNotifications();
    fetchUnreadCount();

    // Cleanup on unmount
    return () => {
      unsubscribeFromFriendRequests();
      unsubscribeFromFriendRemoval();
      unsubscribeFromNotifications();
    };
  }, [subscribeToFriendRequests, unsubscribeFromFriendRequests, subscribeToFriendRemoval, unsubscribeFromFriendRemoval, subscribeToUnreadUpdates, fetchUnreadCounts, subscribeToNotifications, unsubscribeFromNotifications, fetchUnreadCount]);

  return (
    <div className={`chat-shell chat-shell-fade chat-theme-${theme} relative h-full w-full flex items-center justify-center overflow-hidden p-2 md:p-4`}>
      <div className="chat-bg-layer" />
      <div className="relative h-[98vh] w-[98vw] md:h-[90vh] md:w-[90vw] max-w-[1400px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE - Sidebar (hidden on mobile when chat is open) */}
        <div className={`
          h-full w-full md:w-[320px] lg:w-[360px] chat-glass flex flex-col overflow-hidden
          ${selectedUser ? 'hidden md:flex' : 'flex'}
        `}>
          <ProfileHeader theme={theme} onToggleTheme={toggleTheme} />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-2 overscroll-contain">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE - Chat area (full width on mobile when chat is open) */}
        <div className={`
          h-full flex-1 flex flex-col chat-glass overflow-hidden
          ${selectedUser ? 'flex' : 'hidden md:flex'}
        `}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default ChatPage;
