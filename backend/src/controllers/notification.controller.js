import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { io } from "../lib/socket.js";

const typeToMessage = {
  friend_request: (name) => `${name} sent you a friend request`,
  friend_accept: (name) => `${name} accepted your friend request`,
  friend_reject: (name) => `${name} rejected your friend request`,
  screenshot_attempt: (name) => `${name} attempted to take a screenshot`,
  screenshot_taken: (name) => `${name} took a screenshot of chat`,
};

const buildMessage = (type, senderName) => {
  const formatter = typeToMessage[type];
  if (!formatter) return `${senderName} sent you a notification`;
  return formatter(senderName);
};

export const createAndSendNotification = async ({ receiverId, senderId, type }) => {
  if (!receiverId || !senderId || !type) return null;

  const sender = await User.findById(senderId).select("fullName");
  if (!sender) return null;

  const message = buildMessage(type, sender.fullName);

  const notification = await Notification.create({
    userId: receiverId,
    senderId,
    type,
    message,
  });

  io.to(receiverId.toString()).emit("new_notification", {
    _id: notification._id,
    message: notification.message,
    type: notification.type,
    senderId: senderId.toString(),
    createdAt: notification.createdAt,
  });

  return notification;
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { receiverId, type } = req.body;

    if (!receiverId || !type) {
      return res.status(400).json({ message: "receiverId and type are required" });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot notify yourself" });
    }

    const notification = await createAndSendNotification({
      receiverId,
      senderId: req.user._id,
      type,
    });

    if (!notification) {
      return res.status(400).json({ message: "Failed to create notification" });
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error("createNotification error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
