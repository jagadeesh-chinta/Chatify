import express from "express";
import { getChatKeyStatus, setChatKeyPassword, verifyChatKeyPassword, changeChatKeyPassword } from "../controllers/chatkey.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();
router.use(arcjetProtection, protectRoute);

// Get ChatKey password status
router.get("/status", getChatKeyStatus);

// Set ChatKey password (first time)
router.post("/set-password", setChatKeyPassword);

// Verify ChatKey password
router.post("/verify-password", verifyChatKeyPassword);

// Change ChatKey password
router.put("/change-password", changeChatKeyPassword);

export default router;
