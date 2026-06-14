import mongoose from 'mongoose';
import { MEDICINE_CATEGORIES, UNIT_TYPES } from '../constants/medicineOptions.js';
import { computeMedicineStatus, computeFacilityStatus } from '../utils/statusHelpers.js';

const stockByFacilitySchema = new mongoose.Schema(
  {
    facility: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const medicineSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: MEDICINE_CATEGORIES, required: true },
  manufacturer: { type: String, required: true },
  unitType: { type: String, enum: UNIT_TYPES, required: true },
  unitPrice: { type: Number, default: 0 },
  totalStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, required: true, default: 0 },
  storageNotes: { type: String, default: '' },
  stockByFacility: { type: [stockByFacilitySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

/** 'Critical Low' | 'Reorder Soon' | 'Optimal', derived from totalStock vs reorderLevel. */
medicineSchema.virtual('status').get(function () {
  return computeMedicineStatus(this.totalStock, this.reorderLevel);
});

// totalStock always equals the sum of per-facility stock, matching the mock data invariant.
medicineSchema.pre('validate', function (next) {
  if (this.stockByFacility && this.stockByFacility.length > 0) {
    this.totalStock = this.stockByFacility.reduce((sum, entry) => sum + (entry.stock || 0), 0);
  }
  next();
});

medicineSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;

    if (Array.isArray(ret.stockByFacility)) {
      const facilityCount = ret.stockByFacility.length || 1;
      ret.stockByFacility = ret.stockByFacility.map((entry) => ({
        ...entry,
        status: computeFacilityStatus(entry.stock, ret.reorderLevel, facilityCount),
      }));
    }

    return ret;
  },
});

export default mongoose.model('Medicine', medicineSchema);
