import mongoose from 'mongoose';
import { applyIdTransform } from '../utils/schemaPlugins.js';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'PASSWORD_CHANGE', 'PASSWORD_RESET'],
      required: true,
    },
    entity: { type: String, required: true }, // e.g. 'Medicine', 'Batch', 'User', 'Auth'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    entityName: { type: String }, // human-readable label (e.g. medicine name)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    userRole: { type: String },
    ip: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }, // { before, after } or extra context
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

applyIdTransform(auditLogSchema);

export default mongoose.model('AuditLog', auditLogSchema);
