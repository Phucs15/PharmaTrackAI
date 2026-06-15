import api from './api';

const TOKEN_KEY = 'pharmatrack_token';
const USER_KEY = 'pharmatrack_user';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  const { user, token } = response.data;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return { user, token };
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function register(payload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put('/auth/me', payload);
  localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  return response.data;
}

export async function changePassword(payload) {
  const response = await api.put('/auth/password', payload);
  return response.data;
}
