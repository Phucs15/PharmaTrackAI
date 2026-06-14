import mongoose from 'mongoose';
import { applyIdTransform } from '../utils/schemaPlugins.js';

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['IN', 'OUT'], required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  medicineName: { type: String, required: true },
  batchId: { type: String, required: true },
  batchDbId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  quantity: { type: Number, required: true },
  unitType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  source: { type: String },
  destination: { type: String },
  status: { type: String, required: true },
  notes: { type: String },
});

applyIdTransform(transactionSchema);

export default mongoose.model('Transaction', transactionSchema);
