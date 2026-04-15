import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: auto-delete when expiresAt reached
  },
  type: {
    type: String,
    enum: ['phone', 'email'],
    required: true,
  }
}, {
  timestamps: true,
});

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
