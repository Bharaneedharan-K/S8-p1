import express from 'express';
import { authMiddleware as verifyToken, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    applyForScheme,
    getMyApplications,
    getAllApplications,
    reviewApplication
} from '../controllers/applicationController.js';

const router = express.Router();

// Farmer Routes
router.post('/apply', verifyToken, authorize('FARMER'), upload.fields([{ name: 'documents', maxCount: 5 }]), applyForScheme);
router.get('/my', verifyToken, authorize('FARMER'), getMyApplications);

// Admin Routes
router.get('/', verifyToken, authorize('ADMIN'), getAllApplications);
router.patch('/:id/review', verifyToken, authorize('ADMIN'), reviewApplication);

export default router;
