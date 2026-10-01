import { LogOut } from "lucide-react";

function LogoutConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-transparent z-10">
      <div className="size-20 bg-gradient-to-br from-red-500/25 to-rose-400/15 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_24px_rgba(244,63,94,0.2)]">
        <LogOut className="size-10 text-red-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-200 mb-2">Are you sure?</h3>
      <p className="text-slate-400 text-center max-w-md mb-8">
        Are you absolutely sure you want to logout? You will need to login again to access your chats.
      </p>

      <div className="flex gap-4 w-full max-w-xs justify-center">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-full text-slate-300 font-medium bg-slate-800/80 hover:bg-slate-700 transition-colors border border-white/5"
        >
          No, Back
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 px-4 rounded-full text-white font-medium bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-colors shadow-lg shadow-red-500/20"
        >
          Yes, Logout
        </button>
      </div>
    </div>
  );
}

export default LogoutConfirmation;
