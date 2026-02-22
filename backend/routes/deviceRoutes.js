import express from 'express';
import {
    initQrSession,
    authorizeQrSession,
    getLinkedDevices,
    removeDevice
} from '../controllers/deviceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/qr-init', initQrSession);
router.post('/qr-authorize', protect, authorizeQrSession);
router.get('/', protect, getLinkedDevices);
router.delete('/:deviceId', protect, removeDevice);

export default router;
