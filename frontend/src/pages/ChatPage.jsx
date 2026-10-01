import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useState } from "react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import LogoutConfirmation from "../components/LogoutConfirmation";
import VerticalNavigation from "../components/VerticalNavigation";
import { useNotificationStore } from "../store/useNotificationStore";

import ProfilePage from "./ProfilePage";
import ChatKeyPage from "./ChatKeyPage";
import RestoreChat from "./RestoreChat";
import RequestsPage from "../components/RequestsPage";
import NotificationsPage from "./NotificationsPage";
import SettingsPage from "./SettingsPage";

import { useLocation } from "react-router";

function ChatPage() {
  const location = useLocation();
  const rightPane = location.pathname.split("/")[1] || "chat";
  const { isLogoutModalOpen, logout, closeLogoutModal } = useAuthStore();
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
        {/* Add group class and hover width transitions for the vertical navigation */}
        <div className={`
          h-full w-full chat-glass flex flex-col overflow-hidden transition-[width] duration-300 ease-in-out
          ${rightPane !== "chat" || isLogoutModalOpen ? 'hidden' : selectedUser ? 'hidden md:flex' : 'flex'}
          group/sidebar
          md:w-[380px] lg:w-[420px]
          has-[#vertical-nav:hover]:md:w-[512px] has-[#vertical-nav:hover]:lg:w-[552px]
        `}>
          <ProfileHeader theme={theme} onToggleTheme={toggleTheme} />
          
          <div className="flex flex-1 overflow-hidden">
            {/* Vertical Navigation Rail */}
            <div className="border-r border-white/5 py-2 transition-[width] duration-300 ease-in-out w-[68px] has-[#vertical-nav:hover]:w-[200px] overflow-x-hidden overflow-y-auto chat-scroll">
              <VerticalNavigation currentPane={rightPane} />
            </div>

            {/* Contacts Area */}
            <div className="flex-1 flex flex-col min-w-[312px] lg:min-w-[352px] overflow-hidden">
              <ActiveTabSwitch />
              <div className="flex-1 overflow-y-auto chat-scroll p-4 space-y-2 overscroll-contain">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - Chat area (full width on mobile when chat is open) */}
        <div className={`
          h-full flex-1 flex flex-col chat-glass overflow-hidden relative
          ${selectedUser || isLogoutModalOpen || rightPane !== "chat" ? 'flex' : 'hidden md:flex'}
        `}>
          {isLogoutModalOpen ? (
            <LogoutConfirmation 
              onConfirm={() => {
                logout();
                closeLogoutModal();
              }}
              onCancel={closeLogoutModal}
            />
          ) : rightPane === "profile" ? (
            <ProfilePage />
          ) : rightPane === "chatkey" ? (
            <ChatKeyPage />
          ) : rightPane === "restore-chat" ? (
            <RestoreChat />
          ) : rightPane === "requests" ? (
            <RequestsPage />
          ) : rightPane === "notifications" ? (
            <NotificationsPage />
          ) : rightPane === "settings" ? (
            <SettingsPage />
          ) : selectedUser ? (
            <ChatContainer />
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default ChatPage;
