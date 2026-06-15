import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, authHeader } from './helpers.js';
import { ROLES } from '../src/constants/roles.js';

let admin;
let staff;

beforeEach(async () => {
  admin = await createUser({ role: ROLES.ADMIN });
  staff = await createUser({ role: ROLES.STAFF });
});

describe('GET /api/users', () => {
  it('forbids non-admins', async () => {
    const res = await request(app).get('/api/users').set(authHeader(staff));
    expect(res.status).toBe(403);
  });

  it('allows an Administrator', async () => {
    const res = await request(app).get('/api/users').set(authHeader(admin));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('creates a user with the default temporary password', async () => {
    const res = await request(app).post('/api/users').set(authHeader(admin)).send({
      name: 'New Staff',
      email: 'newstaff@example.com',
      role: ROLES.STAFF,
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('newstaff@example.com');
    expect(res.body.password).toBeUndefined();

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'newstaff@example.com', password: 'changeme123' });
    expect(loginRes.status).toBe(200);
  });
});

describe('PUT /api/users/:id', () => {
  it('ignores password/_id/timestamps injection but applies whitelisted fields', async () => {
    const target = await createUser({ email: 'target@example.com', role: ROLES.STAFF, password: 'password123' });

    const res = await request(app).put(`/api/users/${target._id}`).set(authHeader(admin)).send({
      title: 'Senior Staff',
      password: 'shouldnotapply',
      _id: 'hacked',
      createdAt: '2000-01-01T00:00:00.000Z',
    });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Senior Staff');
    expect(res.body.id).toBe(target._id.toString());

    // password unchanged - original password still works
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'target@example.com', password: 'password123' });
    expect(loginRes.status).toBe(200);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes a user', async () => {
    const target = await createUser({ email: 'todelete@example.com' });
    const res = await request(app).delete(`/api/users/${target._id}`).set(authHeader(admin));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
