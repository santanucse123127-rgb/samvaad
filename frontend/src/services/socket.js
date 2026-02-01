import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// class SocketService {
//   constructor() {
//     this.socket = null;
//   }

//   connect(token) {
//     this.socket = io(SOCKET_URL, {
//       auth: {
//         token: token,
//       },
//     });

//     this.socket.on('connect', () => {
//       console.log('✅ Socket connected');
//     });

//     this.socket.on('disconnect', () => {
//       console.log('❌ Socket disconnected');
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//     });
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   // Join conversation room
//   joinConversation(conversationId) {
//     if (this.socket) {
//       this.socket.emit('join-conversation', conversationId);
//     }
//   }

//   // Leave conversation room
//   leaveConversation(conversationId) {
//     if (this.socket) {
//       this.socket.emit('leave-conversation', conversationId);
//     }
//   }

//   // Send typing indicator
//   sendTyping(conversationId) {
//     if (this.socket) {
//       this.socket.emit('typing', { conversationId });
//     }
//   }

//   // Send stop typing indicator
//   sendStopTyping(conversationId) {
//     if (this.socket) {
//       this.socket.emit('stop-typing', { conversationId });
//     }
//   }

//   // Listen for new messages
//   onNewMessage(callback) {
//     if (this.socket) {
//       this.socket.on('new-message', callback);
//     }
//   }

//   // Listen for typing
//   onUserTyping(callback) {
//     if (this.socket) {
//       this.socket.on('user-typing', callback);
//     }
//   }

//   // Listen for stop typing
//   onUserStopTyping(callback) {
//     if (this.socket) {
//       this.socket.on('user-stop-typing', callback);
//     }
//   }

//   // Listen for user online status
//   onUserOnline(callback) {
//     if (this.socket) {
//       this.socket.on('user-online', callback);
//     }
//   }

//   // Listen for user offline status
//   onUserOffline(callback) {
//     if (this.socket) {
//       this.socket.on('user-offline', callback);
//     }
//   }

//   // Listen for message read status
//   onMessageRead(callback) {
//     if (this.socket) {
//       this.socket.on('message-read', callback);
//     }
//   }

//   // Listen for message deleted
//   onMessageDeleted(callback) {
//     if (this.socket) {
//       this.socket.on('message-deleted', callback);
//     }
//   }

//   // Remove all listeners
//   removeAllListeners() {
//     if (this.socket) {
//       this.socket.removeAllListeners();
//     }
//   }
// }

// const socketService = new SocketService();

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    console.log('🔌 Attempting to connect socket with token:', token ? 'Token exists' : 'No token');
    
    this.socket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket');
      this.socket.disconnect();
    }
  }

  emit(event, data) {
    if (this.socket) {
      console.log(`📤 Emitting event: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      console.error('❌ Socket not connected, cannot emit:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      console.log(`👂 Listening for event: ${event}`);
      this.socket.on(event, (data) => {
        console.log(`📥 Received event: ${event}`, data);
        callback(data);
      });
    } else {
      console.error('❌ Socket not connected, cannot listen to:', event);
    }
  }

  off(event) {
    if (this.socket) {
      console.log(`🔇 Removing listener for: ${event}`);
      this.socket.off(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      console.log('🔇 Removing all listeners');
      this.socket.removeAllListeners();
    }
  }

  joinConversation(conversationId) {
    console.log('📍 Joining conversation room:', conversationId);
    this.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId) {
    console.log('📍 Leaving conversation room:', conversationId);
    this.emit('leave-conversation', conversationId);
  }

  sendTyping(conversationId) {
    console.log('⌨️ Sending typing indicator for:', conversationId);
    this.emit('typing', { conversationId });
  }

  sendStopTyping(conversationId) {
    console.log('⌨️ Stopping typing indicator for:', conversationId);
    this.emit('stop-typing', { conversationId });
  }
}

const socketService = new SocketService();
export default socketService;