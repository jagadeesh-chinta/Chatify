import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, Settings, User, Bell, Trash2, 
  MessageSquare, AlertTriangle, Clock, X, Info
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function SettingsPage() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { chats, getFavourites } = useChatStore();
  const [activeTab, setActiveTab] = useState("account");

  // Dynamic Stats
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => {
    // Fetch friends count
    const fetchFriendsCount = async () => {
      try {
        const res = await axiosInstance.get("/friends/list");
        setFriendsCount(res.data?.length || 0);
      } catch (error) {
        console.error("Failed to fetch friends for settings:", error);
      }
    };
    
    fetchFriendsCount();
    getFavourites(); // Ensure favourites are loaded
  }, [getFavourites]);

  // Mock states for UI demonstration
  const [masterNotification, setMasterNotification] = useState(true);
  const [notifyRequests, setNotifyRequests] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);

  // Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setIsSubmittingFeedback(true);
    try {
        await axiosInstance.post("/feedback", { message: feedbackMessage });
        toast.success("Thank you! Your feedback has been sent.");
        setFeedbackMessage("");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send feedback");
    } finally {
        setIsSubmittingFeedback(false);
    }
  };
  
  // Deletion state
  const [deletionScheduledAt, setDeletionScheduledAt] = useState(() => {
    return localStorage.getItem("deletionScheduledAt") || null;
  });
  const [deletionTimeRemaining, setDeletionTimeRemaining] = useState(null);

  useEffect(() => {
    let timer;
    if (deletionScheduledAt) {
      const updateTimer = () => {
        const remaining = new Date(deletionScheduledAt).getTime() + 24 * 60 * 60 * 1000 - Date.now();
        if (remaining <= 0) {
          setDeletionTimeRemaining("Account Deleted");
          // In real app, trigger logout/deletion here
        } else {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((remaining % (1000 * 60)) / 1000);
          setDeletionTimeRemaining(`${hours}h ${mins}m ${secs}s`);
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [deletionScheduledAt]);

  const handleStartDeletion = () => {
    const now = new Date().toISOString();
    localStorage.setItem("deletionScheduledAt", now);
    setDeletionScheduledAt(now);
    toast.success("Account deletion scheduled in 24 hours.");
  };

  const handleCancelDeletion = () => {
    localStorage.removeItem("deletionScheduledAt");
    setDeletionScheduledAt(null);
    setDeletionTimeRemaining(null);
    toast.success("Account deletion cancelled.");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-cyan-400" /> Account Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Username</p>
                <p className="text-slate-200 font-medium">{authUser?.fullName}</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="text-slate-200 font-medium">{authUser?.email}</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Phone Number</p>
                <p className="text-slate-200 font-medium">Not added</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Joining Date</p>
                <p className="text-slate-200 font-medium">
                  {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Number of Friends</p>
                <p className="text-slate-200 font-medium">{friendsCount}</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Favourite Contacts</p>
                <p className="text-slate-200 font-medium">{chats?.length || 0}</p>
              </div>
              <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-400 mb-1">Blocked Contacts</p>
                <p className="text-slate-200 font-medium">0</p>
              </div>
            </div>
          </div>
        );
      
      case "notifications":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-cyan-400" /> Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                <div>
                  <p className="text-slate-200 font-medium">Master Notifications</p>
                  <p className="text-xs text-slate-400">Turn on or off all notifications</p>
                </div>
                <button 
                  onClick={() => setMasterNotification(!masterNotification)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${masterNotification ? 'bg-cyan-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${masterNotification ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className={`space-y-4 transition-opacity ${masterNotification ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <p className="text-slate-300">Friend Requests Notifications</p>
                  <button 
                    onClick={() => setNotifyRequests(!notifyRequests)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${notifyRequests ? 'bg-cyan-500/80' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${notifyRequests ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <p className="text-slate-300">User Message Notifications</p>
                  <button 
                    onClick={() => setNotifyMessages(!notifyMessages)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${notifyMessages ? 'bg-cyan-500/80' : 'bg-slate-600'}`}
                  >
                    <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${notifyMessages ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "deletion":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-red-400 flex items-center gap-2 mb-6">
              <Trash2 className="w-5 h-5 text-red-400" /> Account Deletion
            </h2>
            
            <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-xl text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">Permanently delete account</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                When you click Yes, your account will be scheduled for deletion. You will have exactly 24 hours to cancel this process. If the time exceeds, your account and all related data will be permanently deleted from the database.
              </p>

              {deletionScheduledAt ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center gap-2 bg-red-500/10 text-red-400 px-6 py-3 rounded-lg border border-red-500/20">
                    <Clock className="w-5 h-5 animate-pulse" />
                    <span className="font-mono text-lg font-semibold">{deletionTimeRemaining}</span>
                  </div>
                  <p className="text-sm text-slate-400">Deletion in progress...</p>
                  <button
                    onClick={handleCancelDeletion}
                    className="mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium"
                  >
                    Stop Deletion Process
                  </button>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleStartDeletion}
                    className="px-8 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Yes, Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case "feedback":
        return (
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-cyan-400" /> Feedback
            </h2>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <p className="text-slate-300 text-sm mb-4">
                We value your opinion! Let us know how we can improve Chatify.
              </p>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Type your feedback here..."
                  className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Feedback"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const navItems = [
    { id: "account", label: "Account Details" },
    { id: "notifications", label: "Notification Settings" },
    { id: "deletion", label: "Account Deletion" },
    { id: "feedback", label: "Feedback" },
  ];

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col relative overflow-hidden bg-transparent">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-700/50 bg-slate-900/30">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="feature-back-btn cursor-pointer flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Chat</span>
        </button>
        <div className="flex-1 text-center pr-12">
          <h1 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" /> Settings
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Left Navigation */}
        <div className="w-64 border-r border-slate-700/50 bg-slate-900/20 flex flex-col p-4 overflow-y-auto hidden md:flex">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${activeTab === item.id 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"}
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dropdown (Visible only on small screens) */}
        <div className="md:hidden absolute top-[72px] left-0 w-full bg-slate-900 border-b border-slate-700/50 z-10 px-4 py-2 flex overflow-x-auto gap-2 chat-scroll">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === item.id 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                  : "text-slate-400 bg-slate-800/50 border border-transparent"}
              `}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Right Content Pane */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 md:mt-0 chat-scroll relative">
          <div className="max-w-3xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
