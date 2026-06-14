import Medicine from '../models/Medicine.js';
import Batch from '../models/Batch.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { formatDate } from '../utils/statusHelpers.js';

const WEEKLY_UNIT_TREND = [
  { label: 'Mon', value: 1200 },
  { label: 'Tue', value: 1950 },
  { label: 'Wed', value: 1350 },
  { label: 'Thu', value: 2400 },
  { label: 'Fri', value: 1800 },
  { label: 'Sat', value: 2700 },
  { label: 'Sun', value: 1000 },
];

const MONTHLY_INVENTORY_TREND = [
  { month: 'Jan', units: 21500 },
  { month: 'Feb', units: 23800 },
  { month: 'Mar', units: 26200 },
  { month: 'Apr', units: 24100 },
  { month: 'May', units: 27400 },
  { month: 'Jun', units: 28007 },
];

// GET /api/reports/inventory-summary
export const getInventorySummary = asyncHandler(async (req, res) => {
  const medicines = await Medicine.find();

  const totalUnits = medicines.reduce((sum, med) => sum + (med.totalStock || 0), 0);

  const categoryTotals = new Map();
  medicines.forEach((med) => {
    categoryTotals.set(med.category, (categoryTotals.get(med.category) || 0) + (med.totalStock || 0));
  });

  const byCategory = Array.from(categoryTotals.entries()).map(([label, value]) => ({
    label,
    value,
  }));

  res.json({
    totalUnits,
    totalSkus: medicines.length,
    byCategory,
    weeklyTrend: WEEKLY_UNIT_TREND,
    monthlyTrend: MONTHLY_INVENTORY_TREND,
    lastUpdated: new Date().toISOString(),
  });
});

// GET /api/reports/expiry
export const getExpiryReport = asyncHandler(async (req, res) => {
  const batches = (await Batch.find()).map((batch) => batch.toJSON());

  const safe = batches.filter((batch) => batch.status === 'Safe');
  const nearExpiry = batches.filter((batch) => batch.status === 'Near Expiry');
  const expired = batches.filter((batch) => batch.status === 'Expired');

  const breakdown = [
    { label: 'Safe', value: safe.length },
    { label: 'Near Expiry', value: nearExpiry.length },
    { label: 'Expired', value: expired.length },
  ];

  const atRiskBatches = [...expired, ...nearExpiry].sort(
    (a, b) => new Date(a.expDate) - new Date(b.expDate)
  );

  res.json({
    totalBatches: batches.length,
    atRiskCount: nearExpiry.length + expired.length,
    breakdown,
    atRiskBatches,
  });
});

// GET /api/reports/stock-movement
export const getStockMovement = asyncHandler(async (req, res) => {
  const transactions = (await Transaction.find().sort({ date: -1 })).map((txn) => txn.toJSON());

  const byDay = new Map();
  transactions.forEach((txn) => {
    const day = formatDate(txn.date);
    const entry = byDay.get(day) || { inbound: 0, outbound: 0 };
    if (txn.type === 'IN') entry.inbound += txn.quantity;
    else entry.outbound += txn.quantity;
    byDay.set(day, entry);
  });

  const series = Array.from(byDay.entries())
    .map(([period, totals]) => ({
      period,
      actual: totals.inbound - totals.outbound,
      inbound: totals.inbound,
      outbound: totals.outbound,
    }))
    .reverse();

  const totalInbound = transactions
    .filter((txn) => txn.type === 'IN')
    .reduce((sum, txn) => sum + txn.quantity, 0);
  const totalOutbound = transactions
    .filter((txn) => txn.type === 'OUT')
    .reduce((sum, txn) => sum + txn.quantity, 0);

  let weeklyChangePercent = 0;
  if (series.length >= 2) {
    const previous = series[series.length - 2].actual;
    const latest = series[series.length - 1].actual;
    if (previous !== 0) {
      weeklyChangePercent = Number((((latest - previous) / Math.abs(previous)) * 100).toFixed(1));
    } else if (latest !== 0) {
      weeklyChangePercent = 100;
    }
  }

  res.json({
    totalInbound,
    totalOutbound,
    weeklyChangePercent,
    series,
  });
});

// GET /api/reports/:reportType/export?format=
export const exportReport = asyncHandler(async (req, res) => {
  const { reportType } = req.params;
  const format = req.query.format || 'pdf';

  res.json({
    success: true,
    filename: `${reportType}-${new Date().toISOString().slice(0, 10)}.${format}`,
    message: 'Report export is not available in the demo environment.',
  });
});
