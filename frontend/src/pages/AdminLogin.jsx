import { useState, useEffect } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { Mail, Lock, Loader2, UserPlus, LogIn, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function AdminLogin() {
    const [isSetup, setIsSetup] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loginAdmin, setupAdmin, isLoggingInAdmin, admin } = useAdminStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (admin) {
            navigate("/admin/dashboard");
        }
    }, [admin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Email and password are required");
            return;
        }

        if (isSetup) {
            await setupAdmin({ email, password });
            setIsSetup(false);
            setPassword("");
        } else {
            await loginAdmin({ email, password });
        }
    };

    return (
        <div className="flex h-screen items-center justify-center relative overflow-hidden bg-slate-900">
             {/* DECORATORS */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="pointer-events-none absolute top-0 -left-4 size-96 bg-purple-500 opacity-20 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 -right-4 size-96 bg-indigo-500 opacity-20 blur-[100px]" />

            <div className="relative z-10 w-full max-w-md p-8 bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 text-purple-400 rounded-2xl mb-4">
                        <LayoutDashboard size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        {isSetup ? "Setup your first admin account" : "Sign in to manage Chatify"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-slate-500"
                                placeholder="Admin Email"
                                required
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-slate-500"
                                placeholder="Password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoggingInAdmin}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoggingInAdmin ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : isSetup ? (
                            <>
                                <UserPlus size={20} className="mr-2" />
                                Setup Admin
                            </>
                        ) : (
                            <>
                                <LogIn size={20} className="mr-2" />
                                Login
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSetup(!isSetup)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        {isSetup ? "Already have an admin account? Login" : "Need to setup the first admin? Setup"}
                    </button>
                </div>
            </div>
        </div>
    );
}
