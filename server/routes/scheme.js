import express from 'express';
import { authMiddleware as verifyToken, authorize } from '../middleware/auth.js';
import {
    createScheme,
    getAllSchemes,
    updateScheme,
    getActiveSchemes
} from '../controllers/schemeController.js';

const router = express.Router();

// Public/Farmer Routes
router.get('/active', verifyToken, getActiveSchemes);

// Admin Routes
router.post('/', verifyToken, authorize('ADMIN'), createScheme);
router.get('/', verifyToken, authorize('ADMIN'), getAllSchemes);
router.put('/:id', verifyToken, authorize('ADMIN'), updateScheme);

export default router;
