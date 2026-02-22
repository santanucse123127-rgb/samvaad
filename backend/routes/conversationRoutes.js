import express from 'express';
import {
  getConversations,
  getConversationById,
  createConversation,
  deleteConversation,
  updateGroupInfo,
  addParticipant,
  removeParticipant,
  leaveGroup,
  makeAdmin,
  removeAdmin,
  sendGroupInvite,
  respondGroupInvite,
  togglePin,
  toggleArchive,
  updateEphemeralSettings,
} from '../controllers/conversationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.post('/create', protect, createConversation);
router.get('/:id', protect, getConversationById);
router.delete('/:id', protect, deleteConversation);
router.put('/:id/group', protect, updateGroupInfo);
router.put('/:id/participants', protect, addParticipant);
router.delete('/:id/participants', protect, removeParticipant);
router.post('/:id/leave', protect, leaveGroup);
router.put('/:id/admins', protect, makeAdmin);
router.delete('/:id/admins', protect, removeAdmin);
router.post('/:id/invite', protect, sendGroupInvite);
router.post('/:id/invite/respond', protect, respondGroupInvite);
router.put('/:id/pin', protect, togglePin);
router.put('/:id/archive', protect, toggleArchive);
router.put('/:id/ephemeral', protect, updateEphemeralSettings);

export default router;