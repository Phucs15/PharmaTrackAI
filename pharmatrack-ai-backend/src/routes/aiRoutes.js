import { Router } from 'express';
import {
  getForecast,
  getInsights,
  getChatHistory,
  postChatMessage,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { MANAGEMENT_ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect, authorize(...MANAGEMENT_ROLES), aiLimiter);

router.get('/forecast', getForecast);
router.get('/insights', getInsights);
router.get('/chat/history', getChatHistory);
router.post('/chat', postChatMessage);

export default router;
