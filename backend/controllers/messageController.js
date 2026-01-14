import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// @desc    Get messages for a conversation
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

    const messages = await Message.find({
      conversationId,
      deleted: false,
      deletedFor: { $ne: req.user._id },
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      conversationId,
      deleted: false,
      deletedFor: { $ne: req.user._id },
    });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
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
    const { conversationId, content, type, replyTo } = req.body;

    // Verify conversation exists and user is participant
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

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content,
      type: type || "text",
      replyTo: replyTo || null,
    });

    // Update conversation's last message
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

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name avatar"
    );

    // Emit socket event
    const io = req.app.get("io");
if (!io) {
  console.warn("Socket.io instance not found");
  return;
}


    io.to(conversation._id.toString()).emit(
      "message-received",
      populatedMessage
    );

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

// @desc    Upload media
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

    const { conversationId, type } = req.body;

    // Verify conversation
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

    // Upload to Cloudinary
    const folder =
      type === "image"
        ? "samvad/images"
        : type === "video"
        ? "samvad/videos"
        : "samvad/files";

    const result = await uploadToCloudinary(req.file.buffer, folder);

    // Create message with media
    const message = await Message.create({
  conversationId,
  sender: req.user._id,
  content,
  type: type || "text",
  status: "sent",
  replyTo: replyTo || null,
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
      "name avatar"
    );

    // Emit socket event
    const io = req.app.get("io");
if (!io) {
  console.warn("Socket.io instance not found");
  return;
}



    // conversation.participants.forEach((participantId) => {
    //   if (participantId.toString() !== req.user._id.toString()) {
    //     io.to(conversation._id.toString()).emit(
    //       "message-received",
    //       populatedMessage
    //     );
    //   }
    // });
    io.to(conversation._id.toString()).emit(
          "message-received",
          populatedMessage
        );
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

    // Check if already read by this user
    const alreadyRead = message.readBy.some(
      (read) => read.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({
        userId: req.user._id,
        readAt: Date.now(),
      });

      // Update status
      const conversation = await Conversation.findById(message.conversationId);
      const allRead = conversation.participants.every((p) =>
        message.readBy.some((r) => r.userId.toString() === p.toString())
      );

      if (allRead) {
        message.status = "read";
      } else if (message.status === "sent") {
        message.status = "delivered";
      }

      await message.save();

      // Update unread count
      const currentCount =
        conversation.unreadCount.get(req.user._id.toString()) || 0;
      if (currentCount > 0) {
        conversation.unreadCount.set(req.user._id.toString(), currentCount - 1);
        await conversation.save();
      }

      // Emit socket event
      const io = req.app.get("io");
if (!io) {
  console.warn("Socket.io instance not found");
  return;
}


      io.to(message.conversationId.toString()).emit("message-read", {
        messageId: message._id,
        readerId: req.user._id,
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

    // Verify sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    if (deleteFor === "everyone") {
      message.deleted = true;
      message.content = "This message was deleted";
    } else {
      message.deletedFor.push(req.user._id);
    }

    await message.save();

    // Emit socket event
    const io = req.app.get("io");
if (!io) {
  console.warn("Socket.io instance not found");
  return;
}


    const conversation = await Conversation.findById(message.conversationId);
    io.to(conversation._id.toString()).emit("message-deleted", {
  messageId: message._id,
  conversationId: conversation._id,
  deleteFor,
});


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
