import express from 'express';
import { createServer } from 'http';
import { Server as socketIO } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import { dbConnect } from './config/db.js';
import { initializeSocket } from './socket/socketHandler.js';
import Message from './models/Message.js';
import Conversation from './models/Conversation.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import clipboardRoutes from './routes/clipboardRoutes.js';

dotenv.config();

/* ── Global error safety net ──────────────────────────────────
   MongoDB Atlas (and some TLS stacks on Windows) occasionally
   emits MongoNetworkError / ECONNRESET when an idle connection
   is dropped by the Atlas-side proxy. Mongoose automatically
   reconnects, so we just log and continue instead of crashing.
─────────────────────────────────────────────────────────── */
process.on('uncaughtException', (err) => {
  const isMongoNetwork =
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoServerSelectionError' ||
    err.code === 'ECONNRESET';

  if (isMongoNetwork) {
    console.warn('⚠️  MongoDB network error (auto-reconnect in progress):', err.message);
    return; // Do NOT exit — Mongoose will reconnect on its own
  }
  // For every other uncaught exception, log and exit so nodemon restarts
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const isMongoNetwork =
    reason instanceof Error &&
    (reason.name === 'MongoNetworkError' ||
      reason.name === 'MongoServerSelectionError' ||
      reason.code === 'ECONNRESET');

  if (isMongoNetwork) {
    console.warn('⚠️  Unhandled Mongo rejection (auto-reconnect in progress):', reason.message);
    return;
  }
  console.error('❌ Unhandled Rejection:', reason);
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
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,        // 60 seconds before timeout
  pingInterval: 25000,       // Send ping every 25 seconds
});

dbConnect();


// Middleware
app.use(helmet());
app.use(compression());
// app.use(cors({
//   origin: "http://localhost:8080",
//   credentials: true,
// }));

app.use(cors({
  origin: "*",
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Socket.io handlers
initializeSocket(io);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/clipboard', clipboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Samvad API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Scheduled Message Checker
const checkScheduledMessages = async (io) => {
  try {
    const now = new Date();
    const scheduledMessages = await Message.find({
      status: 'scheduled',
      isScheduled: true,
      scheduledAt: { $lte: now },
    }).populate('sender', 'name avatar status');

    for (const message of scheduledMessages) {
      // Update message status
      message.status = 'sent';
      message.isScheduled = false; // Mark as processed
      await message.save();

      // Update conversation
      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.lastMessage = message._id;
        conversation.updatedAt = Date.now();

        // Update unread counts
        conversation.participants.forEach((participantId) => {
          if (participantId.toString() !== message.sender._id.toString()) {
            const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
            conversation.unreadCount.set(participantId.toString(), currentCount + 1);
          }
        });
        await conversation.save();

        // Emit socket event
        if (io) {
          io.to(conversation._id.toString()).emit('message-received', message);
        }
      }
    }
  } catch (error) {
    console.error('Error checking scheduled messages:', error);
  }
};

// Run scheduler every minute
setInterval(() => checkScheduledMessages(io), 60000);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});