import express from 'express';
import {
  getMessages,
  sendMessage,
  uploadMedia,
  markAsRead,
  deleteMessage,
  forwardMessage,
  getStarredMessages,
  votePoll,
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Message routes
router.get('/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.post('/upload-media', protect, upload.single('media'), handleMulterError, uploadMedia);
router.put('/:id/read', protect, markAsRead);
router.put('/:id/vote', protect, votePoll);
router.delete('/:id', protect, deleteMessage);
router.post('/:id/forward', protect, forwardMessage);
router.get('/starred/all', protect, getStarredMessages);

export default router;