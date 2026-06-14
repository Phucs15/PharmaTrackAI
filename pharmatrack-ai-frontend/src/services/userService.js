import api from './api';

/** @typedef {import('@/types/user.types').User} User */

export async function getAll(params) {
  const response = await api.get('/users', { params });
  return response.data;
}

export async function create(payload) {
  const response = await api.post('/users', payload);
  return response.data;
}

export async function update(id, payload) {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
}

export async function remove(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}
