import User from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.bio = req.body.bio || user.bio;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
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

// @desc    Update user theme
// @route   PUT /api/users/theme
// @access  Private
export const updateTheme = async (req, res) => {
  try {
    const { theme, darkMode } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      if (theme) user.theme = theme;
      if (typeof darkMode === 'boolean') user.darkMode = darkMode;

      await user.save();

      res.json({
        success: true,
        data: {
          theme: user.theme,
          darkMode: user.darkMode,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
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

// @desc    Upload avatar
// @route   POST /api/users/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'samvad/avatars');

    // Update user avatar
    const user = await User.findById(req.user._id);
    user.avatar = result.secure_url;
    await user.save();

    res.json({
      success: true,
      data: {
        avatar: result.secure_url,
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

// @desc    Search users
// @route   GET /api/users/search?q=searchQuery
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } },
            { phone: { $regex: searchQuery, $options: 'i' } },
          ],
        },
      ],
    })
    .select('name email phone avatar bio status lastSeen')
    .limit(20);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'User not found',
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