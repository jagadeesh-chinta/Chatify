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
import ScreenshotOverlay from "./ScreenshotOverlay";
import { RotateCcw, Volume2, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { detectLanguage, getVoiceForLanguage } from "../lib/languageDetection";
import { axiosInstance } from "../lib/axios";

const EDIT_DELETE_WINDOW_MS = 2 * 60 * 60 * 1000;

function ChatContainer() {
  const navigate = useNavigate();
  const {
    selectedUser,
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
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const chatContentRef = useRef(null);
  const screenshotTimeoutRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const screenshotAttemptNotifyRef = useRef(0);

  const [contextMenu, setContextMenu] = useState(null); // { x, y, message }
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showScreenshotOverlay, setShowScreenshotOverlay] = useState(false);

  // Text-to-Speech function with auto language detection
  const speakMessage = useCallback((messageId, text) => {
    if (!window.speechSynthesis) {
      toast.error("Text-to-Speech not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (!text || text.trim() === "") {
      toast.error("No text to speak.");
      return;
    }

    const detectedLang = detectLanguage(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectedLang;

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

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    fetchFriendStatus && fetchFriendStatus(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages, fetchFriendStatus]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Privacy Protection: Screenshot Detection and Copy Prevention
  useEffect(() => {
    const notifyScreenshot = async (type) => {
      if (!selectedUser?._id) return;

      const now = Date.now();
      if (type === "screenshot_attempt" && now - screenshotAttemptNotifyRef.current < 5000) return;

      if (type === "screenshot_attempt") screenshotAttemptNotifyRef.current = now;

      try {
        await axiosInstance.post("/notifications", {
          receiverId: selectedUser._id,
          type,
        });
      } catch (error) {
        console.log("screenshot notification error:", error?.response?.data?.message || error.message);
      }
    };

    const triggerScreenshotProtection = () => {
      setIsBlurred(true);
      setShowScreenshotOverlay(true);

      // Clear existing timeouts
      if (screenshotTimeoutRef.current) clearTimeout(screenshotTimeoutRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);

      // Auto-reset after 4 seconds
      screenshotTimeoutRef.current = setTimeout(() => {
        setShowScreenshotOverlay(false);
      }, 4000);

      blurTimeoutRef.current = setTimeout(() => {
        setIsBlurred(false);
      }, 4000);

      notifyScreenshot("screenshot_attempt");
    };

    const handleScreenshotDetection = (e) => {
      // Windows/Linux: PrintScreen, Ctrl+PrintScreen, Shift+PrintScreen
      const isPrintScreenKey = e.key === "PrintScreen";
      const isWindowsShiftPrint = e.shiftKey && e.key === "PrintScreen";
      const isWindowsCtrlPrint = e.ctrlKey && e.key === "PrintScreen";
      
      // macOS: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5, Cmd+Shift+S
      const isMacScreenshot =
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) ||
        (e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S"));

      if (isPrintScreenKey || isWindowsShiftPrint || isWindowsCtrlPrint || isMacScreenshot) {
        e.preventDefault();
        triggerScreenshotProtection();
      }
    };

    const handleScreenshotKeyup = (e) => {
      // Also handle keyup for PrintScreen as a fallback
      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerScreenshotProtection();
      }
    };

    const handleRightClickPrevention = (e) => {
      if (chatContentRef.current && chatContentRef.current.contains(e.target)) {
        e.preventDefault();
      }
    };

    const handleCopyPrevention = (e) => {
      if (chatContentRef.current && chatContentRef.current.contains(e.target)) {
        // Ctrl+C on Windows/Linux
        if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
          e.preventDefault();
        }
        // Cmd+C on Mac
        if (e.metaKey && (e.key === "c" || e.key === "C")) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleScreenshotDetection);
    document.addEventListener("keyup", handleScreenshotKeyup);
    document.addEventListener("contextmenu", handleRightClickPrevention);
    document.addEventListener("keydown", handleCopyPrevention);

    return () => {
      document.removeEventListener("keydown", handleScreenshotDetection);
      document.removeEventListener("keyup", handleScreenshotKeyup);
      document.removeEventListener("contextmenu", handleRightClickPrevention);
      document.removeEventListener("keydown", handleCopyPrevention);
      if (screenshotTimeoutRef.current) clearTimeout(screenshotTimeoutRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleRemoveFriendConfirm = async () => {
    const success = await removeFriend(selectedUser._id);
    if (success) {
      setShowRemoveConfirm(false);
    }
  };

  const handleViewProfile = () => {
    setViewingProfile(true);
  };

  const handleBackFromProfile = () => {
    setViewingProfile(false);
  };

  if (viewingProfile) {
    return <ViewUserProfile userId={selectedUser._id} onBack={handleBackFromProfile} />;
  }

  return (
    <div className="relative flex flex-col h-full">
      <ChatHeader onViewProfile={handleViewProfile} onRemoveFriend={() => setShowRemoveConfirm(true)} />

      {showScreenshotOverlay && <ScreenshotOverlay isVisible={showScreenshotOverlay} />}

      <div
        ref={chatContentRef}
        className={`relative flex-1 px-2 md:px-3 overflow-y-auto chat-scroll py-4 md:py-6 chat-no-select ${
          isBlurred ? "chat-blur" : ""
        }`}
      >
        {(() => {
          const ownSentMessages = messages.filter(
            (m) => m.senderId === authUser._id && m.status !== "scheduled"
          );
          const lastOwnSentMessageId = ownSentMessages.length
            ? ownSentMessages[ownSentMessages.length - 1]._id
            : null;

          return messages.length > 0 && !isMessagesLoading ? (
            <div className="w-full space-y-4 md:space-y-6">
                {messages.map((msg) => {
                  const isOwn = msg.senderId === authUser._id;
                  const isScheduled = msg.status === "scheduled" && msg.isScheduled;
                  const isLastOwnMessage = msg._id === lastOwnSentMessageId;
                  const tickStatus = msg.isRead ? "seen" : msg.isDelivered ? "delivered" : "sent";

                  return (
                    <div
                      key={msg._id}
                      className={`chat chat-message-in ${isOwn ? "chat-end" : "chat-start"}`}
                      onMouseEnter={() => !isOwn && setHoveredMessageId(msg._id)}
                      onMouseLeave={() => setHoveredMessageId(null)}
                    >
                      <div
                        className={`chat-bubble chat-bubble-tail ${isOwn ? "chat-bubble-tail-own" : "chat-bubble-tail-other"} relative rounded-2xl ${
                          isScheduled
                            ? "bg-amber-700/80 text-amber-100 border border-amber-500/30"
                            : isOwn
                              ? "chat-bubble-own"
                              : "chat-bubble-other"
                        }`}
                        onContextMenu={(e) => {
                          if (!isOwn) return;
                          e.preventDefault();
                          setContextMenu({ x: e.clientX, y: e.clientY, message: msg });
                        }}
                      >
                        {isScheduled && (
                          <div className="flex items-center gap-1 text-xs text-amber-300 mb-1 -mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Scheduled</span>
                          </div>
                        )}

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

                        {msg.image && <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />}
                        {msg.text && <p className="mt-2">{msg.text}</p>}

                        <p className={`text-[11px] mt-2 opacity-85 flex items-center gap-1 ${isOwn ? "justify-end" : "justify-start"}`}>
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

                          {msg.status !== "scheduled" && (
                            <>
                              {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </>
                          )}

                          {msg.edited && <span className="italic text-[10px] opacity-60">(edited)</span>}

                          {isOwn && !isScheduled && (
                            <span
                              className={`chat-message-ticks ${
                                tickStatus === "seen"
                                  ? "chat-message-ticks-seen"
                                  : "chat-message-ticks-muted"
                              } ${isLastOwnMessage && tickStatus === "seen" ? "chat-message-ticks-animate" : ""}`}
                              aria-label={tickStatus}
                            >
                              {tickStatus === "seen" ? "✓✓" : "✓"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
            </div>
          ) : isMessagesLoading ? (
              <MessagesLoadingSkeleton />
            ) : isChatDeleted ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-400/10 rounded-full flex items-center justify-center mb-5">
                  <RotateCcw className="size-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-200 mb-3">This chat was deleted</h3>
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
          ) : friendStatus && friendStatus.status === "friends" ? (
            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
          ) : (
            <FriendRequestBlock otherUser={selectedUser} status={friendStatus} />
          );
        })()}
      </div>

      {contextMenu && (
        (() => {
          const message = contextMenu.message;
          const sentAt = message.status === "scheduled"
            ? Number.POSITIVE_INFINITY
            : new Date(message.scheduledAt || message.createdAt).getTime();
          const canEditOrDeleteForEveryone = Number.isFinite(sentAt)
            ? Date.now() - sentAt <= EDIT_DELETE_WINDOW_MS
            : true;

          return (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDeleteForMe={() => deleteForMe(contextMenu.message._id)}
          onDeleteForEveryone={() => deleteForEveryone(contextMenu.message._id)}
          onEdit={() => setEditingMessage(contextMenu.message)}
          canEditOrDeleteForEveryone={canEditOrDeleteForEveryone}
        />
          );
        })()
      )}

      {friendStatus && friendStatus.status === "friends" ? <MessageInput /> : null}

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
