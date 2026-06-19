import api, { setAccessToken, clearAccessToken } from './api';

const USER_KEY = 'pharmatrack_user';

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  const { user, token } = response.data;
  setAccessToken(token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { user, token };
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore — clear local state regardless of server response.
  }
  clearAccessToken();
  localStorage.removeItem(USER_KEY);
}

/** Silently renews the access token using the HttpOnly refresh-token cookie.
 *  Returns { token, user } on success; throws on failure (no valid cookie). */
export async function refreshToken() {
  const response = await api.post('/auth/refresh');
  const { token, user } = response.data;
  setAccessToken(token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token, user };
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

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(token, newPassword) {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
}
