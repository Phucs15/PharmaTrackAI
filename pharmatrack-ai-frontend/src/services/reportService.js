import api from './api';

/** @typedef {import('@/types/report.types').ChartPoint} ChartPoint */

export async function getInventorySummary() {
  const response = await api.get('/reports/inventory-summary');
  return response.data;
}

export async function getExpiryReport() {
  const response = await api.get('/reports/expiry');
  return response.data;
}

export async function getStockMovement() {
  const response = await api.get('/reports/stock-movement');
  return response.data;
}

export async function exportReport(reportType, format) {
  const response = await api.get(`/reports/${reportType}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return response.data;
}
