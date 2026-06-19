import Batch from '../models/Batch.js';
import Medicine from '../models/Medicine.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchRegex, paginateResults } from '../utils/queryHelpers.js';
import { pick } from '../utils/pick.js';
import { logAudit } from '../utils/audit.js';

const UPDATABLE_FIELDS = ['batchNumber', 'medicineId', 'medicineName', 'facility', 'quantity', 'unitType', 'mfgDate', 'expDate'];

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

  res.json(paginateResults(results, req.query));
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
  await logAudit(req, { action: 'CREATE', entity: 'Batch', entityId: batch._id, entityName: batch.batchNumber });
  res.status(201).json(batch.toJSON());
});

// PUT /api/batches/:id
export const updateBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);
  if (!batch) {
    throw new ApiError(404, `Batch with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }

  Object.assign(batch, pick(req.body, UPDATABLE_FIELDS));
  await batch.save();
  await logAudit(req, { action: 'UPDATE', entity: 'Batch', entityId: batch._id, entityName: batch.batchNumber });
  res.json(batch.toJSON());
});

// DELETE /api/batches/:id
export const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);
  if (!batch) {
    throw new ApiError(404, `Batch with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  await logAudit(req, { action: 'DELETE', entity: 'Batch', entityId: batch._id, entityName: batch.batchNumber });
  res.json({ success: true });
});
