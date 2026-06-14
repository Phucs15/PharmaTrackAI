import mongoose from 'mongoose';
import { computeBatchStatus } from '../utils/statusHelpers.js';
import { applyIdTransform } from '../utils/schemaPlugins.js';

const batchSchema = new mongoose.Schema(
  {
    batchNumber: { type: String, required: true, unique: true, trim: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    medicineName: { type: String, required: true },
    facility: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    unitType: { type: String, required: true },
    mfgDate: { type: Date, required: true },
    expDate: { type: Date, required: true },
  },
  { timestamps: true }
);

/** 'Safe' | 'Near Expiry' | 'Expired', derived from expDate (90-day near-expiry window). */
batchSchema.virtual('status').get(function () {
  return computeBatchStatus(this.expDate);
});

applyIdTransform(batchSchema);

export default mongoose.model('Batch', batchSchema);
