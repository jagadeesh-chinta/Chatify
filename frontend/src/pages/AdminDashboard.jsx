import { useEffect, useState, useMemo } from "react";
import { useAdminStore } from "../store/useAdminStore";
import { Users, MessageSquare, LogOut, Loader2, RefreshCw, Ban, Clock, X, ShieldAlert, ChevronRight, CheckCircle, Mail, Phone, Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
    const { admin, logoutAdmin, adminStats, adminUsers, adminFeedbacks, fetchAdminStats, isFetchingAdminStats, banUser, unbanUser } = useAdminStore();
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeTab, setActiveTab] = useState("users"); // "users", "feedbacks", "banned"
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = useMemo(() => {
        if (!adminUsers) return [];
        return adminUsers.filter(user => 
            !user.isBanned &&
            ((user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [adminUsers, searchQuery]);

    const filteredBannedUsers = useMemo(() => {
        if (!adminUsers) return [];
        return adminUsers.filter(user => 
            user.isBanned &&
            ((user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [adminUsers, searchQuery]);

    const filteredFeedbacks = useMemo(() => {
        if (!Array.isArray(adminFeedbacks)) return [];
        return adminFeedbacks.filter(fb => {
            const name = fb?.userId?.fullName || "";
            const email = fb?.userId?.email || "";
            const msg = fb?.message || "";
            const q = searchQuery.toLowerCase();
            return name.toLowerCase().includes(q) || 
                   email.toLowerCase().includes(q) || 
                   msg.toLowerCase().includes(q);
        });
    }, [adminFeedbacks, searchQuery]);

    useEffect(() => {
        if (!admin) {
            navigate("/admin");
        } else {
            fetchAdminStats();
        }
    }, [admin, navigate, fetchAdminStats]);

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 relative overflow-x-hidden">
             {/* DECORATORS */}
             <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="pointer-events-none absolute top-0 -left-4 size-96 bg-purple-500 opacity-10 blur-[100px]" />

            {/* NAVBAR */}
            <nav className="relative z-10 bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white">
                                <Users size={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">Admin Dashboard</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400 hidden sm:block">{admin.email}</span>
                            <button
                                onClick={logoutAdmin}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-lg transition-all border border-slate-600/50 hover:border-red-500/50"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold text-white">Overview</h1>
                    <button 
                        onClick={fetchAdminStats}
                        disabled={isFetchingAdminStats}
                        className="p-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={`${isFetchingAdminStats ? 'animate-spin' : ''} text-purple-400`} />
                    </button>
                </div>

                {isFetchingAdminStats && !adminStats ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="animate-spin text-purple-500" size={32} />
                    </div>
                ) : (
                    <>
                        {/* STATS CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex items-center gap-6 shadow-lg">
                                <div className="bg-purple-500/20 text-purple-400 p-4 rounded-xl">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Users</p>
                                    <p className="text-3xl font-bold text-white mt-1">{adminStats?.totalUsers || 0}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 flex items-center gap-6 shadow-lg">
                                <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-xl">
                                    <MessageSquare size={32} />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-medium">Total Messages</p>
                                    <p className="text-3xl font-bold text-white mt-1">{adminStats?.totalMessages || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* TABS & SEARCH */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-700/50 pb-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "users" ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                    }`}
                                >
                                    Registered Users
                                </button>
                                <button
                                    onClick={() => setActiveTab("banned")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "banned" ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                    }`}
                                >
                                    Banned Accounts
                                </button>
                                <button
                                    onClick={() => setActiveTab("feedbacks")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        activeTab === "feedbacks" ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                    }`}
                                >
                                    User Feedback
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={activeTab === "users" ? "Search users..." : "Search feedback..."}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {activeTab === "users" && (
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60">
                                    <h2 className="text-lg font-semibold text-white">Registered Users</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-800/30 text-slate-400 text-sm">
                                                <th className="px-6 py-4 font-medium">User</th>
                                                <th className="px-6 py-4 font-medium">Email</th>
                                                <th className="px-6 py-4 font-medium">Phone</th>
                                                <th className="px-6 py-4 font-medium">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                                                        {searchQuery ? "No users found matching your search." : "No users found."}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <tr 
                                                        key={user._id} 
                                                        onClick={() => setSelectedUser(user)}
                                                        className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                                                    {user.profilePic ? (
                                                                        <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-slate-600 text-slate-300 font-medium">
                                                                            {user.fullName.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium text-slate-200">{user.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                                        <td className="px-6 py-4 text-slate-400">{user.phoneNumber}</td>
                                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                                                <ChevronRight size={16} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "banned" && (
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/60">
                                    <h2 className="text-lg font-semibold text-white text-red-400 flex items-center gap-2"><Ban size={20} /> Banned Accounts</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-800/30 text-slate-400 text-sm">
                                                <th className="px-6 py-4 font-medium">User</th>
                                                <th className="px-6 py-4 font-medium">Email</th>
                                                <th className="px-6 py-4 font-medium">Appeal Msg</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {filteredBannedUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                                                        {searchQuery ? "No banned users found matching search." : "No banned accounts."}
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredBannedUsers.map((user) => (
                                                    <tr 
                                                        key={user._id} 
                                                        onClick={() => setSelectedUser(user)}
                                                        className="hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
                                                                    {user.profilePic ? (
                                                                        <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-slate-600 text-slate-300 font-medium">
                                                                            {user.fullName.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="font-medium text-slate-200">{user.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                                        <td className="px-6 py-4 text-slate-400 text-sm truncate max-w-xs">
                                                            {user.banAppeal ? <span className="text-orange-400 italic">"{user.banAppeal}"</span> : <span className="text-slate-500">No appeal</span>}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "feedbacks" && (
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-white mb-6">User Feedback</h2>
                                <div className="space-y-4">
                                    {filteredFeedbacks.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400">
                                            {searchQuery ? "No feedback found matching your search." : "No feedback received yet."}
                                        </div>
                                    ) : (
                                        filteredFeedbacks.map((fb, index) => {
                                            if (!fb) return null;
                                            const userId = fb.userId || {};
                                            const fullName = userId.fullName || 'Unknown User';
                                            const email = userId.email || '';
                                            const profilePic = userId.profilePic;
                                            const initial = fullName.charAt(0).toUpperCase();

                                            return (
                                                <div key={fb._id || index} className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                                                {profilePic ? (
                                                                    <img src={profilePic} alt={fullName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-slate-600 text-slate-300 font-medium text-xs">
                                                                        {initial}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-200 font-medium text-sm">{fullName}</p>
                                                                <p className="text-slate-500 text-xs">{email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                                                            <Clock size={12} />
                                                            {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : 'Unknown date'}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-300 text-sm bg-slate-800/50 p-3 rounded-lg whitespace-pre-wrap">
                                                        {fb.message || 'No message provided.'}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* SIDE PANEL FOR USER DETAILS */}
            {selectedUser && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setSelectedUser(null)}
                    />
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-800 shadow-2xl z-50 border-l border-slate-700 transform transition-transform duration-300 flex flex-col">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-md">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ShieldAlert size={20} className="text-purple-400" />
                                User Management
                            </h2>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden shadow-lg border-4 border-slate-600 mb-4 relative">
                                    {selectedUser.profilePic ? (
                                        <img src={selectedUser.profilePic} alt={selectedUser.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-600 text-slate-300 text-3xl font-bold">
                                            {selectedUser.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {selectedUser.isBanned && (
                                        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                            <Ban className="text-red-500 drop-shadow-md" size={32} />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white">{selectedUser.fullName}</h3>
                                {selectedUser.isBanned ? (
                                    <div className="flex items-center gap-1 mt-1 text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-medium border border-red-400/20">
                                        <Ban size={12} />
                                        Banned Account
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 mt-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-medium border border-emerald-400/20">
                                        <CheckCircle size={12} />
                                        Active Status
                                    </div>
                                )}
                            </div>

                            {selectedUser.isBanned && selectedUser.banAppeal && (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                                    <h4 className="text-orange-400 text-sm font-semibold flex items-center gap-2 mb-2">
                                        <MessageSquare size={16} />
                                        Appeal Message from User
                                    </h4>
                                    <p className="text-slate-300 text-sm italic bg-slate-900/50 p-3 rounded-lg">
                                        "{selectedUser.banAppeal}"
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4 mb-8">
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm">
                                        <Mail size={16} />
                                        <span>Email Address</span>
                                    </div>
                                    <p className="text-slate-200 font-medium pl-7">{selectedUser.email}</p>
                                </div>
                                
                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm">
                                        <Phone size={16} />
                                        <span>Phone Number</span>
                                    </div>
                                    <p className="text-slate-200 font-medium pl-7">{selectedUser.phoneNumber}</p>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                                    <div className="flex items-center gap-3 text-slate-400 mb-1 text-sm">
                                        <Calendar size={16} />
                                        <span>Joined Date</span>
                                    </div>
                                    <p className="text-slate-200 font-medium pl-7">{new Date(selectedUser.createdAt).toLocaleDateString()} at {new Date(selectedUser.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Admin Actions</h4>
                                
                                {selectedUser.isBanned ? (
                                    <button 
                                        onClick={() => {
                                            unbanUser(selectedUser._id);
                                            setSelectedUser(null);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all font-medium"
                                    >
                                        <CheckCircle size={18} />
                                        Unban Account
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            banUser(selectedUser._id);
                                            setSelectedUser(null);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all font-medium"
                                    >
                                        <Ban size={18} />
                                        Ban Account Permanently
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
