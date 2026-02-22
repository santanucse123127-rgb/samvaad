import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Temporary store for QR linking sessions
// In production, use Redis for this with expiration
const qrSessions = new Map();

/**
 * @desc    Initialize a QR linking session
 * @route   POST /api/devices/qr-init
 * @access  Public (Web/Desktop client starts this)
 */
export const initQrSession = async (req, res) => {
    try {
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Store session with expiration (5 minutes)
        qrSessions.set(sessionId, {
            status: 'pending',
            createdAt: Date.now()
        });

        // Cleanup session after 5 minutes
        setTimeout(() => {
            qrSessions.delete(sessionId);
        }, 5 * 60000);

        res.json({
            success: true,
            data: { sessionId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Authorize a device via QR (Scan from Phone)
 * @route   POST /api/devices/qr-authorize
 * @access  Private (Phone app calls this)
 */
export const authorizeQrSession = async (req, res) => {
    try {
        const { sessionId, deviceDetails } = req.body;
        const userId = req.user._id;

        if (!qrSessions.has(sessionId)) {
            return res.status(404).json({ success: false, message: 'QR Session expired or invalid' });
        }

        const session = qrSessions.get(sessionId);
        if (session.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'QR Session already processed' });
        }

        // Generate token for the new device
        const token = generateToken(userId);
        const user = await User.findById(userId);

        // Add device to linked devices
        const newDevice = {
            deviceName: deviceDetails?.deviceName || 'Unknown Device',
            deviceType: deviceDetails?.deviceType || 'Web',
            browser: deviceDetails?.browser,
            os: deviceDetails?.os,
            ip: req.ip,
            linkedAt: new Date(),
            lastActive: new Date()
        };

        user.linkedDevices.push(newDevice);
        await user.save();

        // Notify the web client via Socket.io
        const io = req.app.get('io');
        if (io) {
            // Use the sessionId as a temporary room
            io.to(sessionId).emit('qr-authorized', {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                }
            });
        }

        qrSessions.set(sessionId, { status: 'authorized', userId, deviceId: user.linkedDevices[user.linkedDevices.length - 1]._id });

        res.json({
            success: true,
            message: 'Device linked successfully'
        });
    } catch (error) {
        console.error('QR Authorize Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all linked devices for the current user
 * @route   GET /api/devices
 * @access  Private
 */
export const getLinkedDevices = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('linkedDevices');
        res.json({
            success: true,
            data: user.linkedDevices
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Logout/Remove a linked device
 * @route   DELETE /api/devices/:deviceId
 * @access  Private
 */
export const removeDevice = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.linkedDevices = user.linkedDevices.filter(d => d._id.toString() !== req.params.deviceId);
        await user.save();

        res.json({
            success: true,
            message: 'Device unlinked successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
