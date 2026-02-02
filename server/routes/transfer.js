import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    initiateTransfer,
    acceptTransfer,
    verifyTransfer,
    approveTransfer,
    rejectTransfer,
    getTransferRequests
} from '../controllers/transferController.js';

const router = express.Router();

// Get Requests (Role based)
router.get(
    '/',
    authMiddleware,
    getTransferRequests
);

// 1. Seller Initiates
router.post(
    '/initiate',
    authMiddleware,
    authorize('FARMER'),
    upload.fields([{ name: 'saleDeed', maxCount: 1 }]),
    initiateTransfer
);

// 2. Buyer Accepts
router.post(
    '/accept/:id',
    authMiddleware,
    authorize('FARMER'),
    acceptTransfer
);

// 3. Officer Verifies
router.patch(
    '/verify/:id',
    authMiddleware,
    authorize('OFFICER'),
    upload.fields([{ name: 'verificationDocument', maxCount: 1 }]),
    verifyTransfer
);

// 4. Admin Approves (Final Execution)
router.patch(
    '/approve/:id',
    authMiddleware,
    authorize('ADMIN'),
    approveTransfer,
    rejectTransfer // Import logic
);

// 5. Universal Reject
router.patch(
    '/reject/:id',
    authMiddleware,
    rejectTransfer
);

export default router;
