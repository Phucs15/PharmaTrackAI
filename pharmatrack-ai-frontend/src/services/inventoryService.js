import api from './api';

/** @typedef {import('@/types/inventory.types').Transaction} Transaction */

export async function getTransactionHistory(params) {
  const response = await api.get('/inventory/transactions', { params });
  return response.data;
}

export async function recordInventoryIn(payload) {
  const response = await api.post('/inventory/in', payload);
  return response.data;
}

export async function recordInventoryOut(payload) {
  const response = await api.post('/inventory/out', payload);
  return response.data;
}
