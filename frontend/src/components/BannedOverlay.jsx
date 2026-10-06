import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Ban, Mail, CheckCircle, ShieldAlert } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export default function BannedOverlay() {
    const { authUser, checkAuth } = useAuthStore();
    const [appealMessage, setAppealMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!authUser || !authUser.isBanned) return null;

    const hasAppealed = !!authUser.banAppeal;

    const handleAppeal = async (e) => {
        e.preventDefault();
        if (!appealMessage.trim()) return;

        setIsSubmitting(true);
        try {
            await axiosInstance.post("/user/submit-ban-appeal", { message: appealMessage });
            toast.success("Appeal submitted successfully");
            await checkAuth(); // Refresh user data to show the "already appealed" state
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit appeal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Blurred background */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
            
            <div className="relative w-full max-w-lg bg-slate-800 border border-red-500/30 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
                <div className="bg-red-500/10 border-b border-red-500/20 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/30">
                        <Ban size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Account Banned</h2>
                    <p className="text-red-300 font-medium">
                        You have misused the platform, so the admin has banned your account.
                    </p>
                </div>

                <div className="p-6">
                    {hasAppealed ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex flex-col items-center text-center">
                            <CheckCircle className="text-emerald-400 mb-3" size={32} />
                            <h3 className="text-lg font-semibold text-white mb-2">Appeal Submitted</h3>
                            <p className="text-slate-300 text-sm">
                                Admin will review your account once. If it is safe, your account will be restored. Otherwise, there is no hope.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleAppeal} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <ShieldAlert size={16} className="text-orange-400" />
                                    Help Option (One-Time Appeal)
                                </label>
                                <textarea
                                    value={appealMessage}
                                    onChange={(e) => setAppealMessage(e.target.value)}
                                    placeholder="Explain why your account should be unbanned..."
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none h-32"
                                    required
                                />
                                <p className="text-xs text-slate-400">
                                    You can only send this message to the admin once. Please be honest.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !appealMessage.trim()}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Mail size={18} />
                                {isSubmitting ? "Sending..." : "Send Appeal Message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
