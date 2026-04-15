import express from "express";
import { createServer } from "http";
import { Server as socketIO } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { dbConnect } from "./config/db.js";
import { initializeSocket } from "./socket/socketHandler.js";
import { initializeScheduler } from "./services/schedulerService.js";
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";
import Task from "./models/Task.js";
import { sendToUser } from "./utils/pushNotification.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import clipboardRoutes from "./routes/clipboardRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";

dotenv.config();

/* ── Global error safety net ──────────────────────────────────
   MongoDB Atlas (and some TLS stacks on Windows) occasionally
   emits MongoNetworkError / ECONNRESET when an idle connection
   is dropped by the Atlas-side proxy. Mongoose automatically
   reconnects, so we just log and continue instead of crashing.
─────────────────────────────────────────────────────────── */
process.on("uncaughtException", (err) => {
  const isMongoNetwork =
    err.name === "MongoNetworkError" ||
    err.name === "MongoServerSelectionError" ||
    err.code === "ECONNRESET";

  if (isMongoNetwork) {
    console.warn(
      "⚠️  MongoDB network error (auto-reconnect in progress):",
      err.message,
    );
    return; // Do NOT exit — Mongoose will reconnect on its own
  }
  // For every other uncaught exception, log and exit so nodemon restarts
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  const isMongoNetwork =
    reason instanceof Error &&
    (reason.name === "MongoNetworkError" ||
      reason.name === "MongoServerSelectionError" ||
      reason.code === "ECONNRESET");

  if (isMongoNetwork) {
    console.warn(
      "⚠️  Unhandled Mongo rejection (auto-reconnect in progress):",
      reason.message,
    );
    return;
  }
  console.error("❌ Unhandled Rejection:", reason);
});

const app = express();
const httpServer = createServer(app);

// Socket.io setup
// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.CLIENT_URL || "http://localhost:8080",
//     credentials: true,
//   },
// });

// const io = new Server(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });
const io = new socketIO(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000, // 60 seconds before timeout
  pingInterval: 25000, // Send ping every 25 seconds
});

dbConnect();

// Middleware
app.use(helmet());
app.use(compression());
// app.use(cors({
//   origin: "http://localhost:8080",
//   credentials: true,
// }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Socket.io and Scheduler
initializeSocket(io);
initializeScheduler(io);

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/clipboard", clipboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/status", statusRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Samvad API is running" });
});

// Serve frontend static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendBuildPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendBuildPath));

// SPA routing: Serve index.html for all non-API routes
// SPA routing: Serve index.html for all non-API routes
// Use a middleware that ignores API and socket routes to avoid path-to-regexp
// parsing issues on some platforms (e.g. Render) where '*' can cause errors.
app.use((req, res, next) => {
  // Allow API and socket endpoints to continue to their handlers
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/socket.io") ||
    req.path.startsWith("/socket")
  ) {
    return next();
  }

  // If the request matches a static file that exists, let express.static handle it
  // Otherwise, serve SPA index for client-side routing
  res.sendFile(path.join(frontendBuildPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

  } catch (error) {
    console.error("Error checking task reminders:", error);
  }
};

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});
