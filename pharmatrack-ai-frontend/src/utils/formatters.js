const numberFormatter = new Intl.NumberFormat('en-US');

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** 12450 -> "12,450" */
export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return numberFormatter.format(value);
}

/** 1240000 -> "$1,240,000.00" */
export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return currencyFormatter.format(value);
}

/** "2025-11-30" -> "Nov 30, 2025" */
export function formatDate(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
}

/** "2025-11-30T09:42:00" -> "Nov 30, 9:42 AM" */
export function formatDateTime(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateTimeFormatter.format(date);
}

/** Returns the number of whole days between today and the given date (negative if in the past). */
export function daysUntil(value) {
  if (!value) return null;
  const target = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** "Tablets (bx)" -> "bx" */
export function getUnitAbbreviation(unitType = '') {
  const match = unitType.match(/\(([^)]+)\)/);
  return match ? match[1] : unitType;
}

/** "warehouse manager" -> "WM" */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
