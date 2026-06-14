import api from './api';

/** @typedef {import('@/types/ai.types').ForecastResult} ForecastResult */
/** @typedef {import('@/types/ai.types').AIInsight} AIInsight */
/** @typedef {import('@/types/ai.types').ChatMessage} ChatMessage */

export async function getForecast(medicineId) {
  const response = await api.get('/ai/forecast', { params: { medicineId } });
  return response.data;
}

export async function getInsights() {
  const response = await api.get('/ai/insights');
  return response.data;
}

export async function getChatHistory() {
  const response = await api.get('/ai/chat/history');
  return response.data;
}

export async function sendChatMessage(message) {
  const response = await api.post('/ai/chat', { message });
  return response.data;
}
