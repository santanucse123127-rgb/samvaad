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
    unique: true,
    sparse: true,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  password: {
    type: String,
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
    theme: {
      type: String,
      default: 'dark',
    },
    darkMode: {
      type: Boolean,
      default: true,
    },
    wallpaper: {
      type: String,
      default: 'default',
    },
    fontSize: {
      type: String,
      default: 'medium',
    },
    notificationTones: {
      type: Boolean,
      default: true,
    },
    highPriority: {
      type: Boolean,
      default: true,
    },
    reactionNotifications: {
      type: Boolean,
      default: true,
    },
    groupNotifications: {
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
  birthday: {
    type: Date,
  },
  linkedDevices: [{
    deviceName: String,
    deviceType: String, // 'Web', 'Desktop', 'Mobile'
    lastActive: { type: Date, default: Date.now },
    browser: String,
    os: String,
    ip: String,
    linkedAt: { type: Date, default: Date.now }
  }],
  appLock: {
    enabled: {
      type: Boolean,
      default: false,
    },
    pin: {
      type: String,
    },
    biometricEnabled: {
      type: Boolean,
      default: false,
    }
  }
}, {
  timestamps: true,
});

// Hash password or PIN before saving
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('appLock.pin')) {
    const salt = await bcrypt.genSalt(10);
    this.appLock.pin = await bcrypt.hash(this.appLock.pin, salt);
  }
});

// Compare password
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare PIN
userSchema.methods.matchPin = async function (candidatePin) {
  if (!this.appLock.pin) return false;
  return await bcrypt.compare(candidatePin, this.appLock.pin);
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