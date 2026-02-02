import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    addLandRecord,
    getPendingLands,
    verifyLandRecord,
    getAllLands,
    getLandByHash,
    getLandBySurveyNumber,
    getAvailableSlots // Import
} from '../controllers/landController.js';

const router = express.Router();

// Public: Verify by Hash
router.get('/public/verify/:hash', getLandByHash);

// Public: Get by Survey Number
router.get('/public/survey/:surveyNumber', getLandBySurveyNumber);

// Get Available Slots
router.get('/slots/:officerId', authMiddleware, getAvailableSlots);

// Add Land (Officer OR Farmer)
router.post(
    '/add',
    authMiddleware,
    upload.fields([{ name: 'document', maxCount: 1 }]),
    addLandRecord
);

// Admin/Officer: Get Pending Lands
router.get(
    '/pending',
    authMiddleware,
    authorize('ADMIN', 'OFFICER'),
    getPendingLands
);

// Admin/Officer: Verify/Approve Land
router.patch(
    '/verify/:id',
    authMiddleware,
    authorize('ADMIN', 'OFFICER'),
    upload.fields([{ name: 'verificationDocument', maxCount: 1 }]),
    verifyLandRecord
);

// General: Get Lands (Filtered by role in controller)
router.get(
    '/',
    authMiddleware,
    getAllLands
);

export default router;
