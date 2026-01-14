import express from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  updateGroupInfo,
} from '../controllers/conversationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/:id', protect, getConversationById);
router.post('/create', protect, createConversation);
router.delete('/:id', protect, deleteConversation);
router.put('/:id/group', protect, updateGroupInfo);

export default router;