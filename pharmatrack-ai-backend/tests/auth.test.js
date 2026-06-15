import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, authHeader } from './helpers.js';
import { ROLES } from '../src/constants/roles.js';

describe('POST /api/auth/register', () => {
  it('registers a new user with the Staff role, even if a different role is requested', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: ROLES.ADMIN, // attempted privilege escalation
    });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe(ROLES.STAFF);
    expect(res.body.email).toBe('newuser@example.com');
    expect(res.body.password).toBeUndefined();
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects duplicate emails', async () => {
    await createUser({ email: 'dupe@example.com' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Dupe',
      email: 'dupe@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE');
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials and returns a token', async () => {
    await createUser({ email: 'login@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('rejects an incorrect password', async () => {
    await createUser({ email: 'login2@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login2@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nope@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('GET /api/auth/me', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns the logged-in user', async () => {
    const user = await createUser({ email: 'me@example.com' });
    const res = await request(app).get('/api/auth/me').set(authHeader(user));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@example.com');
    expect(res.body.password).toBeUndefined();
  });
});

describe('PUT /api/auth/me', () => {
  it('updates whitelisted profile fields', async () => {
    const user = await createUser({ email: 'profile@example.com' });
    const res = await request(app).put('/api/auth/me').set(authHeader(user)).send({
      name: 'Updated Name',
      bio: 'New bio',
      title: 'Pharmacist',
    });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.bio).toBe('New bio');
    expect(res.body.title).toBe('Pharmacist');
  });

  it('ignores attempts to self-escalate role/status', async () => {
    const user = await createUser({ email: 'escalate@example.com', role: ROLES.STAFF });
    const res = await request(app).put('/api/auth/me').set(authHeader(user)).send({
      role: ROLES.ADMIN,
      status: 'Inactive',
      name: 'Still Staff',
    });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe(ROLES.STAFF);
    expect(res.body.status).toBe('Active');
    expect(res.body.name).toBe('Still Staff');
  });

  it('rejects an empty name', async () => {
    const user = await createUser({ email: 'emptyname@example.com' });
    const res = await request(app).put('/api/auth/me').set(authHeader(user)).send({ name: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects changing email to one already in use', async () => {
    await createUser({ email: 'taken@example.com' });
    const user = await createUser({ email: 'self@example.com' });
    const res = await request(app).put('/api/auth/me').set(authHeader(user)).send({ email: 'taken@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE');
  });
});

describe('PUT /api/auth/password', () => {
  it('rejects missing fields', async () => {
    const user = await createUser({ email: 'pw1@example.com' });
    const res = await request(app).put('/api/auth/password').set(authHeader(user)).send({});

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a too-short new password', async () => {
    const user = await createUser({ email: 'pw2@example.com', password: 'password123' });
    const res = await request(app).put('/api/auth/password').set(authHeader(user)).send({
      currentPassword: 'password123',
      newPassword: 'short',
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 (not 401) for a wrong current password, keeping the session valid', async () => {
    const user = await createUser({ email: 'pw3@example.com', password: 'password123' });
    const res = await request(app).put('/api/auth/password').set(authHeader(user)).send({
      currentPassword: 'wrongpassword',
      newPassword: 'newpassword123',
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('changes the password and allows login with the new one', async () => {
    const user = await createUser({ email: 'pw4@example.com', password: 'password123' });
    const res = await request(app).put('/api/auth/password').set(authHeader(user)).send({
      currentPassword: 'password123',
      newPassword: 'newpassword123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'pw4@example.com', password: 'newpassword123' });
    expect(loginRes.status).toBe(200);
  });
});
