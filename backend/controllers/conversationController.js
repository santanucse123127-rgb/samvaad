import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Get all conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email avatar status lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single conversation
// @route   GET /api/conversations/:id
// @access  Private
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    })
      .populate('participants', 'name email avatar status lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create or get conversation
// @route   POST /api/conversations/create
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { participantId, type, groupName } = req.body;

    // For one-on-one chat
    if (type === 'one-on-one' || !type) {
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        type: 'one-on-one',
        participants: {
          $all: [req.user._id, participantId],
          $size: 2,
        },
      })
        .populate('participants', 'name email avatar status lastSeen')
        .populate('lastMessage');

      if (existingConversation) {
        return res.json({
          success: true,
          data: existingConversation,
        });
      }

      // Create new conversation
      const conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        type: 'one-on-one',
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar status lastSeen');

      res.status(201).json({
        success: true,
        data: populatedConversation,
      });
    } else if (type === 'group') {
      // Create group conversation
      const participants = req.body.participants || [];
      participants.push(req.user._id);

      const conversation = await Conversation.create({
        participants: [...new Set(participants)], // Remove duplicates
        type: 'group',
        groupName: groupName || 'New Group',
        groupAdmin: req.user._id,
      });

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar status lastSeen');

      res.status(201).json({
        success: true,
        data: populatedConversation,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete conversation
// @route   DELETE /api/conversations/:id
// @access  Private
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversationId: req.params.id });

    // Delete conversation
    await Conversation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update group info
// @route   PUT /api/conversations/:id/group
// @access  Private
export const updateGroupInfo = async (req, res) => {
  try {
    const { groupName, groupAvatar } = req.body;
    
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
      groupAdmin: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not the admin',
      });
    }

    if (groupName) conversation.groupName = groupName;
    if (groupAvatar) conversation.groupAvatar = groupAvatar;

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen');

    res.json({
      success: true,
      data: populatedConversation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};