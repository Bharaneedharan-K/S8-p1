import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  createOfficer,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getProfileStats,
  updateUser
} from '../controllers/authController.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
// Register (Farmer) - Now supports file uploads
router.post(
  '/register',
  upload.fields([{ name: 'profilePhoto' }, { name: 'aadhaarCard' }]),
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile')
      .matches(/^[0-9]{10}$/)
      .withMessage('Valid 10-digit mobile number is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('district').notEmpty().withMessage('District is required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.get('/profile/stats', authMiddleware, getProfileStats);

// Admin and Officer routes - Get users (officers can see farmers in their district)
router.get('/users', authMiddleware, getAllUsers);

// Admin only routes
router.post(
  '/create-officer',
  authMiddleware,
  authorize('ADMIN'),
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('mobile')
      .matches(/^[0-9]{10}$/)
      .withMessage('Valid 10-digit mobile number is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('district').notEmpty().withMessage('District is required'),
  ],
  createOfficer
);

router.get('/users/:id', authMiddleware, authorize('ADMIN'), getUserById);
router.patch('/users/:id/status', authMiddleware, authorize('ADMIN', 'OFFICER'), updateUserStatus);
router.put('/users/:id', authMiddleware, authorize('ADMIN'), updateUser);

export default router;
