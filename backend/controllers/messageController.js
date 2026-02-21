import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { sendToUser } from "../utils/pushNotification.js";

// @desc    Get messages for a conversation with pagination
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Get messages with optimized query
    const messages = await Message.find({
      conversationId,
      deletedFor: { $ne: req.user._id },
    })
      .populate("sender", "name avatar status lastSeen settings")
      .populate({
        path: "replyTo",
        select: "content sender type mediaUrl",
        populate: {
          path: "sender",
          select: "name"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    const total = await Message.countDocuments({
      conversationId,
      deleted: false,
      deletedFor: { $ne: req.user._id },
      deletedForEveryone: false,
    });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send message
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      content,
      type,
      replyTo,
      mentions,
      pollQuestion,
      pollOptions,
      allowMultipleAnswers,
      scheduledAt,
      codeLanguage,
      isEncrypted,
      unlockAt
    } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Prepare message data
    const messageData = {
      conversationId,
      sender: req.user._id,
      content,
      type: type || "text",
      replyTo: replyTo || null,
      mentions: mentions || [],
      status: 'sent',
      isEncrypted: isEncrypted || false,
      unlockAt: unlockAt || null,
    };

    // Handle Polls
    if (type === 'poll') {
      messageData.pollQuestion = pollQuestion;
      messageData.pollOptions = pollOptions.map(opt => ({ text: opt, votes: [] }));
      messageData.allowMultipleAnswers = allowMultipleAnswers;
    }

    // Handle Code
    if (type === 'code') {
      messageData.codeLanguage = codeLanguage;
    }

    // Handle Scheduling
    if (scheduledAt) {
      messageData.scheduledAt = scheduledAt;
      messageData.isScheduled = true;
      messageData.status = 'scheduled';
    }

    // Create message
    const message = await Message.create(messageData);

    // If scheduled, don't update conversation lastMessage or notify yet
    if (message.isScheduled) {
      return res.status(201).json({
        success: true,
        data: message,
        message: 'Message scheduled successfully'
      });
    }

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();

    // Increment unread count for other participants
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount =
          conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(
          participantId.toString(),
          currentCount + 1
        );
      }
    });

    await conversation.save();

    // Populate message before sending
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatar status")
      .populate({
        path: "replyTo",
        select: "content sender type",
        populate: {
          path: "sender",
          select: "name"
        }
      });

    // Emit socket event
    const io = req.app.get("io");

    if (io) {
      // Send to all participants in the conversation
      io.to(conversation._id.toString()).emit(
        "message-received",
        populatedMessage
      );

      // Send notifications to mentioned users
      if (mentions && mentions.length > 0) {
        mentions.forEach(userId => {
          io.to(userId.toString()).emit("mentioned-in-message", {
            messageId: message._id,
            conversationId: conversation._id,
            sender: req.user._id,
          });
        });
      }
    }

    // Send push notifications to other participants
    const otherParticipants = conversation.participants.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    if (otherParticipants.length > 0) {
      const usersToNotify = await User.find({ _id: { $in: otherParticipants } });
      const payload = {
        title: populatedMessage.sender.name,
        body: type === 'text' ? content : `Sent a ${type}`,
        icon: populatedMessage.sender.avatar || '/logo192.png',
        data: {
          conversationId: conversation._id,
          messageId: populatedMessage._id,
          type: 'message'
        }
      };

      usersToNotify.forEach(user => {
        sendToUser(user, payload);
      });
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload media (image/video/file/voice)
// @route   POST /api/messages/upload-media
// @access  Private
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { conversationId, type, replyTo, duration } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Determine folder based on type
    const folder =
      type === "image"
        ? "nexus/images"
        : type === "video"
          ? "nexus/videos"
          : type === "voice"
            ? "nexus/voice"
            : "nexus/files";

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, folder);

    // Create message with media
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content: type === 'file' ? req.file.originalname : result.url,
      type: type || "image",
      mediaUrl: result.url,
      mediaType: result.resource_type,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      duration: duration || null,
      thumbnail: result.eager?.[0]?.secure_url || null,
      replyTo: replyTo || null,
      status: "sent",
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = Date.now();

    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== req.user._id.toString()) {
        const currentCount =
          conversation.unreadCount.get(participantId.toString()) || 0;
        conversation.unreadCount.set(
          participantId.toString(),
          currentCount + 1
        );
      }
    });

    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name avatar status"
    );

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(conversation._id.toString()).emit(
        "message-received",
        populatedMessage
      );
    }

    // Send push notifications to other participants
    const otherParticipants = conversation.participants.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    if (otherParticipants.length > 0) {
      const usersToNotify = await User.find({ _id: { $in: otherParticipants } });
      const payload = {
        title: populatedMessage.sender.name,
        body: `Sent a ${type || 'file'}`,
        icon: populatedMessage.sender.avatar || '/logo192.png',
        data: {
          conversationId: conversation._id,
          messageId: populatedMessage._id,
          type: 'message'
        }
      };

      usersToNotify.forEach(user => {
        sendToUser(user, payload);
      });
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Don't mark own messages as read
    if (message.sender.toString() === req.user._id.toString()) {
      return res.json({
        success: true,
        data: message,
      });
    }

    // Mark as read
    await message.markAsRead(req.user._id);

    // Update conversation unread count
    const conversation = await Conversation.findById(message.conversationId);
    if (conversation) {
      const currentCount =
        conversation.unreadCount.get(req.user._id.toString()) || 0;
      if (currentCount > 0) {
        conversation.unreadCount.set(
          req.user._id.toString(),
          currentCount - 1
        );
        await conversation.save();
      }
    }

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(message.sender.toString()).emit("message-read", {
        messageId: message._id,
        readBy: req.user._id,
        readAt: Date.now(),
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { deleteFor } = req.body; // 'me' or 'everyone'
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Verify authorization
    if (deleteFor === "everyone" && message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message for everyone",
      });
    }

    // If deleting for self, ensure user is a participant of the conversation
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete messages in this conversation",
      });
    }

    if (deleteFor === "everyone") {
      // Check if message is less than 1 hour old (WhatsApp-like behavior)
      const messageAge = Date.now() - new Date(message.createdAt).getTime();
      const oneHour = 60 * 60 * 1000;

      if (messageAge > oneHour) {
        return res.status(400).json({
          success: false,
          message: "Messages can only be deleted for everyone within 1 hour",
        });
      }

      message.deletedForEveryone = true;
      message.content = "This message was deleted";
    } else {
      message.deletedFor.push(req.user._id);
    }

    await message.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      const conversation = await Conversation.findById(message.conversationId);
      io.to(conversation._id.toString()).emit("message-deleted", {
        messageId: message._id,
        conversationId: conversation._id,
        deleteFor,
      });
    }

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Forward message
// @route   POST /api/messages/:id/forward
// @access  Private
export const forwardMessage = async (req, res) => {
  try {
    const { conversationIds } = req.body;
    const originalMessage = await Message.findById(req.params.id);

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const forwardedMessages = [];

    for (const conversationId of conversationIds) {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user._id,
      });

      if (conversation) {
        const forwardedMessage = await Message.create({
          conversationId,
          sender: req.user._id,
          content: originalMessage.content,
          type: originalMessage.type,
          mediaUrl: originalMessage.mediaUrl,
          mediaType: originalMessage.mediaType,
          forwarded: true,
          status: 'sent',
        });

        // Update conversation
        conversation.lastMessage = forwardedMessage._id;
        conversation.updatedAt = Date.now();
        await conversation.save();

        const populatedMessage = await Message.findById(forwardedMessage._id)
          .populate("sender", "name avatar");

        forwardedMessages.push(populatedMessage);

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
          io.to(conversationId).emit("message-received", populatedMessage);
        }
      }
    }

    res.json({
      success: true,
      data: forwardedMessages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get starred messages
// @route   GET /api/messages/starred
// @access  Private
export const getStarredMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      starred: req.user._id,
    })
      .populate("sender", "name avatar")
      .populate("conversationId", "type groupName participants")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Vote on a poll
// @route   PUT /api/messages/:id/vote
// @access  Private
export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message || message.type !== 'poll') {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    const userId = req.user._id;

    // Handle multiple answers restriction
    if (!message.allowMultipleAnswers) {
      // Remove user from all other options
      message.pollOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) {
          opt.votes = opt.votes.filter(id => id.toString() !== userId.toString());
        }
      });
    }

    // Toggle vote for the selected option
    const option = message.pollOptions[optionIndex];
    if (!option) {
      return res.status(400).json({
        success: false,
        message: "Invalid option index",
      });
    }

    const voteIndex = option.votes.indexOf(userId);

    if (voteIndex > -1) {
      option.votes.splice(voteIndex, 1);
    } else {
      option.votes.push(userId);
    }

    await message.save();

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.to(message.conversationId.toString()).emit("poll-updated", {
        messageId: message._id,
        pollOptions: message.pollOptions,
      });
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};