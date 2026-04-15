import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    // Maps event → [ {original, wrapper} ] so off() can find the wrapper to remove
    this._listeners = new Map();
    this._onConnectCallbacks = [];
    this._onDisconnectCallbacks = [];
  }

  get isConnected() {
    return this.socket?.connected === true;
  }

  onConnect(cb) {
    this._onConnectCallbacks.push(cb);
  }

  onDisconnect(cb) {
    this._onDisconnectCallbacks.push(cb);
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }

    const isDev = import.meta.env.DEV;
    const socketUrl = import.meta.env.VITE_SOCKET_URL ||
      (isDev ? 'http://localhost:5000' : window.location.origin);
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this._onConnectCallbacks.forEach(cb => cb());
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
      this._onDisconnectCallbacks.forEach(cb => cb(reason));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this._listeners.clear();
    this._onConnectCallbacks = [];
    this._onDisconnectCallbacks = [];
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`⚠️ Socket not connected — cannot emit: ${event}`);
    }
  }

  /**
   * Register a listener. Internally wraps it so we can log, but also
   * stores the wrapper so off(event, originalCallback) can remove it.
   */
  on(event, callback) {
    if (!this.socket) {
      console.warn(`⚠️ Socket not connected — cannot listen to: ${event}`);
      return;
    }

    const wrapper = (data) => callback(data);

    // Track it so off() can look it up
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push({ original: callback, wrapper });

    this.socket.on(event, wrapper);
  }

  /**
   * Remove a specific listener by its original callback reference.
   * If no callback given, removes ALL listeners for the event.
   */
  off(event, callback) {
    if (!this.socket) return;

    if (!callback) {
      // Remove all listeners for this event
      this.socket.off(event);
      this._listeners.delete(event);
      return;
    }

    const list = this._listeners.get(event);
    if (!list) return;

    const idx = list.findIndex(e => e.original === callback);
    if (idx !== -1) {
      const { wrapper } = list[idx];
      this.socket.off(event, wrapper);
      list.splice(idx, 1);
      if (list.length === 0) this._listeners.delete(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    this._listeners.clear();
  }

  joinConversation(conversationId) {
    this.emit('join-conversation', conversationId);
  }

  leaveConversation(conversationId) {
    this.emit('leave-conversation', conversationId);
  }

  sendTyping(conversationId) {
    this.emit('typing', { conversationId });
  }

  sendStopTyping(conversationId) {
    this.emit('stop-typing', { conversationId });
  }
}

const socketService = new SocketService();
export default socketService;