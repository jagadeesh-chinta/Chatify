import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 mx-2 md:m-2">
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 min-h-[44px] text-sm md:text-base ${
          activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Favourites
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 min-h-[44px] text-sm md:text-base ${
          activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}
export default ActiveTabSwitch;
