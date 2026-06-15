import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('security headers and error shapes', () => {
  it('sets helmet security headers', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('returns 401 with a JSON error for protected routes without a token', async () => {
    const res = await request(app).get('/api/medicines');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('rejects an invalid bearer token', async () => {
    const res = await request(app).get('/api/medicines').set('Authorization', 'Bearer not-a-real-token');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });
});

describe('rate limiting on /api/auth/login', () => {
  it('adds RateLimit-* headers', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong' });

    const hasRateLimitHeader = Object.keys(res.headers).some((key) => key.toLowerCase().startsWith('ratelimit'));
    expect(hasRateLimitHeader).toBe(true);
  });
});
