import express from 'express';
import { createServer } from 'http';
import { Server as socketIO } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/db.js';
import { initializeSocket } from './socket/socketHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

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

// Connect to MongoDB
connectDB();

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

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});