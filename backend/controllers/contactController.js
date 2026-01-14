import Contact from '../models/Contact.js';
import User from '../models/User.js';

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user._id, blocked: false })
      .populate('contactUserId', 'name email phone avatar bio status lastSeen')
      .sort({ addedAt: -1 });

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add new contact
// @route   POST /api/contacts/add
// @access  Private
export const addContact = async (req, res) => {
  try {
    const { contactUserId, nickname } = req.body;

    // Check if trying to add self
    if (contactUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add yourself as a contact',
      });
    }

    // Check if contact user exists
    const contactUser = await User.findById(contactUserId);
    if (!contactUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      userId: req.user._id,
      contactUserId: contactUserId,
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact already exists',
      });
    }

    // Create contact
    const contact = await Contact.create({
      userId: req.user._id,
      contactUserId: contactUserId,
      nickname: nickname || contactUser.name,
    });

    const populatedContact = await Contact.findById(contact._id)
      .populate('contactUserId', 'name email phone avatar bio status lastSeen');

    res.status(201).json({
      success: true,
      data: populatedContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update contact nickname
// @route   PUT /api/contacts/:id/nickname
// @access  Private
export const updateContactNickname = async (req, res) => {
  try {
    const { nickname } = req.body;
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    contact.nickname = nickname;
    await contact.save();

    const populatedContact = await Contact.findById(contact._id)
      .populate('contactUserId', 'name email phone avatar bio status lastSeen');

    res.json({
      success: true,
      data: populatedContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Block/Unblock contact
// @route   PUT /api/contacts/:id/block
// @access  Private
export const toggleBlockContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    contact.blocked = !contact.blocked;
    await contact.save();

    res.json({
      success: true,
      data: contact,
      message: contact.blocked ? 'Contact blocked' : 'Contact unblocked',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};