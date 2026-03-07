import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

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

  useEffect(() => {
    // Subscribe to real-time friend request events
    subscribeToFriendRequests();
    // Subscribe to friend removal events
    subscribeToFriendRemoval();
    // Subscribe to unread message updates
    subscribeToUnreadUpdates();
    // Fetch initial unread counts
    fetchUnreadCounts();

    // Cleanup on unmount
    return () => {
      unsubscribeFromFriendRequests();
      unsubscribeFromFriendRemoval();
    };
  }, [subscribeToFriendRequests, unsubscribeFromFriendRequests, subscribeToFriendRemoval, unsubscribeFromFriendRemoval, subscribeToUnreadUpdates, fetchUnreadCounts]);

  return (
    <div className="relative w-full max-w-6xl h-[100dvh] md:h-[800px]">
      <BorderAnimatedContainer>
        {/* LEFT SIDE - Sidebar (hidden on mobile when chat is open) */}
        <div className={`
          w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col
          ${selectedUser ? 'hidden md:flex' : 'flex'}
        `}>
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2 overscroll-contain">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE - Chat area (full width on mobile when chat is open) */}
        <div className={`
          flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm
          ${selectedUser ? 'flex' : 'hidden md:flex'}
        `}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
    </div>
  );
}
export default ChatPage;
