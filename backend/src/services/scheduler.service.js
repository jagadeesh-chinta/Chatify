import Message from "../models/Message.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const SCHEDULER_INTERVAL = 10000; // Check every 10 seconds

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

/**
 * Start the message scheduler
 */
export const startMessageScheduler = () => {
  console.log("[Scheduler] Starting message scheduler service...");
  
  // Process immediately on startup
  processScheduledMessages();
  
  // Then check every SCHEDULER_INTERVAL milliseconds
  setInterval(processScheduledMessages, SCHEDULER_INTERVAL);
  
  console.log(`[Scheduler] Message scheduler running (interval: ${SCHEDULER_INTERVAL / 1000}s)`);
};

export default startMessageScheduler;
