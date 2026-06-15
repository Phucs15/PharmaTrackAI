import { describe, it, expect } from 'vitest';
import { decodeToken } from './jwt';

function encodeSegment(value) {
  const json = JSON.stringify(value);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeToken(payload, header = { alg: 'HS256', typ: 'JWT' }) {
  return `${encodeSegment(header)}.${encodeSegment(payload)}.signature`;
}

describe('decodeToken', () => {
  it('returns null for a falsy token', () => {
    expect(decodeToken(null)).toBeNull();
    expect(decodeToken(undefined)).toBeNull();
    expect(decodeToken('')).toBeNull();
  });

  it('returns null for a malformed token', () => {
    expect(decodeToken('not-a-jwt')).toBeNull();
  });

  it('decodes the payload of a well-formed token', () => {
    const token = makeToken({ sub: 'user-1', email: 'admin@pharmatrack.com', role: 'Administrator' });
    const payload = decodeToken(token);

    expect(payload).toMatchObject({ sub: 'user-1', email: 'admin@pharmatrack.com', role: 'Administrator' });
  });

  it('returns the payload when exp is in the future (seconds since epoch)', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = makeToken({ sub: 'user-1', exp });

    expect(decodeToken(token)).toMatchObject({ sub: 'user-1', exp });
  });

  it('returns null when exp is in the past (seconds since epoch)', () => {
    const exp = Math.floor(Date.now() / 1000) - 3600;
    const token = makeToken({ sub: 'user-1', exp });

    expect(decodeToken(token)).toBeNull();
  });
});
