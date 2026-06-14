import { Router } from 'express';
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { MANAGEMENT_ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/', authorize(...MANAGEMENT_ROLES), createBatch);
router.put('/:id', authorize(...MANAGEMENT_ROLES), updateBatch);
router.delete('/:id', authorize(...MANAGEMENT_ROLES), deleteBatch);

export default router;
