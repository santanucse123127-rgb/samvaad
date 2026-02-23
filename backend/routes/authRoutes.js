import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/google', (req, res) => res.status(501).json({ message: "Google Auth not fully implemented" }));
router.post('/google-auth-code', (req, res) => res.status(501).json({ message: "Google Auth not fully implemented" }));
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;