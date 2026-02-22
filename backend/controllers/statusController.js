import Status from '../models/Status.js';
import User from '../models/User.js';

// @desc    Create a new status
// @route   POST /api/status
// @access  Private
export const createStatus = async (req, res) => {
    try {
        const { content, type, caption, style } = req.body;

        const status = await Status.create({
            user: req.user._id,
            content,
            type,
            caption,
            style,
        });

        const populatedStatus = await status.populate('user', 'name avatar');

        // Emit socket event to notify other users
        const io = req.app.get('io');
        if (io) {
            io.emit('status-updated', populatedStatus);
        }

        res.status(201).json({
            success: true,
            data: populatedStatus,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active statuses from contacts and self
// @route   GET /api/status
// @access  Private
export const getStatuses = async (req, res) => {
    try {
        // Get user's contacts (assuming user.contacts is an array of objects with email/tel)
        // Actually, let's just get all statuses for now and filter by contacts in the app logic,
        // or if we have a contact list implementation, use that.
        // For Samvaad, let's find users who have common conversations or are in the user's contacts list.

        const user = await User.findById(req.user._id);
        const contactEmails = user.contacts.map(c => c.email);

        const contactUsers = await User.find({ email: { $in: contactEmails } });
        const contactIds = contactUsers.map(u => u._id);

        // Include the user themselves
        const allowedIds = [...contactIds, req.user._id];

        const statuses = await Status.find({
            user: { $in: allowedIds },
            expiresAt: { $gt: new Date() }
        })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        // Group statuses by user
        const groupedStatuses = statuses.reduce((acc, status) => {
            const userId = status.user._id.toString();
            if (!acc[userId]) {
                acc[userId] = {
                    user: status.user,
                    items: []
                };
            }
            acc[userId].items.push(status);
            return acc;
        }, {});

        res.json({
            success: true,
            data: Object.values(groupedStatuses),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark a status as seen
// @route   POST /api/status/:id/seen
// @access  Private
export const markStatusSeen = async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);

        if (!status) {
            return res.status(404).json({ success: false, message: 'Status not found' });
        }

        // Check if already seen
        const alreadySeen = status.seenBy.some(s => s.user.toString() === req.user._id.toString());

        if (!alreadySeen) {
            status.seenBy.push({ user: req.user._id });
            await status.save();
        }

        res.json({ success: true, message: 'Status marked as seen' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a status
// @route   DELETE /api/status/:id
// @access  Private
export const deleteStatus = async (req, res) => {
    try {
        const status = await Status.findById(req.params.id);

        if (!status) {
            return res.status(404).json({ success: false, message: 'Status not found' });
        }

        if (status.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await status.deleteOne();

        res.json({ success: true, message: 'Status deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
