import express from 'express';
import {
  updateProfile,
  updateTheme,
  uploadAvatar,
  searchUsers,
  getUserById,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/theme', protect, updateTheme);
router.post('/upload-avatar', protect, upload.single('avatar'), handleMulterError, uploadAvatar);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);

export default router;