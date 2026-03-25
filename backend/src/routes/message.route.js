import express from "express";
import { getAllContacts, getMessagesByUserId, sendMessage, getChatPartners, restoreChatHistory, deleteMessage, editMessage, getChatKeys, searchUsers, getUnreadCounts, markMessagesAsRead, uploadMediaFile } from "../controllers/message.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { uploadMedia, validateMediaFileSize } from "../middleware/upload.middleware.js";

const router = express.Router();
router.use(arcjetProtection,protectRoute); // Apply authentication middleware to all routes in this router

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/chatkeys", getChatKeys);
router.get("/search", searchUsers); // Search all users by username
router.get("/unread-counts", getUnreadCounts); // Get unread message counts
router.put("/read/:senderId", markMessagesAsRead); // Mark messages as read
router.post("/restore", restoreChatHistory); // Restore chat history with key validation
router.post("/upload", (req, res, next) => {
	uploadMedia.single("file")(req, res, (err) => {
		if (!err) return next();

		if (err.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({ message: "Audio/Document size must be less than 100MB" });
		}

		return res.status(400).json({ message: err.message || "Invalid file upload. Only MP4, MP3, and document files are allowed" });
	});
}, validateMediaFileSize, uploadMediaFile);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.delete("/:messageId", deleteMessage);
router.put("/:messageId", editMessage);


export default router;