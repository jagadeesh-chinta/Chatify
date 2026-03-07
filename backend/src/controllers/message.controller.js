import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import Friend from "../models/Friend.js";
import User from "../models/User.js";
import ChatKey from "../models/ChatKey.js";
import DeletedChat from "../models/DeletedChat.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(200).json([]);
    }

    // Case-insensitive search by fullName
    const users = await User.find({
      _id: { $ne: loggedInUserId },
      fullName: { $regex: query.trim(), $options: "i" },
    })
      .select("-password")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    // Check if this chat is soft-deleted by the logged-in user
    const isChatDeleted = await DeletedChat.isChatDeleted(myId, userToChatId);

    if (isChatDeleted) {
      // Return empty array with deleted flag - messages remain in DB but are hidden
      return res.status(200).json({ messages: [], isDeleted: true });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      // Only show sent messages OR scheduled messages by the current user
      $and: [
        {
          $or: [
            { status: "sent" },
            { status: "scheduled", senderId: myId },
          ],
        },
      ],
    });

    res.status(200).json({ messages, isDeleted: false });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, scheduledAt } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    // Check friendship before allowing message
    const [a, b] = [senderId.toString(), receiverId.toString()].sort();
    const areFriends = await Friend.exists({ user1: a, user2: b });
    if (!areFriends) {
      return res.status(403).json({ message: "You must be friends to chat" });
    }

    // Validate scheduled time if provided
    let isScheduled = false;
    let status = "sent";
    let parsedScheduledAt = null;

    if (scheduledAt) {
      parsedScheduledAt = new Date(scheduledAt);
      const now = new Date();
      
      if (isNaN(parsedScheduledAt.getTime())) {
        return res.status(400).json({ message: "Invalid scheduled time format." });
      }
      
      if (parsedScheduledAt <= now) {
        return res.status(400).json({ message: "Scheduled time must be in the future." });
      }
      
      isScheduled = true;
      status = "scheduled";
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      scheduledAt: parsedScheduledAt,
      isScheduled,
      status,
    });

    await newMessage.save();

    // Only emit socket for instant messages, not scheduled ones
    if (!isScheduled) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Restore Chat History - Validate shared key and return chat messages
 * 
 * Request body:
 * - otherUserId: ObjectId - The other user in the chat
 * - sharedKey: String - The BB84-generated shared key to validate
 * 
 * Returns:
 * - If key valid: Array of Message objects between the two users
 * - If key invalid: Error "Invalid Shared Key"
 */
export const restoreChatHistory = async (req, res) => {
  try {
    const myId = req.user._id;
    const { otherUserId, sharedKey } = req.body;

    // Validate input
    if (!otherUserId || !sharedKey) {
      return res.status(400).json({ message: "User ID and shared key are required" });
    }

    // Validate users are different
    if (myId.equals(otherUserId)) {
      return res.status(400).json({ message: "Cannot restore chat with yourself" });
    }

    // Verify other user exists
    const otherUserExists = await User.exists({ _id: otherUserId });
    if (!otherUserExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if users are friends
    const [user1, user2] = [myId.toString(), otherUserId.toString()].sort();
    const areFriends = await Friend.exists({ user1, user2 });
    if (!areFriends) {
      return res.status(403).json({ message: "You must be friends to restore chat history" });
    }

    // Find the ChatKey between these users
    const chatKey = await ChatKey.findKeyByUserPair(myId, otherUserId);
    
    if (!chatKey) {
      return res.status(404).json({ message: "No shared key found. Generate one by accepting friend request." });
    }

    // Validate the provided key matches the stored key
    if (chatKey.sharedKey !== sharedKey) {
      console.warn(`Restore Chat: Invalid key attempt for user pair ${user1}, ${user2}`);
      return res.status(401).json({ message: "Invalid Shared Key" });
    }

    // Key is valid - fetch the chat history
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by oldest first

    console.log(`Restore Chat: Successfully restored ${messages.length} messages for user pair`);

    res.status(200).json({
      success: true,
      messages,
      otherUser: {
        _id: otherUserId,
        fullName: (await User.findById(otherUserId).select("fullName")).fullName,
      },
      keyValidated: true,
    });
  } catch (error) {
    console.error("Error in restoreChatHistory controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const receiverId = message.receiverId.toString();
    await Message.findByIdAndDelete(messageId);

    // Notify both users via socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_deleted", { messageId });
    }

    res.status(200).json({ messageId });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text content is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text.trim();
    message.edited = true;
    await message.save();

    const receiverId = message.receiverId.toString();
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_edited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in editMessage controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatKeys = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Find all chat keys where the user is either user1 or user2
    const chatKeys = await ChatKey.find({
      $or: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    });

    // Get the friend IDs and map them to user info
    const friendIds = chatKeys.map(key => 
      key.user1Id.toString() === userId ? key.user2Id : key.user1Id
    );

    const friends = await User.find({ _id: { $in: friendIds } }).select("fullName profilePic");

    // Build result with friend info and shared key
    const result = chatKeys.map(key => {
      const friendId = key.user1Id.toString() === userId ? key.user2Id.toString() : key.user1Id.toString();
      const friend = friends.find(f => f._id.toString() === friendId);

      return {
        friendId,
        friendName: friend?.fullName || "Unknown",
        friendProfilePic: friend?.profilePic || null,
        sharedKey: key.sharedKey,
        createdAt: key.createdAt,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getChatKeys controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get Unread Message Counts - Returns unread message counts grouped by sender
 * Used for displaying notification badges in Contacts/Favourites lists
 */
export const getUnreadCounts = async (req, res) => {
  try {
    const myId = req.user._id;

    // Aggregate unread messages grouped by sender
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: myId,
          isRead: false,
          status: "sent", // Only count sent messages, not scheduled ones
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
          lastMessage: { $last: "$text" },
          lastMessageTime: { $last: "$createdAt" },
        },
      },
    ]);

    // Transform to a more usable format
    const result = unreadCounts.map((item) => ({
      senderId: item._id.toString(),
      unreadCount: item.count,
      lastMessage: item.lastMessage || "(Image)",
      lastMessageTime: item.lastMessageTime,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getUnreadCounts controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Mark Messages as Read - Updates all messages from a sender to isRead = true
 * Called when receiver opens a chat with that sender
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { senderId } = req.params;

    if (!senderId) {
      return res.status(400).json({ message: "Sender ID is required" });
    }

    // Update all unread messages from this sender to this receiver
    const result = await Message.updateMany(
      {
        senderId: senderId,
        receiverId: myId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    // Notify the sender that their messages have been read (optional)
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messages_read", {
        readBy: myId.toString(),
        count: result.modifiedCount,
      });
    }

    res.status(200).json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
