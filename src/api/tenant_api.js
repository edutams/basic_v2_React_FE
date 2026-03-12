import axios from 'axios';

const getTenantBaseURL = () => {
  const hostname = window.location.hostname;

  const centralDomain =
    hostname === "localhost"
      ? import.meta.env.VITE_CENTRAL_DOMAIN_LOCAL
      : import.meta.env.VITE_CENTRAL_DOMAIN_PROD;


  const isTenantSubdomain =
    hostname !== centralDomain &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1";

  if (isTenantSubdomain) {
    return `${window.location.protocol}//${hostname}/api/v1`;
  }

  // fallback, if not tenant
  return (
    (window.location.hostname === "localhost"
      ? import.meta.env.VITE_API_BASE_URL_LOCAL
      : import.meta.env.VITE_API_BASE_URL_PROD) + "/api/v1"
  );
}

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
    const isAuthRequest = originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token');

    console.log('Tenant Interceptor 401 check:', {
      url: originalRequest.url,
      status: error.response?.status,
      _retry: originalRequest._retry,
      isAuthRequest: isAuthRequest
    });

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
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
