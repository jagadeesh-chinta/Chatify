import express from "express";
import { submitFeedback } from "../controllers/feedback.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, submitFeedback);

export default router;
