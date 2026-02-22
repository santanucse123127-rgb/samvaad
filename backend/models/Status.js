import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String, // Text, image URL, or video URL
        required: true,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text',
    },
    caption: {
        type: String,
        maxlength: 200,
    },
    style: {
        backgroundColor: String,
        fontFamily: String,
    },
    seenBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        seenAt: {
            type: Date,
            default: Date.now,
        }
    }],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        index: { expires: 0 }, // TTL index
    }
}, {
    timestamps: true,
});

const Status = mongoose.model('Status', statusSchema);

export default Status;
