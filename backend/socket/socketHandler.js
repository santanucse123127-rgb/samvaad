import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const initializeSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Update user status and socket ID
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      socketId: socket.id,
      lastSeen: Date.now(),
    });

    // // Join user's personal room
    // socket.join(socket.userId);

    // Broadcast online status
    socket.broadcast.emit('user-online', {
  userId: socket.userId,
});


    // Handle typing event
    socket.on('typing', ({ conversationId }) => {
  socket.to(conversationId).emit('typing', {
    userId: socket.userId,
    conversationId,
  });
});


    // Handle stop typing event
    socket.on('stop-typing', ({ conversationId }) => {
  socket.to(conversationId).emit('stop-typing', {
    userId: socket.userId,
    conversationId,
  });
});


    // Handle join conversation
    socket.on('join-chat', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leave conversation
    socket.on('leave-chat', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle message status update
    // socket.on('message-delivered', async (data) => {
    //   socket.to(data.senderId).emit('message-status-update', {
    //     messageId: data.messageId,
    //     status: 'delivered',
    //   });
    // });

    // Handle video call signals
    socket.on('call-user', (data) => {
      io.to(data.userToCall).emit('incoming-call', {
        signal: data.signal,
        from: socket.userId,
        name: socket.user.name,
        avatar: socket.user.avatar,
      });
    });

    socket.on('answer-call', (data) => {
      io.to(data.to).emit('call-accepted', {
        signal: data.signal,
      });
    });

    socket.on('reject-call', (data) => {
      io.to(data.to).emit('call-rejected');
    });

    socket.on('end-call', (data) => {
      io.to(data.to).emit('call-ended');
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${socket.userId}`);

      // Update user status
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: Date.now(),
        socketId: '',
      });

      // Broadcast offline status
      socket.broadcast.emit('user-offline', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: Date.now(),
      });
    });
  });

  return io;
};