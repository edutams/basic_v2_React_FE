import axios from 'axios';

const getTenantBaseURL = () => {
  const appMode = import.meta.env.MODE;
  const apiBaseUrl =
    appMode === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return `${apiBaseUrl}/api/v1/tenant`;
};

const tenantApi = axios.create({ baseURL: '/' });
const hostname = window.location.hostname;

tenantApi.interceptors.request.use((config) => {
  config.baseURL = getTenantBaseURL();
  config.headers['X-Tenant-ID'] = hostname;
  const token = localStorage.getItem('tenant_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Refresh queue (same pattern as agent) ────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

tenantApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url.includes('/login') ||
      originalRequest.url.includes('/refresh_token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return tenantApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await tenantApi.post('/refresh_token');
        const newToken = refreshRes.data.access_token;

        localStorage.setItem('tenant_access_token', newToken);
        if (refreshRes.data.expires_in) {
          localStorage.setItem('tenant_token_expires_in', String(refreshRes.data.expires_in));
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return tenantApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.error('Tenant refresh token failed:', refreshError);

        localStorage.removeItem('tenant_access_token');
        localStorage.removeItem('tenant_token_expires_in');

        // ← Same pattern as agent — dispatch event, let context handle it
        window.dispatchEvent(new CustomEvent('tenant_auth:expired'));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default tenantApi;

// ── Helper exports ───────────────────────────────────────────────
export const getTenantInfo = async () => {
  const response = await tenantApi.get('/school_setup/get_current_tenant');
  return response.data;
};

export const updateSchoolLogo = async (formData) => {
  const response = await tenantApi.post('/school_setup/update_school_logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};