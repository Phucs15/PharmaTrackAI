import api from './api';

/** @typedef {import('@/types/medicine.types').Medicine} Medicine */

export async function getAll(params) {
  const response = await api.get('/medicines', { params });
  return response.data;
}

export async function getById(id) {
  const response = await api.get(`/medicines/${id}`);
  return response.data;
}

export async function create(payload) {
  const response = await api.post('/medicines', payload);
  return response.data;
}

export async function update(id, payload) {
  const response = await api.put(`/medicines/${id}`, payload);
  return response.data;
}

export async function remove(id) {
  const response = await api.delete(`/medicines/${id}`);
  return response.data;
}

export function search(query) {
  return getAll({ search: query });
}
