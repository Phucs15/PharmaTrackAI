import { Router } from 'express';
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from '../controllers/medicineController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { MANAGEMENT_ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', authorize(...MANAGEMENT_ROLES), createMedicine);
router.put('/:id', authorize(...MANAGEMENT_ROLES), updateMedicine);
router.delete('/:id', authorize(...MANAGEMENT_ROLES), deleteMedicine);

export default router;
