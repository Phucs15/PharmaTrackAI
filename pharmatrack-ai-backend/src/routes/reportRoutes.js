import { Router } from 'express';
import {
  getInventorySummary,
  getExpiryReport,
  getStockMovement,
  exportReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { MANAGEMENT_ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect, authorize(...MANAGEMENT_ROLES));

router.get('/inventory-summary', getInventorySummary);
router.get('/expiry', getExpiryReport);
router.get('/stock-movement', getStockMovement);
router.get('/:reportType/export', exportReport);

export default router;
