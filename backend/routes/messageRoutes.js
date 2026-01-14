import express from 'express';
import {
  getMessages,
  sendMessage,
  uploadMedia,
  markAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.post('/upload-media', protect, upload.single('media'), handleMulterError, uploadMedia);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

export default router;