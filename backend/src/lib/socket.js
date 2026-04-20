import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";

const app = express();
const server = http.createServer(app);
const CLIENT_ORIGIN = ENV.CLIENT_URL || "https://chatify-web-alpha.vercel.app";

const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName, "- userId:", socket.user._id.toString());

  const userId = socket.user._id.toString();
  userSocketMap[userId] = socket.id;

  // Join user to a room named after their userId for direct messaging
  socket.join(userId);
  console.log("User", userId, "joined room", userId);

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ fromUserId, toUserId }) => {
    if (!fromUserId || !toUserId) return;
    if (fromUserId !== userId) return;
    io.to(toUserId).emit("user_typing", { fromUserId, toUserId });
  });

  socket.on("stop_typing", ({ fromUserId, toUserId }) => {
    if (!fromUserId || !toUserId) return;
    if (fromUserId !== userId) return;
    io.to(toUserId).emit("user_stop_typing", { fromUserId, toUserId });
  });

  socket.on("message_delivered", async ({ messageId, senderId, receiverId }) => {
    try {
      if (!messageId || !senderId || !receiverId) return;
      if (receiverId !== userId) return;

      const updated = await Message.findOneAndUpdate(
        {
          _id: messageId,
          senderId,
          receiverId,
          isDelivered: false,
          status: "sent",
        },
        {
          $set: {
            isDelivered: true,
          },
        },
        { new: true }
      );

      if (updated) {
        io.to(senderId).emit("message_delivered", {
          messageId,
          senderId,
          receiverId,
        });
      }
    } catch (error) {
      console.error("message_delivered handler error:", error.message);
    }
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
