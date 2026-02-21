import mongoose from 'mongoose';

const clipboardItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['text', 'url', 'image', 'file', 'rich-text'],
        default: 'text',
    },
    content: {
        type: String,
        required: true,
        maxlength: 1024 * 1024, // 1 MB max
    },
    // For files/images: base64-encoded content or Cloudinary URL
    fileData: {
        type: String,
        default: null,
    },
    fileName: {
        type: String,
        default: null,
    },
    fileSize: {
        type: Number,
        default: null,
    },
    mimeType: {
        type: String,
        default: null,
    },
    // Device info
    sourceDevice: {
        name: { type: String, default: 'Unknown Device' },
        platform: { type: String, default: 'web' },
    },
    // Security: flag as delivered once all devices have received it
    deliveredTo: [
        {
            type: String, // socket IDs or user session IDs
        }
    ],
    // Auto-delete after 24 hours
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
        index: { expires: 0 }, // TTL index — Mongo will auto-delete
    },
}, { timestamps: true });

// Index for fast queries
clipboardItemSchema.index({ userId: 1, createdAt: -1 });

const ClipboardItem = mongoose.model('ClipboardItem', clipboardItemSchema);
export default ClipboardItem;
