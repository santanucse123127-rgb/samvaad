import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  type: {
    type: String,
    enum: ['one-on-one', 'group'],
    default: 'one-on-one',
  },
  groupName: {
    type: String,
    trim: true,
  },
  groupAvatar: {
    type: String,
  },
  groupDescription: {
    type: String,
    maxlength: 500,
  },
  groupAdmin: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  archivedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  mutedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    mutedUntil: Date,
  }],
  encryptionKey: {
    type: String, // For end-to-end encryption (future feature)
  },
  groupSettings: {
    onlyAdminsCanSend: {
      type: Boolean,
      default: false,
    },
    onlyAdminsCanEditInfo: {
      type: Boolean,
      default: true,
    },
    approveNewMembers: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ type: 1 });

// Method to add participant
conversationSchema.methods.addParticipant = function (userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
  }
  return this.save();
};

// Method to remove participant
conversationSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    id => id.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update unread count
conversationSchema.methods.incrementUnread = function (userId) {
  const current = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), current + 1);
  return this.save();
};

// Method to reset unread count
conversationSchema.methods.resetUnread = function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Method to check if user is admin
conversationSchema.methods.isAdmin = function (userId) {
  if (this.type !== 'group') return false;
  return this.groupAdmin.some(id => id.toString() === userId.toString());
};

// Method to add admin
conversationSchema.methods.addAdmin = function (userId) {
  if (!this.groupAdmin.some(id => id.toString() === userId.toString())) {
    this.groupAdmin.push(userId);
  }
  return this.save();
};

// Method to remove admin
conversationSchema.methods.removeAdmin = function (userId) {
  this.groupAdmin = this.groupAdmin.filter(
    id => id.toString() !== userId.toString()
  );
  return this.save();
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;