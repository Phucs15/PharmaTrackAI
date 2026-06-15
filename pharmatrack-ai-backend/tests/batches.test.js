import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import Medicine from '../src/models/Medicine.js';
import Batch from '../src/models/Batch.js';
import { createUser, authHeader } from './helpers.js';
import { ROLES } from '../src/constants/roles.js';

let admin;
let staff;
let medicine;

beforeEach(async () => {
  admin = await createUser({ role: ROLES.ADMIN });
  staff = await createUser({ role: ROLES.STAFF });
  medicine = await Medicine.create({
    code: 'MED-100',
    name: 'Ibuprofen',
    category: 'Analgesics',
    manufacturer: 'Acme Pharma',
    unitType: 'Tablets (bx)',
    reorderLevel: 10,
  });
});

function batchPayload() {
  return {
    batchNumber: 'BATCH-100',
    medicineId: medicine._id.toString(),
    medicineName: medicine.name,
    facility: 'Boston Central Hub',
    quantity: 100,
    unitType: 'Tablets (bx)',
    mfgDate: '2024-01-01',
    expDate: '2026-01-01',
  };
}

describe('GET /api/batches', () => {
  it('allows Warehouse Staff to read batches', async () => {
    await Batch.create(batchPayload());
    const res = await request(app).get('/api/batches').set(authHeader(staff));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });
});

describe('POST /api/batches', () => {
  it('forbids Warehouse Staff from creating a batch', async () => {
    const res = await request(app).post('/api/batches').set(authHeader(staff)).send(batchPayload());

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('allows an Administrator to create a batch', async () => {
    const res = await request(app).post('/api/batches').set(authHeader(admin)).send(batchPayload());

    expect(res.status).toBe(201);
    expect(res.body.batchNumber).toBe('BATCH-100');
  });
});

describe('PUT /api/batches/:id', () => {
  it('forbids Warehouse Staff from updating a batch', async () => {
    const batch = await Batch.create(batchPayload());
    const res = await request(app).put(`/api/batches/${batch._id}`).set(authHeader(staff)).send({ quantity: 5 });

    expect(res.status).toBe(403);
  });

  it('allows an Administrator to update a batch', async () => {
    const batch = await Batch.create(batchPayload());
    const res = await request(app).put(`/api/batches/${batch._id}`).set(authHeader(admin)).send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);
  });
});

describe('DELETE /api/batches/:id', () => {
  it('forbids Warehouse Staff from deleting a batch', async () => {
    const batch = await Batch.create(batchPayload());
    const res = await request(app).delete(`/api/batches/${batch._id}`).set(authHeader(staff));

    expect(res.status).toBe(403);
  });
});
