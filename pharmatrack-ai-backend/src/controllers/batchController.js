import Batch from '../models/Batch.js';
import Medicine from '../models/Medicine.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchRegex } from '../utils/queryHelpers.js';

// GET /api/batches?medicineId=&status=&facility=&search=
export const getBatches = asyncHandler(async (req, res) => {
  const { medicineId, status, facility, search } = req.query;
  const filter = {};

  if (medicineId) filter.medicineId = medicineId;
  if (facility) filter.facility = facility;

  if (search) {
    const regex = searchRegex(search);
    filter.$or = [{ batchNumber: regex }, { medicineName: regex }];
  }

  let batches = await Batch.find(filter).sort({ createdAt: -1 });
  let results = batches.map((batch) => batch.toJSON());

  // status (Safe/Near Expiry/Expired) is a derived virtual, so filter in memory.
  if (status) {
    results = results.filter((batch) => batch.status === status);
  }

  res.json(results);
});

// GET /api/batches/:id
export const getBatchById = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) {
    throw new ApiError(404, `Batch with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  res.json(batch.toJSON());
});

// POST /api/batches
export const createBatch = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (!payload.medicineName && payload.medicineId) {
    const medicine = await Medicine.findById(payload.medicineId);
    if (medicine) payload.medicineName = medicine.name;
  }

  const batch = await Batch.create(payload);
  res.status(201).json(batch.toJSON());
});

// PUT /api/batches/:id
export const updateBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) {
    throw new ApiError(404, `Batch with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }

  Object.assign(batch, req.body);
  await batch.save();
  res.json(batch.toJSON());
});

// DELETE /api/batches/:id
export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    throw new ApiError(404, `Batch with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  res.json({ success: true });
});
