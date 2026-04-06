import axios from 'axios';

const CENTRAL_API_BASE_URL =
  import.meta.env.MODE !== 'production'
    ? import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://127.0.0.1:8000'
    : import.meta.env.VITE_API_BASE_URL_PROD;
    

const api = axios.create({
  baseURL: CENTRAL_API_BASE_URL + '/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post('/auth/refresh');
        const newToken = refreshRes.data.access_token;
        localStorage.setItem('access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('access_token');
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }

    // If it's a 401 on an auth request, or refresh failed, just reject it
    return Promise.reject(error);
  },
);

export default api;
