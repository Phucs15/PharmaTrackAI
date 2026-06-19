import AuditLog from '../models/AuditLog.js';

/**
 * Fire-and-forget audit helper. Failures are logged but never propagate to the caller.
 *
 * @param {import('express').Request} req
 * @param {{ action: string, entity: string, entityId?: any, entityName?: string, details?: any }} entry
 */
export async function logAudit(req, { action, entity, entityId, entityName, details }) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: entityId ?? undefined,
      entityName: entityName ?? undefined,
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      ip: req.ip,
      details: details ?? undefined,
    });
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err.message);
  }
}
