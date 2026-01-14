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
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;