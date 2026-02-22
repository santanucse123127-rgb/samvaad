import express from 'express';
import {
  getMessages,
  sendMessage,
  uploadMedia,
  markAsRead,
  deleteMessage,
  clearMessages,
  editMessage,
  forwardMessage,
  getStarredMessages,
  votePoll,
  searchMessages,
  getConversationMedia,
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Message routes
router.get('/search/all', protect, searchMessages);
router.get('/:conversationId', protect, getMessages);
router.get('/:conversationId/media', protect, getConversationMedia);
router.post('/send', protect, sendMessage);
router.post('/upload-media', protect, upload.single('media'), handleMulterError, uploadMedia);
router.put('/:id/read', protect, markAsRead);
router.put('/:id/vote', protect, votePoll);
router.delete('/:id', protect, deleteMessage);
router.put('/:id', protect, editMessage);
router.delete('/conversation/:conversationId/clear', protect, clearMessages);
router.post('/:id/forward', protect, forwardMessage);
router.get('/starred/all', protect, getStarredMessages);

export default router;