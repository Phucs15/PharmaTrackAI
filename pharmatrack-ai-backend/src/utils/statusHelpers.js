/**
 * Derived-status helpers. These mirror the ratio rules implicit in the
 * frontend's mock data (verified against all 10 mock medicines and all
 * 8 mock batches in pharmatrack-ai-frontend) so the API returns the same
 * status labels the UI already shows in mock mode.
 */

const NEAR_EXPIRY_THRESHOLD_DAYS = 90;

/** Whole days between today and `value` (negative if `value` is in the past). */
export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** 'Safe' | 'Near Expiry' | 'Expired' based on a batch's expiry date. */
export function computeBatchStatus(expDate) {
  const remaining = daysUntil(expDate);
  if (remaining === null) return 'Safe';
  if (remaining < 0) return 'Expired';
  if (remaining <= NEAR_EXPIRY_THRESHOLD_DAYS) return 'Near Expiry';
  return 'Safe';
}

function ratioStatus(stock, threshold, labels) {
  if (!threshold || threshold <= 0) return labels[2];
  const ratio = stock / threshold;
  if (ratio < 0.5) return labels[0];
  if (ratio < 1) return labels[1];
  return labels[2];
}

/** 'Critical Low' | 'Reorder Soon' | 'Optimal' based on totalStock vs reorderLevel. */
export function computeMedicineStatus(totalStock, reorderLevel) {
  return ratioStatus(totalStock, reorderLevel, ['Critical Low', 'Reorder Soon', 'Optimal']);
}

/** 'Critical Low' | 'Low Stock' | 'Healthy' for one facility's share of a medicine's reorder level. */
export function computeFacilityStatus(stock, reorderLevel, facilityCount = 1) {
  const share = reorderLevel / Math.max(facilityCount, 1);
  return ratioStatus(stock, share, ['Critical Low', 'Low Stock', 'Healthy']);
}

/** "2026-06-11T09:42:00.000Z" -> "Jun 11, 2026" (matches frontend's formatDate). */
export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}
