import express from "express";
import { softDeleteChat, restoreDeletedChat, getDeletedChats, getChatHistory, exportChatAsPDF, verifyChatKey } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();
router.use(arcjetProtection, protectRoute);

// Get all deleted chats for logged-in user
router.get("/deleted", getDeletedChats);

// Soft delete a chat (add to deleted list)
router.post("/delete/:deletedUserId", softDeleteChat);

// Restore a soft-deleted chat
router.post("/restore/:deletedUserId", restoreDeletedChat);

// Verify chat key before accessing deleted chat options
router.post("/verify-key/:otherUserId", verifyChatKey);

// Get chat history with a user (for preview)
router.get("/history/:otherUserId", getChatHistory);

// Export chat as PDF
router.get("/export/:otherUserId", exportChatAsPDF);

export default router;
