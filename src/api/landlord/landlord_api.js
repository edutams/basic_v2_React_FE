import axios from 'axios';

const CENTRAL_API_BASE_URL =
  import.meta.env.MODE !== 'production'
    ? import.meta.env.VITE_API_BASE_URL_LOCAL
    : import.meta.env.VITE_API_BASE_URL_PROD;

const api = axios.create({
  baseURL: CENTRAL_API_BASE_URL + '/api/',
});

// ── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = []; // queue requests that came in while refresh is in progress

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh_token');

    // Only attempt refresh on 401, non-auth routes, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await api.post('/v1/landlord/auth/refresh_token');
        const newToken = refreshRes.data.access_token;

        localStorage.setItem('access_token', newToken);
        // Also update expires_in if returned
        if (refreshRes.data.expires_in) {
          localStorage.setItem('token_expires_in', String(refreshRes.data.expires_in));
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('Refresh token failed:', refreshError);

        // Clear storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expires_in');
        localStorage.removeItem('user');
        localStorage.removeItem('roles');
        localStorage.removeItem('permissions');

        // ← Use React Router history instead of hard redirect
        // so ProtectedRoute can capture `from` properly.
        // We dispatch a custom event that AuthContext listens to.
        window.dispatchEvent(new CustomEvent('auth:expired'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
