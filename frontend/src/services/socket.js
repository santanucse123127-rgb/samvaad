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
    const SOCKET_URL = 'http://localhost:5000';
    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join-chat', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leave-chat', conversationId);
    }
  }

  sendTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId });
    }
  }

  sendStopTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('stop-typing', { conversationId });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;