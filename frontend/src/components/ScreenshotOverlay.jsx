import { AlertTriangle } from "lucide-react";

function ScreenshotOverlay({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-8 shadow-2xl max-w-sm animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold text-red-400 mb-2">Screenshot Disabled</h2>
            <p className="text-sm text-slate-300">
              Screenshots are restricted for security reasons
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScreenshotOverlay;
