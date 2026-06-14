/**
 * Decodes a JWT payload without verifying its signature. Used client-side to
 * read basic claims (sub/email/role) and check expiry on the token issued by
 * the backend's /auth/login.
 */

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

/**
 * Decodes a JWT payload. Returns null if malformed or expired. Per the JWT
 * spec, `exp` is in seconds since epoch, so it's compared against
 * `Date.now() / 1000`.
 */
export function decodeToken(token) {
  if (!token) return null;
  try {
    const [, payloadSegment] = token.split('.');
    const payload = base64UrlDecode(payloadSegment);
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
