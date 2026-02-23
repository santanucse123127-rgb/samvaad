import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendSMS } from "../utils/sms.js";
import { sendEmail } from "../utils/email.js";

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
// @desc    Send OTP via phone or email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "Phone or Email is required" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user;
    if (phone) {
      user = await User.findOne({ phone });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      if (phone) {
        const tempEmail = `user_${phone}@samvaad.app`;
        user = await User.create({
          phone,
          name: phone,
          email: tempEmail,
          status: "offline"
        });
      } else {
        const tempName = email.split('@')[0];
        user = await User.create({
          email,
          name: tempName,
          status: "offline"
        });
      }
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    let sentVia = "";
    // Send OTP via Email if user has email
    if (user.email && user.email.includes('@') && !user.email.endsWith('.app')) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #008080; text-align: center;">Samvaad Verification</h2>
          <p>Hello,</p>
          <p>Your verification code for Samvaad is:</p>
          <div style="background: #f4f4f4; padding: 20px; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #333; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes. Please do not share this code with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Sent by Samvaad App</p>
        </div>
      `;
      await sendEmail(user.email, "Your Samvaad Verification Code", `Your code is ${otp}`, emailHtml);
      sentVia = "email";
    }

    // Also send via SMS mock if phone exists
    if (user.phone) {
      await sendSMS(user.phone, `Your Samvaad verification code is: ${otp}. Valid for 10 minutes.`);
      if (!sentVia) sentVia = "sms";
    }

    res.json({
      success: true,
      message: `OTP sent successfully via ${sentVia}`,
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
    const { phone, email, otp } = req.body;

    if ((!phone && !email) || !otp) {
      return res.status(400).json({ success: false, message: "Identifier and OTP are required" });
    }

    let query = {};
    if (phone) query = { phone };
    else query = { email };

    const user = await User.findOne(query).select("+otp +otpExpires");

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
