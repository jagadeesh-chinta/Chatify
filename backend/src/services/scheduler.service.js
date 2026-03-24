import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import DeletedChat from "../models/DeletedChat.js";

const SCHEDULER_INTERVAL = 10000; // Check every 10 seconds
const DELETED_CHAT_CLEANUP_INTERVAL = 60000; // Check every 60 seconds
const RESTORE_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Process all scheduled messages that are due to be sent
 */
const processScheduledMessages = async () => {
  try {
    const now = new Date();

    // Find all scheduled messages that are due
    const dueMessages = await Message.find({
      status: "scheduled",
      isScheduled: true,
      scheduledAt: { $lte: now },
    });

    if (dueMessages.length === 0) {
      return;
    }

    console.log(`[Scheduler] Processing ${dueMessages.length} scheduled message(s)`);

    for (const message of dueMessages) {
      try {
        // Update message status to sent
        message.status = "sent";
        message.isScheduled = false;
        await message.save();

        // Emit socket event to receiver
        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", message);
        }

        // Also emit to sender to update UI (mark as sent)
        const senderSocketId = getReceiverSocketId(message.senderId.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("scheduled_message_sent", message);
        }

        console.log(`[Scheduler] Sent scheduled message ${message._id} to ${message.receiverId}`);
      } catch (msgError) {
        console.error(`[Scheduler] Error processing message ${message._id}:`, msgError.message);
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error processing scheduled messages:", error.message);
  }
};

const processExpiredDeletedChats = async () => {
  try {
    const now = new Date();
    const legacyExpiryCutoff = new Date(Date.now() - RESTORE_WINDOW_MS);
    const expiredDeletedChats = await DeletedChat.find({
      $or: [
        { expiresAt: { $lte: now } },
        { expiresAt: { $exists: false }, createdAt: { $lte: legacyExpiryCutoff } },
      ],
    });

    if (expiredDeletedChats.length === 0) {
      return;
    }

    const pairKeySet = new Set();

    for (const item of expiredDeletedChats) {
      const [a, b] = [item.userId.toString(), item.deletedUserId.toString()].sort();
      pairKeySet.add(`${a}:${b}`);
    }

    for (const pairKey of pairKeySet) {
      const [userA, userB] = pairKey.split(":");

      await Message.deleteMany({
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      });

      await DeletedChat.deleteMany({
        $or: [
          { userId: userA, deletedUserId: userB },
          { userId: userB, deletedUserId: userA },
        ],
      });
    }

    console.log(`[Scheduler] Permanently deleted ${pairKeySet.size} expired chat conversation(s)`);
  } catch (error) {
    console.error("[Scheduler] Error processing expired deleted chats:", error.message);
  }
};

/**
 * Start the message scheduler
 */
export const startMessageScheduler = () => {
  console.log("[Scheduler] Starting message scheduler service...");
  
  // Process immediately on startup
  processScheduledMessages();
  processExpiredDeletedChats();
  
  // Then check every SCHEDULER_INTERVAL milliseconds
  setInterval(processScheduledMessages, SCHEDULER_INTERVAL);
  setInterval(processExpiredDeletedChats, DELETED_CHAT_CLEANUP_INTERVAL);
  
  console.log(`[Scheduler] Message scheduler running (interval: ${SCHEDULER_INTERVAL / 1000}s)`);
};

export default startMessageScheduler;
