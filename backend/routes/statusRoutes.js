import express from 'express';
import {
    createStatus,
    getStatuses,
    markStatusSeen,
    deleteStatus
} from '../controllers/statusController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createStatus)
    .get(getStatuses);

router.post('/:id/seen', markStatusSeen);
router.delete('/:id', deleteStatus);

export default router;
