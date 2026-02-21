import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Get all conversations
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email avatar status lastSeen settings')
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
      .populate('participants', 'name email avatar status lastSeen settings')
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
        .populate('participants', 'name email avatar status lastSeen settings');

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
        .populate('participants', 'name email avatar status lastSeen settings');

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

export const updateGroupInfo = async (req, res) => {
  try {
    const { groupName, groupAvatar, groupDescription } = req.body;

    // Allow both admin and any participant to update (relax constraint a bit)
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not a participant',
      });
    }

    // Only admin can change name/avatar, but let's allow admin check per field
    const isAdmin = conversation.groupAdmin.some(a => a.toString() === req.user._id.toString());
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admins can edit group info' });
    }

    if (groupName !== undefined) conversation.groupName = groupName;
    if (groupAvatar !== undefined) conversation.groupAvatar = groupAvatar;
    if (groupDescription !== undefined) conversation.groupDescription = groupDescription;

    await conversation.save();

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen settings');

    // Notify all participants via socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(conversation._id.toString()).emit('group-updated', {
          conversationId: conversation._id,
          groupName: conversation.groupName,
          groupAvatar: conversation.groupAvatar,
          groupDescription: conversation.groupDescription,
        });
      }
    } catch (_) { }

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

// @desc    Add participant to group
// @route   PUT /api/conversations/:id/participants
// @access  Private
export const addParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
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

    await conversation.addParticipant(userId);

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen settings');

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

// @desc    Remove participant from group
// @route   DELETE /api/conversations/:id/participants
// @access  Private
export const removeParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
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

    await conversation.removeParticipant(userId);

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen settings');

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

// @desc    Leave group
// @route   POST /api/conversations/:id/leave
// @access  Private
export const leaveGroup = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    await conversation.removeParticipant(req.user._id);

    // If admin leaves, assign new admin if possible (simplified: just remove from admin list)
    if (conversation.groupAdmin.includes(req.user._id)) {
      conversation.groupAdmin = conversation.groupAdmin.filter(
        id => id.toString() !== req.user._id.toString()
      );
      // If no admins left and participants exist, make first participant admin
      if (conversation.groupAdmin.length === 0 && conversation.participants.length > 0) {
        conversation.groupAdmin.push(conversation.participants[0]);
      }
      await conversation.save();
    }

    res.json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Make user admin
// @route   PUT /api/conversations/:id/admins
// @access  Private
export const makeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
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

    await conversation.addAdmin(userId);

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen settings');

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

// @desc    Remove admin
// @route   DELETE /api/conversations/:id/admins
// @access  Private
export const removeAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
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

    await conversation.removeAdmin(userId);

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen settings');

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

// @desc    Send group invite to a user
// @route   POST /api/conversations/:id/invite
// @access  Private (admin only)
export const sendGroupInvite = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
      participants: req.user._id,
    }).populate('groupAdmin', 'name');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Find the user to invite
    const invitedUser = await User.findById(userId).select('name email avatar');
    if (!invitedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Already a member?
    if (conversation.participants.some(p => p.toString() === userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    // Send real-time invite to target user's personal socket room
    const io = req.app.get('io');
    if (io) {
      io.to(userId).emit('group-invite', {
        conversationId: conversation._id,
        groupName: conversation.groupName,
        groupAvatar: conversation.groupAvatar,
        invitedBy: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar,
        },
      });
    }

    res.json({ success: true, message: `Invite sent to ${invitedUser.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to group invite (accept or decline)
// @route   POST /api/conversations/:id/invite/respond
// @access  Private
export const respondGroupInvite = async (req, res) => {
  try {
    const { accept } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      type: 'group',
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!accept) {
      return res.json({ success: true, message: 'Invite declined' });
    }

    // Add user to participants
    await conversation.addParticipant(req.user._id);

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar status lastSeen settings');

    // Notify all group members
    const io = req.app.get('io');
    if (io) {
      io.to(conversation._id.toString()).emit('member-joined', {
        conversationId: conversation._id,
        user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
        conversation: populatedConversation,
      });

      // Also send the new conversation data to the newly joined user
      io.to(req.user._id.toString()).emit('joined-group', {
        conversation: populatedConversation,
      });
    }

    res.json({ success: true, data: populatedConversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
