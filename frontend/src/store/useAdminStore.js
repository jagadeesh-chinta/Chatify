import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAdminStore = create((set) => ({
    admin: null,
    isCheckingAdminAuth: true,
    isLoggingInAdmin: false,
    adminStats: null,
    adminUsers: [],
    adminFeedbacks: [],
    isFetchingAdminStats: false,

    checkAdminAuth: async () => {
        try {
            const res = await axiosInstance.get("/admin/check");
            set({ admin: res.data });
        } catch (error) {
            console.log("Error in checkAdminAuth:", error);
            set({ admin: null });
        } finally {
            set({ isCheckingAdminAuth: false });
        }
    },

    loginAdmin: async (data) => {
        set({ isLoggingInAdmin: true });
        try {
            const res = await axiosInstance.post("/admin/login", data);
            set({ admin: res.data });
            toast.success("Admin logged in successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingInAdmin: false });
        }
    },

    logoutAdmin: async () => {
        try {
            await axiosInstance.post("/admin/logout");
            set({ admin: null });
            toast.success("Admin logged out successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }
    },

    fetchAdminStats: async () => {
        set({ isFetchingAdminStats: true });
        try {
            const [statsRes, usersRes, feedbacksRes] = await Promise.all([
                axiosInstance.get("/admin/stats"),
                axiosInstance.get("/admin/users"),
                axiosInstance.get("/admin/feedbacks")
            ]);
            set({ 
                adminStats: statsRes.data, 
                adminUsers: usersRes.data,
                adminFeedbacks: feedbacksRes.data 
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch stats");
        } finally {
            set({ isFetchingAdminStats: false });
        }
    },

    banUser: async (userId) => {
        try {
            await axiosInstance.post(`/admin/users/${userId}/ban`);
            toast.success("User banned successfully");
            useAdminStore.getState().fetchAdminStats(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to ban user");
        }
    },

    unbanUser: async (userId) => {
        try {
            await axiosInstance.post(`/admin/users/${userId}/unban`);
            toast.success("User unbanned successfully");
            useAdminStore.getState().fetchAdminStats(); // Refresh list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to unban user");
        }
    },

    setupAdmin: async (data) => {
        try {
            await axiosInstance.post("/admin/setup", data);
            toast.success("Admin setup successfully! You can now log in.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Admin setup failed");
        }
    }
}));
