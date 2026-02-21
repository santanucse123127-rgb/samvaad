import ClipboardItem from '../models/ClipboardItem.js';
import crypto from 'crypto';

// AES-256 encrypt/decrypt helpers using the server's CLIPBOARD_SECRET env var
const ALGO = 'aes-256-gcm';
const KEY = Buffer.from(
    (process.env.CLIPBOARD_SECRET || 'samvaad_clipboard_secret_key_32b!').slice(0, 32),
    'utf8'
);

const encrypt = (plaintext) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (ciphertext) => {
    try {
        const [ivHex, tagHex, dataHex] = ciphertext.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const data = Buffer.from(dataHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
        decipher.setAuthTag(tag);
        return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
    } catch {
        return null; // Decryption failure → return null
    }
};

/**
 * POST /api/clipboard
 * Push a new clipboard item and broadcast to all of the user's connected sessions.
 */
export const pushClipboardItem = async (req, res) => {
    try {
        const { type, content, fileData, fileName, fileSize, mimeType, sourceDevice } = req.body;

        if (!content && !fileData) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        // Encrypt sensitive content before storing
        const encryptedContent = content ? encrypt(content) : encrypt('[binary]');
        const encryptedFileData = fileData ? encrypt(fileData) : null;

        const item = await ClipboardItem.create({
            userId: req.user._id,
            type: type || 'text',
            content: encryptedContent,
            fileData: encryptedFileData,
            fileName,
            fileSize,
            mimeType,
            sourceDevice: sourceDevice || { name: 'Unknown Device', platform: 'web' },
        });

        // Build the payload to broadcast (decrypt for client)
        const payload = {
            _id: item._id,
            type: item.type,
            content: content || '',
            fileData: fileData || null,
            fileName: item.fileName,
            fileSize: item.fileSize,
            mimeType: item.mimeType,
            sourceDevice: item.sourceDevice,
            createdAt: item.createdAt,
        };

        // Emit real-time event to all of this user's socket sessions
        const io = req.app.get('io');
        if (io) {
            // Emit to the user's personal room (socket.join(userId) on connect)
            io.to(req.user._id.toString()).emit('clipboard:new-item', payload);
        }

        return res.status(201).json({ success: true, data: payload });
    } catch (error) {
        console.error('pushClipboardItem error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * GET /api/clipboard
 * Fetch last 50 clipboard items for the authenticated user.
 */
export const getClipboardHistory = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 50);
        const items = await ClipboardItem.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        const decrypted = items.map((item) => ({
            _id: item._id,
            type: item.type,
            content: item.content ? (decrypt(item.content) ?? '') : '',
            fileData: item.fileData ? (decrypt(item.fileData) ?? null) : null,
            fileName: item.fileName,
            fileSize: item.fileSize,
            mimeType: item.mimeType,
            sourceDevice: item.sourceDevice,
            createdAt: item.createdAt,
        }));

        return res.json({ success: true, data: decrypted });
    } catch (error) {
        console.error('getClipboardHistory error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE /api/clipboard/:id
 * Delete a single clipboard item (must belong to authenticated user).
 */
export const deleteClipboardItem = async (req, res) => {
    try {
        const item = await ClipboardItem.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Notify all sessions that this item was removed
        const io = req.app.get('io');
        if (io) {
            io.to(req.user._id.toString()).emit('clipboard:item-deleted', { id: req.params.id });
        }

        return res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        console.error('deleteClipboardItem error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * DELETE /api/clipboard
 * Clear all clipboard items for the authenticated user.
 */
export const clearClipboard = async (req, res) => {
    try {
        await ClipboardItem.deleteMany({ userId: req.user._id });

        const io = req.app.get('io');
        if (io) {
            io.to(req.user._id.toString()).emit('clipboard:cleared');
        }

        return res.json({ success: true, message: 'Clipboard history cleared' });
    } catch (error) {
        console.error('clearClipboard error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
