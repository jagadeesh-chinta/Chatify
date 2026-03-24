import { useRef, useState, useEffect, useCallback } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, Undo2Icon, MicIcon, ClockIcon } from "lucide-react";
import { getPreferredRecognitionLanguage } from "../lib/languageDetection";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const undoTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const schedulerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // --- Speech Recognition Setup with Auto Language Detection ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Use browser's preferred language for speech recognition
      recognition.lang = getPreferredRecognitionLanguage();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? prev + " " + transcript : transcript));
        inputRef.current?.focus();
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access.");
        } else if (event.error === "no-speech") {
          toast.error("No speech detected. Please try again.");
        } else {
          toast.error("Voice recognition error. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        toast.error("Failed to start voice recognition. Please try again.");
      }
    }
  }, [isListening]);

  const {
    sendMessage,
    isSoundEnabled,
    selectedUser,
    editingMessage,
    setEditingMessage,
    editMessage,
    deletedMessageTemp,
    undoDeleteForMe,
    confirmDeleteForMe,
  } = useChatStore();
  const socket = useAuthStore((state) => state.socket);
  const authUser = useAuthStore((state) => state.authUser);

  const emitStopTyping = useCallback(() => {
    if (!socket || !authUser?._id || !selectedUser?._id) return;
    socket.emit("stop_typing", {
      fromUserId: authUser._id,
      toUserId: selectedUser._id,
    });
  }, [socket, authUser?._id, selectedUser?._id]);

  const handleTypingSignal = useCallback(
    (value) => {
      if (!socket || !authUser?._id || !selectedUser?._id || editingMessage) return;

      clearTimeout(typingTimeoutRef.current);

      if (!value.trim()) {
        emitStopTyping();
        return;
      }

      socket.emit("typing", {
        fromUserId: authUser._id,
        toUserId: selectedUser._id,
      });

      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping();
      }, 500);
    },
    [socket, authUser?._id, selectedUser?._id, editingMessage, emitStopTyping]
  );

  // --- UNDO DELETE timer ---
  useEffect(() => {
    if (deletedMessageTemp) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        confirmDeleteForMe(deletedMessageTemp._id);
      }, 5000);
    }
    return () => clearTimeout(undoTimerRef.current);
  }, [deletedMessageTemp, confirmDeleteForMe]);

  // --- EDIT: populate input ---
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || "");
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      emitStopTyping();
    };
  }, [emitStopTyping]);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setText("");
  }, [setEditingMessage]);

  const handleUndo = useCallback(() => {
    clearTimeout(undoTimerRef.current);
    undoDeleteForMe();
  }, [undoDeleteForMe]);

  // --- Close scheduler popup on outside click ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (schedulerRef.current && !schedulerRef.current.contains(e.target)) {
        setShowScheduler(false);
      }
    };
    if (showScheduler) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showScheduler]);

  // --- Get minimum datetime for scheduler (now + 1 minute) ---
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleScheduleToggle = () => {
    if (showScheduler) {
      // Clear and close
      setScheduledDateTime("");
      setShowScheduler(false);
    } else {
      setShowScheduler(true);
    }
  };

  const handleClearSchedule = () => {
    setScheduledDateTime("");
    setShowScheduler(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    // Editing mode
    if (editingMessage) {
      if (!text.trim()) return;
      if (isSoundEnabled) playRandomKeyStrokeSound();
      editMessage(editingMessage._id, text.trim());
      setText("");
      return;
    }

    if (!text.trim() && !imagePreview) return;

    // Validate scheduled time if set
    if (scheduledDateTime) {
      const scheduledDate = new Date(scheduledDateTime);
      const now = new Date();
      if (scheduledDate <= now) {
        toast.error("Scheduled time must be in the future");
        return;
      }
    }

    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      scheduledAt: scheduledDateTime ? new Date(scheduledDateTime).toISOString() : null,
    });

    clearTimeout(typingTimeoutRef.current);
    emitStopTyping();

    setText("");
    setImagePreview("");
    setScheduledDateTime("");
    setShowScheduler(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 border-t border-white/10 chat-glass-strong relative">
      {/* Undo delete notification */}
      {deletedMessageTemp && (
        <div className="absolute -top-10 left-0 right-0 chat-glass-strong border-b border-white/10 px-4 py-2 flex items-center justify-between text-sm text-slate-300 z-10">
          <span>Message deleted</span>
          <button
            type="button"
            onClick={handleUndo}
            className="ripple-btn chat-btn flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <Undo2Icon className="w-3.5 h-3.5" />
            UNDO
          </button>
        </div>
      )}

      {/* Edit mode indicator */}
      {editingMessage && !deletedMessageTemp && (
        <div className="absolute -top-10 left-0 right-0 chat-glass-strong border-b border-white/10 px-4 py-2 flex items-center justify-between text-sm text-slate-300 z-10">
          <span>Editing message...</span>
          <button type="button" onClick={cancelEdit} className="text-slate-400 hover:text-slate-200 font-medium">
            Cancel
          </button>
        </div>
      )}

      {/* Scheduled message indicator */}
      {scheduledDateTime && !editingMessage && !deletedMessageTemp && (
        <div className="absolute -top-10 left-0 right-0 bg-gradient-to-r from-amber-900/80 to-amber-800/80 border-b border-amber-600/50 px-4 py-2 flex items-center justify-between text-sm text-amber-100 z-10 backdrop-blur-md">
          <span className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Scheduled for: {new Date(scheduledDateTime).toLocaleString()}
          </span>
          <button
            type="button"
            onClick={handleClearSchedule}
            className="text-amber-300 hover:text-amber-100 font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="w-full mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-white/20"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full chat-glass-strong flex items-center justify-center text-slate-200 hover:bg-white/10"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {text.trim().length > 0 && !editingMessage && (
        <div className="mb-2 ml-1 text-xs chat-text-muted flex items-center gap-2">
          Typing
          <span className="typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="w-full flex flex-wrap md:flex-nowrap gap-2 md:space-x-4 md:gap-0">
        <input
          type="text"
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTypingSignal(e.target.value);
            isSoundEnabled && playRandomKeyStrokeSound();
          }}
          className="flex-1 min-w-0 chat-glass border border-white/10 rounded-full py-2.5 px-4 md:px-5 text-white placeholder-slate-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#00c6ff]/60 focus:shadow-[0_0_20px_rgba(0,198,255,0.35)] transition-all"
          placeholder={editingMessage ? "Edit your message..." : "Type your message..."}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <div className="flex gap-1 md:gap-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`ripple-btn chat-btn chat-glass text-slate-400 hover:text-slate-200 rounded-xl px-3 md:px-4 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${
              imagePreview ? "text-cyan-500" : ""
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`ripple-btn chat-btn chat-glass rounded-xl px-3 md:px-4 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors relative ${
              isListening 
                ? "text-red-500 hover:text-red-400" 
                : "text-slate-400 hover:text-slate-200"
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            <MicIcon className="w-5 h-5" />
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Schedule Message Button */}
          <div className="relative" ref={schedulerRef}>
            <button
              type="button"
              onClick={handleScheduleToggle}
              className={`ripple-btn chat-btn chat-glass rounded-xl px-3 md:px-4 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors relative ${
                scheduledDateTime
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title={scheduledDateTime ? "Scheduled message" : "Schedule message"}
              disabled={editingMessage}
            >
              <ClockIcon className="w-5 h-5" />
              {scheduledDateTime && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>

            {/* Scheduler Popup */}
            {showScheduler && (
              <div className="absolute bottom-full right-0 mb-2 chat-glass-strong rounded-lg shadow-xl p-4 min-w-[260px] md:min-w-[280px] z-20">
                <div className="text-sm text-slate-300 mb-3 flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-amber-400" />
                  <span>Schedule Message</span>
                </div>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  min={getMinDateTime()}
                  className="w-full bg-slate-700/50 border border-white/15 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleClearSchedule}
                    className="ripple-btn chat-btn flex-1 px-3 py-2 text-sm text-slate-300 hover:text-slate-100 bg-slate-700/70 rounded-lg min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScheduler(false)}
                    disabled={!scheduledDateTime}
                    className="ripple-btn chat-btn flex-1 px-3 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    Set Time
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="ripple-btn chat-btn bg-gradient-to-r from-[#00c6ff] to-[#00ffcc] text-[#032027] rounded-xl px-3 md:px-4 py-2 font-semibold hover:from-[#1bd0ff] hover:to-[#30ffd8] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center shadow-[0_10px_24px_rgba(0,198,255,0.35)]"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
export default MessageInput;
