import { UserMinus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function RemoveFriendConfirmation({ userName, onConfirm, onCancel }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleConfirm = async () => {
    setIsRemoving(true);
    await onConfirm();
    setIsRemoving(false);
  };

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Blur backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Confirmation dialog */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 z-10">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <UserMinus className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-200 text-center mb-2">
          Remove Friend
        </h3>

        {/* Message */}
        <p className="text-slate-400 text-center mb-4">
          Are you sure you want to remove <span className="text-slate-200 font-medium">{userName}</span> as a friend?
        </p>

        {/* Note */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-6">
          <p className="text-red-400 text-xs text-center leading-relaxed">
            <span className="font-semibold">Note:</span> If you remove the friend, the entire chat will be deleted and no need to restore.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isRemoving}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-slate-200 rounded-lg transition-colors font-medium min-h-[44px]"
          >
            NO
          </button>
          <button
            onClick={handleConfirm}
            disabled={isRemoving}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 min-h-[44px]"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "YES"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  
  return createPortal(modalContent, document.body);
}

export default RemoveFriendConfirmation;
