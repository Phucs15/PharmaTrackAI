import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Medicine from '../src/models/Medicine.js';
import { createUser, authHeader } from './helpers.js';
import { ROLES } from '../src/constants/roles.js';

const MEDICINE_PAYLOAD = {
  code: 'MED-001',
  name: 'Amoxicillin',
  category: 'Antibiotics',
  manufacturer: 'Acme Pharma',
  unitType: 'Tablets (bx)',
  reorderLevel: 10,
};

let admin;
let staff;

beforeEach(async () => {
  admin = await createUser({ role: ROLES.ADMIN });
  staff = await createUser({ role: ROLES.STAFF });
});

describe('GET /api/medicines', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/medicines');
    expect(res.status).toBe(401);
  });

  it('returns a plain array when no pagination params are given', async () => {
    await Medicine.create(MEDICINE_PAYLOAD);
    const res = await request(app).get('/api/medicines').set(authHeader(staff));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it('paginates when page/limit are given', async () => {
    for (let i = 0; i < 3; i += 1) {
      await Medicine.create({ ...MEDICINE_PAYLOAD, code: `MED-00${i}` });
    }

    const res = await request(app).get('/api/medicines?page=1&limit=2').set(authHeader(staff));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });
});

describe('POST /api/medicines', () => {
  it('forbids Warehouse Staff from creating medicines', async () => {
    const res = await request(app).post('/api/medicines').set(authHeader(staff)).send(MEDICINE_PAYLOAD);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows an Administrator to create a medicine', async () => {
    const res = await request(app).post('/api/medicines').set(authHeader(admin)).send(MEDICINE_PAYLOAD);

    expect(res.status).toBe(201);
    expect(res.body.code).toBe('MED-001');
    expect(res.body.id).toBeTypeOf('string');
  });
});

describe('PUT /api/medicines/:id', () => {
  it('applies whitelisted fields but ignores unknown/protected fields (mass-assignment protection)', async () => {
    const medicine = await Medicine.create(MEDICINE_PAYLOAD);
    const res = await request(app)
      .put(`/api/medicines/${medicine._id}`)
      .set(authHeader(admin))
      .send({ unitPrice: 12.5, _id: 'should-not-change', createdAt: '2000-01-01T00:00:00.000Z', notAField: 'ignored' });

    expect(res.status).toBe(200);
    expect(res.body.unitPrice).toBe(12.5);
    expect(res.body.id).toBe(medicine._id.toString());
    expect(res.body.notAField).toBeUndefined();
  });

  it('forbids Warehouse Staff from updating medicines', async () => {
    const medicine = await Medicine.create(MEDICINE_PAYLOAD);
    const res = await request(app).put(`/api/medicines/${medicine._id}`).set(authHeader(staff)).send({ unitPrice: 1 });

    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent medicine', async () => {
    const res = await request(app)
      .put('/api/medicines/000000000000000000000000')
      .set(authHeader(admin))
      .send({ unitPrice: 1 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/medicines/:id', () => {
  it('forbids Warehouse Staff', async () => {
    const medicine = await Medicine.create(MEDICINE_PAYLOAD);
    const res = await request(app).delete(`/api/medicines/${medicine._id}`).set(authHeader(staff));

    expect(res.status).toBe(403);
  });

  it('allows a Warehouse Manager to delete', async () => {
    const manager = await createUser({ role: ROLES.MANAGER });
    const medicine = await Medicine.create(MEDICINE_PAYLOAD);
    const res = await request(app).delete(`/api/medicines/${medicine._id}`).set(authHeader(manager));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
  });
});
