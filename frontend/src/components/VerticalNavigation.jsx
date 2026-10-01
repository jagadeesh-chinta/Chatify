import { useNavigate } from "react-router";
import { MessageCircle, User, Key, History, Users, Bell, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

function VerticalNavigation({ currentPane }) {
  const navigate = useNavigate();
  const { openLogoutModal } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const navItems = [
    {
      id: "chat",
      label: "Chat",
      icon: MessageCircle,
      action: () => navigate("/chat"),
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      action: () => navigate("/profile"),
    },
    {
      id: "chatkey",
      label: "ChatKey",
      icon: Key,
      action: () => navigate("/chatkey"),
    },
    {
      id: "restore-chat",
      label: "Restore Chat",
      icon: History,
      action: () => navigate("/restore-chat"),
    },
    {
      id: "requests",
      label: "Requests",
      icon: Users,
      action: () => navigate("/requests"),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : null,
      action: () => navigate("/notifications"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      action: () => navigate("/settings"),
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      action: () => openLogoutModal(),
      isDanger: true,
    }
  ];

  return (
    <div id="vertical-nav" className="px-2 group/nav flex flex-col gap-1 w-[200px]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPane === item.id;

        return (
          <button
            key={item.id}
            onClick={item.action}
            title={item.label}
            className={`
              relative flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 outline-none
              hover:bg-white/10 hover:scale-[1.02]
              ${isActive ? "bg-cyan-500/20 text-cyan-400" : "text-slate-300"}
              ${item.isDanger && !isActive ? "hover:text-red-400 hover:bg-red-500/10" : ""}
            `}
          >
            <div className="relative flex items-center justify-center min-w-[24px]">
              <Icon className="w-6 h-6 transition-transform duration-300" />
              
              {/* Badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center leading-none">
                  {item.badge}
                </span>
              )}
            </div>

            {/* Label (Fades in on hover) */}
            <div 
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                max-w-0 opacity-0 -translate-x-2
                group-hover/nav:max-w-[150px] group-hover/nav:opacity-100 group-hover/nav:translate-x-0
              `}
            >
              <span className="whitespace-nowrap font-medium text-sm block pl-1">
                {item.label}
              </span>
            </div>
            
            {/* Active Glow Indicator */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl ring-1 ring-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default VerticalNavigation;
