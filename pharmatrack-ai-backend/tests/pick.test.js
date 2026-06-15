import { describe, it, expect } from 'vitest';
import { pick } from '../src/utils/pick.js';

describe('pick', () => {
  it('keeps only the requested keys that are present', () => {
    const input = { name: 'Aspirin', role: 'Administrator', _id: 'abc123' };
    expect(pick(input, ['name', 'role'])).toEqual({ name: 'Aspirin', role: 'Administrator' });
  });

  it('omits keys that are not present in the source object', () => {
    const input = { name: 'Aspirin' };
    expect(pick(input, ['name', 'role'])).toEqual({ name: 'Aspirin' });
  });

  it('drops keys not in the whitelist (mass-assignment protection)', () => {
    const input = { name: 'Aspirin', role: 'Administrator', _id: 'abc123', createdAt: '2024-01-01' };
    expect(pick(input, ['name'])).toEqual({ name: 'Aspirin' });
  });

  it('returns an empty object for an empty whitelist', () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({});
  });

  it('does not mutate the source object', () => {
    const input = { name: 'Aspirin', role: 'Administrator' };
    pick(input, ['name']);
    expect(input).toEqual({ name: 'Aspirin', role: 'Administrator' });
  });
});
