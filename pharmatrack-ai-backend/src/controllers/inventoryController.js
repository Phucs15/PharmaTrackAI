import Transaction from '../models/Transaction.js';
import Batch from '../models/Batch.js';
import Medicine from '../models/Medicine.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchRegex, paginateResults } from '../utils/queryHelpers.js';

// GET /api/inventory/transactions?type=&medicineId=&search=
export const getTransactionHistory = asyncHandler(async (req, res) => {
  const { type, medicineId, search } = req.query;
  const filter = {};

  if (type) filter.type = type;
  if (medicineId) filter.medicineId = medicineId;

  if (search) {
    const regex = searchRegex(search);
    filter.$or = [
      { medicineName: regex },
      { batchId: regex },
      { source: regex },
      { destination: regex },
    ];
  }

  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.json(paginateResults(transactions.map((txn) => txn.toJSON()), req.query));
});

async function resolveMedicineName(payload) {
  if (payload.medicineName || !payload.medicineId) return payload.medicineName;
  const medicine = await Medicine.findById(payload.medicineId);
  return medicine ? medicine.name : payload.medicineName;
}

/** Adjusts a medicine's per-facility stock by `delta` and lets the pre('validate') hook recompute totalStock. */
async function adjustMedicineStock(medicineId, facility, delta) {
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) return;

  const entry = medicine.stockByFacility.find((item) => item.facility === facility);
  if (entry) {
    entry.stock = Math.max(0, entry.stock + delta);
  } else if (delta > 0) {
    medicine.stockByFacility.push({ facility, stock: delta });
  }

  await medicine.save();
}

// POST /api/inventory/in
export const recordInventoryIn = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.medicineName = await resolveMedicineName(payload);

  const transaction = await Transaction.create({
    ...payload,
    type: 'IN',
    status: 'Received',
    date: new Date(),
  });

  if (payload.batchDbId) {
    const quantity = Number(payload.quantity || 0);
    const batch = await Batch.findByIdAndUpdate(
      payload.batchDbId,
      { $inc: { quantity } },
      { new: true }
    );
    if (batch) {
      await adjustMedicineStock(batch.medicineId, batch.facility, quantity);
    }
  }

  res.status(201).json(transaction.toJSON());
});

// POST /api/inventory/out
export const recordInventoryOut = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.medicineName = await resolveMedicineName(payload);

  const requestedQty = Number(payload.quantity || 0);

  if (payload.batchDbId) {
    const batch = await Batch.findById(payload.batchDbId);
    if (!batch) {
      throw new ApiError(404, `Batch with id "${payload.batchDbId}" not found.`, 'NOT_FOUND');
    }

    if (requestedQty > batch.quantity) {
      throw new ApiError(
        400,
        `Quantity exceeds available stock (${batch.quantity}) for batch ${batch.batchNumber}.`,
        'OVERSTOCK',
        { available: batch.quantity }
      );
    }

    batch.quantity -= requestedQty;
    await batch.save();
    await adjustMedicineStock(batch.medicineId, batch.facility, -requestedQty);
  }

  const transaction = await Transaction.create({
    ...payload,
    type: 'OUT',
    status: 'Dispatched',
    date: new Date(),
  });

  res.status(201).json(transaction.toJSON());
});
