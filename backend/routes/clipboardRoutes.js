import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    pushClipboardItem,
    getClipboardHistory,
    deleteClipboardItem,
    clearClipboard,
} from '../controllers/clipboardController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', pushClipboardItem);         // Push a new clipboard item
router.get('/', getClipboardHistory);        // Get history (last 50)
router.delete('/:id', deleteClipboardItem);  // Delete one item
router.delete('/', clearClipboard);          // Clear all

export default router;
