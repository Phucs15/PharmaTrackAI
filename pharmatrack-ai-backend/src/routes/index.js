import { Router } from 'express';
import authRoutes from './authRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import batchRoutes from './batchRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import userRoutes from './userRoutes.js';
import reportRoutes from './reportRoutes.js';
import aiRoutes from './aiRoutes.js';
import auditRoutes from './auditRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/batches', batchRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);
router.use('/ai', aiRoutes);
router.use('/audit', auditRoutes);

export default router;
