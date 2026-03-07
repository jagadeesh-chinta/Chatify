import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import FriendRequestBlock from "./FriendRequestBlock";
import MessageContextMenu from "./MessageContextMenu";
import RemoveFriendConfirmation from "./RemoveFriendConfirmation";
import ViewUserProfile from "./ViewUserProfile";
import { useAuthStore as _useAuthStore } from "../store/useAuthStore";
import { RotateCcw, Volume2, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { detectLanguage, getVoiceForLanguage } from "../lib/languageDetection";

function ChatContainer() {
  const navigate = useNavigate();
  const {
    selectedUser,
    setSelectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    friendStatus,
    fetchFriendStatus,
    deleteForMe,
    deleteForEveryone,
    setEditingMessage,
    isChatDeleted,
    removeFriend,
  } = useChatStore();
  const { authUser } = _useAuthStore();
  const messageEndRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, message }
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);

  // Text-to-Speech function with auto language detection
  const speakMessage = useCallback((messageId, text) => {
    if (!window.speechSynthesis) {
      toast.error("Text-to-Speech not supported in this browser.");
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (!text || text.trim() === "") {
      toast.error("No text to speak.");
      return;
    }

    // Detect language from message text
    const detectedLang = detectLanguage(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectedLang;

    // Try to get a matching voice for the detected language
    const voice = getVoiceForLanguage(detectedLang);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
    };
    
    utterance.onend = () => {
      setSpeakingMessageId(null);
    };
    
    utterance.onerror = () => {
      setSpeakingMessageId(null);
      toast.error("Failed to speak message.");
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    // always fetch friend status on selected user change
    fetchFriendStatus && fetchFriendStatus(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages, fetchFriendStatus]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle remove friend confirmation
  const handleRemoveFriendConfirm = async () => {
    const success = await removeFriend(selectedUser._id);
    if (success) {
      setShowRemoveConfirm(false);
      // Chat will now show "Send Friend Request" as friendStatus is updated
    }
  };

  // Handle view profile
  const handleViewProfile = () => {
    setViewingProfile(true);
  };

  const handleBackFromProfile = () => {
    setViewingProfile(false);
  };

  // If viewing profile, show ViewUserProfile component
  if (viewingProfile) {
    return (
      <ViewUserProfile 
        userId={selectedUser._id} 
        onBack={handleBackFromProfile} 
      />
    );
  }

  return (
    <div className="relative flex flex-col h-full">
      <ChatHeader 
        onViewProfile={handleViewProfile}
        onRemoveFriend={() => setShowRemoveConfirm(true)}
      />
      <div className="flex-1 px-3 md:px-6 overflow-y-auto py-4 md:py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
            {messages.map((msg) => {
              const isOwn = msg.senderId === authUser._id;
              const isScheduled = msg.status === "scheduled" && msg.isScheduled;
              return (
                <div
                  key={msg._id}
                  className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
                  onMouseEnter={() => !isOwn && setHoveredMessageId(msg._id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div
                    className={`chat-bubble relative ${
                      isScheduled
                        ? "bg-amber-700/80 text-amber-100 border border-amber-500/30"
                        : isOwn
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                    onContextMenu={(e) => {
                      if (!isOwn) return;
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
                    }}
                  >
                    {/* Scheduled label at top */}
                    {isScheduled && (
                      <div className="flex items-center gap-1 text-xs text-amber-300 mb-1 -mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Scheduled</span>
                      </div>
                    )}
                    {/* TTS Speaker Icon for received messages */}
                    {!isOwn && msg.text && (hoveredMessageId === msg._id || speakingMessageId === msg._id) && (
                      <button
                        type="button"
                        onClick={() => speakMessage(msg._id, msg.text)}
                        className={`absolute -right-8 top-1 p-1 rounded-full transition-all duration-200 ${
                          speakingMessageId === msg._id
                            ? "text-cyan-400 bg-slate-700"
                            : "text-slate-400 hover:text-cyan-400 hover:bg-slate-700"
                        }`}
                        title="Listen to message"
                      >
                        <Volume2 className={`w-4 h-4 ${speakingMessageId === msg._id ? "animate-pulse" : ""}`} />
                      </button>
                    )}
                    {msg.image && (
                      <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                    )}
                    {msg.text && <p className="mt-2">{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {/* Scheduled message indicator */}
                      {msg.status === "scheduled" && msg.isScheduled && (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400">
                            Scheduled: {new Date(msg.scheduledAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </>
                      )}
                      {/* Regular sent message time */}
                      {msg.status !== "scheduled" && (
                        <>
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                      {msg.edited && (
                        <span className="italic text-[10px] opacity-60">(edited)</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* 👇 scroll target */}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : isChatDeleted ? (
          // Chat is soft-deleted, show message to restore
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-400/10 rounded-full flex items-center justify-center mb-5">
              <RotateCcw className="size-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-200 mb-3">
              This chat was deleted
            </h3>
            <p className="text-slate-400 text-sm max-w-md mb-5">
              You previously deleted this conversation. Restore it from the RestoreChat section to view old messages.
            </p>
            <button
              onClick={() => navigate("/restore-chat")}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Go to Restore Chat
            </button>
          </div>
        ) : (
          // when no messages, determine if friendStatus allows chatting
          friendStatus && friendStatus.status === "friends" ? (
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          ) : (
            <FriendRequestBlock otherUser={selectedUser} status={friendStatus} />
          )
        )}
      </div>

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDeleteForMe={() => deleteForMe(contextMenu.message._id)}
          onDeleteForEveryone={() => deleteForEveryone(contextMenu.message._id)}
          onEdit={() => setEditingMessage(contextMenu.message)}
        />
      )}

      {friendStatus && friendStatus.status === "friends" ? <MessageInput /> : null}

      {/* Remove Friend Confirmation Dialog */}
      {showRemoveConfirm && (
        <RemoveFriendConfirmation
          userName={selectedUser.fullName}
          onConfirm={handleRemoveFriendConfirm}
          onCancel={() => setShowRemoveConfirm(false)}
        />
      )}
    </div>
  );
}

export default ChatContainer;
