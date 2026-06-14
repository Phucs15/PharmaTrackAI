import { Router } from 'express';
import {
  getTransactionHistory,
  recordInventoryIn,
  recordInventoryOut,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/transactions', getTransactionHistory);
router.post('/in', recordInventoryIn);
router.post('/out', recordInventoryOut);

export default router;
