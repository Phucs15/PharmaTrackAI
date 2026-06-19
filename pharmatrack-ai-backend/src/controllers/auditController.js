import AuditLog from '../models/AuditLog.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { paginateResults } from '../utils/queryHelpers.js';

// GET /api/audit?entity=&action=&userId=&page=&limit=
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { entity, action, userId } = req.query;
  const filter = {};

  if (entity) filter.entity = entity;
  if (action) filter.action = action;
  if (userId) filter.userId = userId;

  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json(paginateResults(logs.map((log) => log.toJSON()), req.query));
});
