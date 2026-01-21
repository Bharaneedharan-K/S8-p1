import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { submitVerification } from '../controllers/farmerController.js';

const router = express.Router();

// Farmer submits Aadhaar and selfie
router.post(
  '/submit-verification',
  authMiddleware,
  upload.fields([
    { name: 'aadhaar', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ]),
  submitVerification
);

export default router;
