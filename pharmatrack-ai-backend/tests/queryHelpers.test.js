import { describe, it, expect } from 'vitest';
import { escapeRegex, searchRegex, paginateResults } from '../src/utils/queryHelpers.js';

describe('escapeRegex', () => {
  it('escapes regex special characters', () => {
    expect(escapeRegex('a.b*c?')).toBe('a\\.b\\*c\\?');
  });
});

describe('searchRegex', () => {
  it('builds a case-insensitive "contains" regex', () => {
    const regex = searchRegex('amox');
    expect(regex.test('Amoxicillin')).toBe(true);
    expect(regex.test('Paracetamol')).toBe(false);
  });

  it('treats special characters in the query literally', () => {
    const regex = searchRegex('a+b');
    expect(regex.test('a+b')).toBe(true);
    expect(regex.test('aXXXXb')).toBe(false);
  });
});

describe('paginateResults', () => {
  const results = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it('returns the array unchanged when page/limit are absent (backward compatible)', () => {
    expect(paginateResults(results, {})).toBe(results);
  });

  it('returns the array unchanged when page/limit are invalid', () => {
    expect(paginateResults(results, { page: '0', limit: '10' })).toBe(results);
    expect(paginateResults(results, { page: '1', limit: 'abc' })).toBe(results);
    expect(paginateResults(results, { page: '-1', limit: '10' })).toBe(results);
  });

  it('paginates when page/limit are valid positive integers', () => {
    const page1 = paginateResults(results, { page: '1', limit: '10' });
    expect(page1.data).toHaveLength(10);
    expect(page1.data[0]).toEqual({ id: 1 });
    expect(page1.pagination).toEqual({ page: 1, limit: 10, total: 25, totalPages: 3 });

    const page3 = paginateResults(results, { page: '3', limit: '10' });
    expect(page3.data).toHaveLength(5);
    expect(page3.data[0]).toEqual({ id: 21 });
  });

  it('returns an empty data array for a page beyond the total', () => {
    const page = paginateResults(results, { page: '99', limit: '10' });
    expect(page.data).toEqual([]);
    expect(page.pagination).toEqual({ page: 99, limit: 10, total: 25, totalPages: 3 });
  });
});
