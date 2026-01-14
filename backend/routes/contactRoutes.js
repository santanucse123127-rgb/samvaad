import express from 'express';
import {
  getContacts,
  addContact,
  updateContactNickname,
  deleteContact,
  toggleBlockContact,
} from '../controllers/contactController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getContacts);
router.post('/add', protect, addContact);
router.put('/:id/nickname', protect, updateContactNickname);
router.delete('/:id', protect, deleteContact);
router.put('/:id/block', protect, toggleBlockContact);

export default router;