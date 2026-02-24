import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api/v1',
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
    const isAuthRequest = originalRequest.url.includes('/agent/login') || originalRequest.url.includes('/agent/refresh_token');

    console.log('Interceptor 401 check:', {
      url: originalRequest.url,
      status: error.response?.status,
      _retry: originalRequest._retry,
      isAuthRequest: isAuthRequest
    });

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post('/agent/refresh_token');
        const newToken = refreshRes.data.access_token;
        localStorage.setItem('access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        localStorage.removeItem('access_token');
        if (window.location.pathname !== '/agent/login') {
          window.location.href = '/agent/login';
        }
      }
    }

    // If it's a 401 on an auth request, or refresh failed, just reject it
    return Promise.reject(error);
  },
);

export default api;
