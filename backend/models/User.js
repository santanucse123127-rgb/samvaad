import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: 'Hey there! I am using NEXUS',
    maxlength: 150,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  socketId: {
    type: String,
    default: '',
  },
  isTyping: {
    type: Map,
    of: Boolean,
    default: {},
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  mutedConversations: [{
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    mutedUntil: Date,
  }],
  settings: {
    readReceipts: {
      type: Boolean,
      default: true,
    },
    lastSeenVisibility: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone',
    },
    profilePhotoVisibility: {
      type: String,
      enum: ['everyone', 'contacts', 'nobody'],
      default: 'everyone',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
    publicKey: {
      type: String,
      default: "",
    },
    syncContactsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  contacts: [{
    name: String,
    email: String,
    tel: String,
  }],
  pushSubscriptions: [{
    endpoint: String,
    expirationTime: Number,
    keys: {
      p256dh: String,
      auth: String,
    },
  }],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last seen
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = Date.now();
  return this.save();
};

// Set online status
userSchema.methods.setOnline = function (socketId) {
  this.status = 'online';
  this.socketId = socketId;
  this.lastSeen = Date.now();
  return this.save();
};

// Set offline status
userSchema.methods.setOffline = function () {
  this.status = 'offline';
  this.socketId = '';
  this.lastSeen = Date.now();
  return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;