import express from "express";
import path from "path";
import cors from "cors";
import { ENV } from "./lib/env.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import chatkeyRoutes from "./routes/chatkey.route.js";
import chatRoutes from "./routes/chat.route.js";
import userRoutes from "./routes/user.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import { startMessageScheduler } from "./services/scheduler.service.js";

const __dirname = path.resolve();

const PORT = process.env.PORT || ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

/* ---------------- API ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chatkey", chatkeyRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

/* compatibility: expose friend endpoints at top-level /api/* paths */
app.use("/api", friendRoutes);

/* ---------------- SERVE FRONTEND ---------------- */

if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

/* ---------------- START SERVER ---------------- */

server.listen(PORT, () => {
  console.log("server running on port:", PORT);
  connectDB();
  startMessageScheduler();
});