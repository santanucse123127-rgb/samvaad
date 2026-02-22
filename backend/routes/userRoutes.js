import express from 'express';
import {
  updateProfile,
  updateTheme,
  updateSettings,
  uploadAvatar,
  searchUsers,
  getUserById,
  getUsers,
  syncContacts,
  subscribePush,
  unsubscribePush,
  updateAppLock,
  verifyAppLock,
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();
router.get('/', protect, getUsers);
router.put('/profile', protect, updateProfile);
router.put('/theme', protect, updateTheme);
router.put('/settings', protect, updateSettings);
router.post('/upload-avatar', protect, upload.single('avatar'), handleMulterError, uploadAvatar);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);
router.post('/sync-contacts', protect, syncContacts);
router.post('/subscribe-push', protect, subscribePush);
router.post('/unsubscribe-push', protect, unsubscribePush);
router.put('/app-lock', protect, updateAppLock);
router.post('/app-lock/verify', protect, verifyAppLock);

export default router;