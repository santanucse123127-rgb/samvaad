import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    deadline: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    reminderSent: {
        type: Boolean,
        default: false,
    },
    googleEventId: {
        type: String,
    }
}, {
    timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
