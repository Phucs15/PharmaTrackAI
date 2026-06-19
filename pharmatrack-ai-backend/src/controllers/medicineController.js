import Medicine from '../models/Medicine.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchRegex, paginateResults } from '../utils/queryHelpers.js';
import { pick } from '../utils/pick.js';
import { logAudit } from '../utils/audit.js';

const UPDATABLE_FIELDS = [
  'code',
  'name',
  'category',
  'manufacturer',
  'unitType',
  'unitPrice',
  'totalStock',
  'reorderLevel',
  'storageNotes',
  'stockByFacility',
];

// GET /api/medicines?category=&search=
export const getMedicines = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  const filter = {};

  if (category && category !== 'all') {
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  if (search) {
    const regex = searchRegex(search);
    filter.$or = [{ name: regex }, { code: regex }, { manufacturer: regex }];
  }

  const medicines = await Medicine.find(filter).sort({ createdAt: -1 });
  res.json(paginateResults(medicines.map((med) => med.toJSON()), req.query));
});

// GET /api/medicines/:id
export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    throw new ApiError(404, `Medicine with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  res.json(medicine.toJSON());
});

// POST /api/medicines
export const createMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.create(req.body);
  await logAudit(req, { action: 'CREATE', entity: 'Medicine', entityId: medicine._id, entityName: medicine.name });
  res.status(201).json(medicine.toJSON());
});

// PUT /api/medicines/:id
export const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    throw new ApiError(404, `Medicine with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }

  Object.assign(medicine, pick(req.body, UPDATABLE_FIELDS));
  await medicine.save();
  await logAudit(req, { action: 'UPDATE', entity: 'Medicine', entityId: medicine._id, entityName: medicine.name });
  res.json(medicine.toJSON());
});

// DELETE /api/medicines/:id
export const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);
  if (!medicine) {
    throw new ApiError(404, `Medicine with id "${req.params.id}" not found.`, 'NOT_FOUND');
  }
  await logAudit(req, { action: 'DELETE', entity: 'Medicine', entityId: medicine._id, entityName: medicine.name });
  res.json({ success: true });
});
