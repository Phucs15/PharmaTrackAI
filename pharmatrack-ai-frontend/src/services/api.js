import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Access token lives in module memory — never touches localStorage.
// The HttpOnly refresh-token cookie (set by the backend) is handled by the browser automatically.
let _accessToken = null;
export const setAccessToken = (token) => { _accessToken = token; };
export const clearAccessToken = () => { _accessToken = null; };

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // needed so the browser sends the HttpOnly refresh-token cookie
});

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// Deduplicate concurrent refresh calls so a burst of 401s only triggers one /auth/refresh.
let _refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Only attempt a silent refresh once per request, and never for auth endpoints themselves.
    const isAuthRoute = original.url?.includes('/auth/refresh') || original.url?.includes('/auth/logout');
    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => { _refreshPromise = null; });
        }
        const { data } = await _refreshPromise;
        setAccessToken(data.token);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        clearAccessToken();
        localStorage.removeItem('pharmatrack_user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
