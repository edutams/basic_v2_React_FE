import axios from 'axios';

const getTenantBaseURL = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Dynamically detect the central domain (e.g., 'basic_v2.test')
    // For local dev like 'basic_v2.test', it's the last two parts.
    // For 'olamide.basic_v2.test', it's also the last two parts.
    const centralDomain = parts.slice(-2).join('.');
    
    // Check if we are on a subdomain
    if (parts.length > 2) {
        // Use the protocol from the current page
        const protocol = window.location.protocol;
        return `${protocol}//${hostname}/api/v1`;
    }

    // Default or fallback
    return import.meta.env.VITE_API_BASE_URL + '/api/v1';
};

const tenantApi = axios.create({
  baseURL: getTenantBaseURL(),
});

tenantApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('tenant_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

tenantApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await tenantApi.post('/refresh-token');
        const newToken = refreshRes.data.access_token;
        localStorage.setItem('tenant_access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return tenantApi(originalRequest);
      } catch (refreshError) {
        console.error('Tenant refresh token failed:', refreshError);
        localStorage.removeItem('tenant_access_token');
        // Redirect to tenant login or handle appropriately
        // window.location.href = '/login'; 
      }
    }

    return Promise.reject(error);
  },
);

export default tenantApi;
