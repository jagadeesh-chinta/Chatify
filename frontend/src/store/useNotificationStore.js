import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/notifications");
      set({ notifications: res.data || [] });
    } catch (error) {
      console.log("fetchNotifications error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread-count");
      set({ unreadCount: res.data?.unreadCount || 0 });
    } catch (error) {
      console.log("fetchUnreadCount error:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axiosInstance.patch("/notifications/read-all");
      set((state) => ({
        unreadCount: 0,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (error) {
      console.log("markAllAsRead error:", error);
    }
  },

  subscribeToNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("new_notification");
    socket.on("new_notification", () => {
      get().fetchUnreadCount();
    });
  },

  unsubscribeFromNotifications: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("new_notification");
  },
}));
