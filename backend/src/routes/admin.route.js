import express from "express";
import { setupAdmin, loginAdmin, logoutAdmin, checkAdminAuth, getAdminStats, getAllUsers, getFeedbacks, banUser, unbanUser } from "../controllers/admin.controller.js";
import { protectAdminRoute } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/setup", setupAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

router.get("/check", protectAdminRoute, checkAdminAuth);
router.get("/stats", protectAdminRoute, getAdminStats);
router.get("/users", protectAdminRoute, getAllUsers);
router.post("/users/:id/ban", protectAdminRoute, banUser);
router.post("/users/:id/unban", protectAdminRoute, unbanUser);
router.get("/feedbacks", protectAdminRoute, getFeedbacks);

export default router;
