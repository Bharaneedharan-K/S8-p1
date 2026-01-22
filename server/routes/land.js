import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    addLandRecord,
    getPendingLands,
    verifyLandRecord,
    getAllLands,
    getLandByHash
} from '../controllers/landController.js';

const router = express.Router();

// Public: Verify by Hash
router.get('/public/verify/:hash', getLandByHash);

// Officer: Add Land
router.post(
    '/add',
    authMiddleware,
    authorize('OFFICER'),
    upload.fields([{ name: 'document', maxCount: 1 }]),
    addLandRecord
);

// Admin: Get Pending Lands
router.get(
    '/pending',
    authMiddleware,
    authorize('ADMIN'),
    getPendingLands
);

// Admin: Verify/Approve Land (Push hash to DB after Blockchain success)
router.patch(
    '/verify/:id',
    authMiddleware,
    authorize('ADMIN'),
    verifyLandRecord
);

// General: Get Lands (Filtered by role in controller)
router.get(
    '/',
    authMiddleware,
    getAllLands
);

export default router;
