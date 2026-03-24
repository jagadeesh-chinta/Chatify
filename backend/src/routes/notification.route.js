import express from "express";
import {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadNotificationCount);
router.post("/", createNotification);
router.patch("/read-all", markAllNotificationsRead);

export default router;
