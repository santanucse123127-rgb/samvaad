import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Task from '../models/Task.js';
import { sendToUser } from '../utils/pushNotification.js';

// Configuration
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let connection;
try {
  connection = new IORedis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
  });
} catch (err) {
  console.warn('⚠️ Redis connection failed. Falling back to internal interval scheduler.');
}

// Queues
export const schedulerQueue = connection ? new Queue('SamvaadScheduler', { connection }) : null;

/**
 * Initialize the scalable scheduler
 * @param {object} io - Socket.io instance
 */
export const initializeScheduler = (io) => {
  if (schedulerQueue) {
    console.log('🚀 Scalable Scheduler (BullMQ) Initialized');
    
    // Create a repeatable job that runs every minute
    schedulerQueue.add('check-integrity', {}, {
      repeat: { pattern: '* * * * *' },
      removeOnComplete: true,
      removeOnFail: true,
    });

    const worker = new Worker('SamvaadScheduler', async (job) => {
      console.log(`[Worker] Processing job: ${job.name}`);
      if (job.name === 'check-integrity') {
        await checkScheduledMessages(io);
        await checkTaskReminders(io);
      }
    }, { connection });

    worker.on('failed', (job, err) => {
      console.error(`❌ Worker Job Failed: ${job.id}`, err);
    });
  } else {
    // Fallback for local dev without Redis
    console.log('ℹ️ Scaling down to Interval-based Scheduler (No Redis found)');
    setInterval(() => {
      checkScheduledMessages(io);
      checkTaskReminders(io);
    }, 60000);
  }
};

/**
 * Logic for checking and sending scheduled messages
 */
const checkScheduledMessages = async (io) => {
  try {
    const now = new Date();
    const pendingMessages = await Message.find({
      status: 'scheduled',
      scheduledAt: { $lte: now },
    }).populate('sender');

    for (const message of pendingMessages) {
      message.status = 'sent';
      message.timestamp = now;
      await message.save();

      const conversation = await Conversation.findById(message.conversationId);
      if (conversation) {
        conversation.lastMessage = message._id;
        
        // Update unread counts
        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== message.sender._id.toString()) {
            const currentCount = conversation.unreadCount.get(participantId.toString()) || 0;
            conversation.unreadCount.set(participantId.toString(), currentCount + 1);
          }
        });
        await conversation.save();

        if (io) {
          io.to(conversation._id.toString()).emit('message-received', message);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkScheduledMessages:', error);
  }
};

/**
 * Logic for checking task reminders
 */
const checkTaskReminders = async (io) => {
  try {
    const now = new Date();
    const in30Mins = new Date(now.getTime() + 30 * 60000);

    const dueTasks = await Task.find({
      status: 'pending',
      reminderSent: false,
      deadline: { $lte: in30Mins, $gte: now },
    }).populate('user');

    for (const task of dueTasks) {
      await sendToUser(task.user, {
        title: 'Task Reminder',
        body: `Your task "${task.title}" is due soon!`,
        data: { url: '/chat', taskId: task._id },
      });

      if (io) {
        io.to(`user_${task.user._id}`).emit('task-reminder', {
          message: `Your task "${task.title}" is due in less than 30 minutes!`,
          taskId: task._id,
        });
      }

      task.reminderSent = true;
      await task.save();
    }
  } catch (error) {
    console.error('Error in checkTaskReminders:', error);
  }
};
