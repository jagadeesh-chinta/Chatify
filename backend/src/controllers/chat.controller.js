import DeletedChat from "../models/DeletedChat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Friend from "../models/Friend.js";
import ChatKey from "../models/ChatKey.js";
import PDFDocument from "pdfkit";

/**
 * Soft delete a chat - adds to deleted chats list
 * Messages remain in database, only hidden from user's view
 */
export const softDeleteChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deletedUserId } = req.params;

    if (!deletedUserId) {
      return res.status(400).json({ message: "User ID to delete is required" });
    }

    // Check if users are friends
    const [user1, user2] = [userId.toString(), deletedUserId.toString()].sort();
    const areFriends = await Friend.exists({ user1, user2 });
    if (!areFriends) {
      return res.status(403).json({ message: "You can only delete chats with friends" });
    }

    // Add to deleted chats
    await DeletedChat.softDeleteChat(userId, deletedUserId);

    res.status(200).json({ message: "Chat deleted successfully", deletedUserId });
  } catch (error) {
    console.error("softDeleteChat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Restore a soft-deleted chat
 */
export const restoreDeletedChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { deletedUserId } = req.params;

    if (!deletedUserId) {
      return res.status(400).json({ message: "User ID to restore is required" });
    }

    const result = await DeletedChat.restoreChat(userId, deletedUserId);

    if (!result) {
      return res.status(404).json({ message: "Deleted chat not found" });
    }

    res.status(200).json({ message: "Chat restored successfully", deletedUserId });
  } catch (error) {
    console.error("restoreDeletedChat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get all deleted chats for the logged-in user
 */
export const getDeletedChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const deletedChats = await DeletedChat.getDeletedChatsForUser(userId);

    // Format response with user details
    const result = deletedChats.map((dc) => ({
      deletedUserId: dc.deletedUserId._id,
      fullName: dc.deletedUserId.fullName,
      profilePic: dc.deletedUserId.profilePic,
      deletedAt: dc.createdAt,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("getDeletedChats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get chat history with a specific user (for preview in RestoreChat)
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    // Get other user info
    const otherUser = await User.findById(otherUserId).select("fullName profilePic");

    res.status(200).json({
      messages,
      otherUser: otherUser || { fullName: "Unknown User", profilePic: null },
    });
  } catch (error) {
    console.error("getChatHistory error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Export chat history as PDF
 */
export const exportChatAsPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    if (!otherUserId) {
      return res.status(400).json({ message: "Other user ID is required" });
    }

    // Get logged-in user info
    const currentUser = await User.findById(userId).select("fullName");
    const otherUser = await User.findById(otherUserId).select("fullName");

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all messages
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found to export" });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="chat_${otherUser.fullName.replace(/\s+/g, "_")}_${Date.now()}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc
      .fontSize(20)
      .fillColor("#1e293b")
      .text("Chatify - Chat History", { align: "center" });

    doc.moveDown(0.5);

    // Chat participants
    doc
      .fontSize(12)
      .fillColor("#64748b")
      .text(`Chat between ${currentUser.fullName} and ${otherUser.fullName}`, { align: "center" });

    doc
      .fontSize(10)
      .text(`Exported on: ${new Date().toLocaleString()}`, { align: "center" });

    doc.moveDown(1);

    // Horizontal line
    doc
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    // Messages
    messages.forEach((msg) => {
      const senderName = msg.senderId.toString() === userId.toString() 
        ? currentUser.fullName 
        : otherUser.fullName;
      const isCurrentUser = msg.senderId.toString() === userId.toString();
      const timestamp = new Date(msg.createdAt).toLocaleString();

      // Sender name
      doc
        .fontSize(10)
        .fillColor(isCurrentUser ? "#0891b2" : "#7c3aed")
        .text(senderName, { continued: true })
        .fillColor("#94a3b8")
        .text(`  ${timestamp}`);

      // Message content
      if (msg.text) {
        doc
          .fontSize(11)
          .fillColor("#1e293b")
          .text(msg.text, { indent: 10 });
      }

      if (msg.image) {
        doc
          .fontSize(10)
          .fillColor("#64748b")
          .text("[Image Attachment]", { indent: 10 });
      }

      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .text("Generated by Chatify - BB84 Quantum Key Distribution Simulation", { align: "center" });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("exportChatAsPDF error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Verify the shared chat key for a deleted chat
 * User must enter the correct shared key to access restore/view/export options
 */
export const verifyChatKey = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    const { enteredKey } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!enteredKey) {
      return res.status(400).json({ message: "Chat key is required" });
    }

    // Find the shared key between the two users
    const chatKeyDoc = await ChatKey.findKeyByUserPair(userId, otherUserId);

    if (!chatKeyDoc) {
      return res.status(404).json({ message: "No shared key found for this chat" });
    }

    // Compare the entered key with the stored shared key
    const isMatch = enteredKey.toLowerCase() === chatKeyDoc.sharedKey.toLowerCase();

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid chat key", verified: false });
    }

    res.status(200).json({ message: "Chat key verified", verified: true });
  } catch (error) {
    console.error("verifyChatKey error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
