import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'file', 'audio', 'voice', 'poll', 'code'],
    default: 'text',
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
  },
  fileName: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  duration: {
    type: Number, // for audio/video in seconds
  },
  thumbnail: {
    type: String, // for videos
  },
  // Poll fields
  pollQuestion: {
    type: String,
  },
  pollOptions: [{
    text: String,
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],
  allowMultipleAnswers: {
    type: Boolean,
    default: false,
  },
  // Scheduled message fields
  scheduledAt: {
    type: Date,
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
  // Code snippet fields
  codeLanguage: {
    type: String,
    default: 'javascript',
  },
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent',
  },
  deliveredTo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveredAt: {
      type: Date,
      default: Date.now,
    },
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  forwarded: {
    type: Boolean,
    default: false,
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  deletedForEveryone: {
    type: Boolean,
    default: false,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  starred: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isEncrypted: {
    type: Boolean,
    default: false,
  },
  unlockAt: {
    type: Date,
  },
  unlockConditions: {
    type: {
      type: String,
      enum: ['birthday', 'location', 'count', 'online', 'time'],
    },
    location: {
      latitude: Number,
      longitude: Number,
      radius: { type: Number, default: 100 }, // meters
      address: String
    },
    messageCount: Number,
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ deleted: 1, deletedForEveryone: 1 });

// Virtual for checking if message is read
messageSchema.virtual('isRead').get(function () {
  return this.status === 'read';
});

// Method to mark as delivered
messageSchema.methods.markAsDelivered = function (userId) {
  if (!this.deliveredTo.some(d => d.userId.toString() === userId.toString())) {
    this.deliveredTo.push({ userId });

    // Update status if not already read
    if (this.status === 'sent') {
      this.status = 'delivered';
    }
  }
  return this.save();
};

// Method to mark as read
messageSchema.methods.markAsRead = function (userId) {
  // Add to readBy if not already there
  if (!this.readBy.some(r => r.userId.toString() === userId.toString())) {
    this.readBy.push({ userId });
  }

  // Add to deliveredTo if not already there
  if (!this.deliveredTo.some(d => d.userId.toString() === userId.toString())) {
    this.deliveredTo.push({ userId });
  }

  this.status = 'read';
  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function (userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    r => r.userId.toString() !== userId.toString()
  );

  // Add new reaction
  this.reactions.push({ userId, emoji });
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function (userId) {
  this.reactions = this.reactions.filter(
    r => r.userId.toString() !== userId.toString()
  );
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;