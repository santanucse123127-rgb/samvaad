import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendSMS } from "../utils/sms.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, avatar } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      avatar,
    });

    if (user) {
      const token = generateToken(user._id);
      const userDetails = user.toObject ? user.toObject() : { ...user._doc };
      delete userDetails.password;
      userDetails.token = token;

      res.status(201).json({
        success: true,
        data: userDetails,
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // Update user status to online
      user.status = "online";
      user.lastSeen = Date.now();
      await user.save();

      const userObj = user.toObject ? user.toObject() : { ...user._doc };
      delete userObj.password;
      userObj.token = generateToken(user._id);

      res.json({
        success: true,
        data: userObj,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.status = "offline";
      user.lastSeen = Date.now();
      user.socketId = "";
      await user.save();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// @desc    Send OTP to phone
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await User.findOne({ phone });

    if (!user) {
      // Create a temporary name/email if they don't exist yet
      // In a real app, you might want a separate registration step
      const tempEmail = `user_${phone}@samvaad.app`;
      user = await User.create({
        phone,
        name: phone, // Default name is phone number
        email: tempEmail,
        status: "offline"
      });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via SMS mock
    await sendSMS(phone, `Your Samvaad verification code is: ${otp}. Valid for 10 minutes.`);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: "Phone and OTP are required" });
    }

    const user = await User.findOne({ phone }).select("+otp +otpExpires");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verify
    user.otp = undefined;
    user.otpExpires = undefined;
    user.status = "online";
    user.lastSeen = Date.now();
    await user.save();

    const token = generateToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpires;
    userObj.token = token;

    res.json({
      success: true,
      data: userObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
