import api from './api';

/** @typedef {import('@/types/batch.types').Batch} Batch */

export async function getAll(params) {
  const response = await api.get('/batches', { params });
  return response.data;
}

export async function getById(id) {
  const response = await api.get(`/batches/${id}`);
  return response.data;
}

export async function getByMedicine(medicineId) {
  const response = await api.get('/batches', { params: { medicineId } });
  return response.data;
}

export async function create(payload) {
  const response = await api.post('/batches', payload);
  return response.data;
}

export async function update(id, payload) {
  const response = await api.put(`/batches/${id}`, payload);
  return response.data;
}

export async function remove(id) {
  const response = await api.delete(`/batches/${id}`);
  return response.data;
}
