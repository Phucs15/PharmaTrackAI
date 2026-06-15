import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  daysUntil,
  getUnitAbbreviation,
  getInitials,
} from './formatters';

describe('formatNumber', () => {
  it('formats with thousands separators', () => {
    expect(formatNumber(12450)).toBe('12,450');
  });

  it('returns "-" for null, undefined, or NaN', () => {
    expect(formatNumber(null)).toBe('-');
    expect(formatNumber(undefined)).toBe('-');
    expect(formatNumber(Number.NaN)).toBe('-');
  });
});

describe('formatCurrency', () => {
  it('formats as USD currency', () => {
    expect(formatCurrency(1240000)).toBe('$1,240,000.00');
  });

  it('returns "-" for null, undefined, or NaN', () => {
    expect(formatCurrency(null)).toBe('-');
    expect(formatCurrency(undefined)).toBe('-');
    expect(formatCurrency(Number.NaN)).toBe('-');
  });
});

describe('formatDate', () => {
  it('formats a date string', () => {
    expect(formatDate('2025-11-30')).toBe('Nov 30, 2025');
  });

  it('returns "-" for falsy or invalid values', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('')).toBe('-');
    expect(formatDate('not-a-date')).toBe('-');
  });
});

describe('formatDateTime', () => {
  it('formats a date-time string', () => {
    expect(formatDateTime('2025-11-30T09:42:00')).toBe('Nov 30, 9:42 AM');
  });

  it('returns "-" for falsy or invalid values', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime('not-a-date')).toBe('-');
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    expect(daysUntil(new Date())).toBe(0);
  });

  it('returns a positive number of days for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(daysUntil(future)).toBe(5);
  });

  it('returns a negative number of days for a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysUntil(past)).toBe(-3);
  });

  it('returns null for falsy or invalid values', () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil('not-a-date')).toBeNull();
  });
});

describe('getUnitAbbreviation', () => {
  it('extracts the abbreviation inside parentheses', () => {
    expect(getUnitAbbreviation('Tablets (bx)')).toBe('bx');
  });

  it('returns the original string when there are no parentheses', () => {
    expect(getUnitAbbreviation('Vials')).toBe('Vials');
  });

  it('returns an empty string for the default argument', () => {
    expect(getUnitAbbreviation()).toBe('');
  });
});

describe('getInitials', () => {
  it('returns up to two uppercase initials', () => {
    expect(getInitials('warehouse manager')).toBe('WM');
  });

  it('handles a single name', () => {
    expect(getInitials('Admin')).toBe('A');
  });

  it('returns an empty string for the default argument', () => {
    expect(getInitials()).toBe('');
  });

  it('ignores extra whitespace between words', () => {
    expect(getInitials('  Jane   Doe  ')).toBe('JD');
  });
});
