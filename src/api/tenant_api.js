import axios from 'axios';

const getTenantBaseURL = () => {
  const hostname = window.location.hostname;
  const appMode = import.meta.env.MODE;

  const apiBaseUrl =
    appMode === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;

  const subdomain = hostname.split('.')[0];
  const splitDomain = apiBaseUrl.split('//');
  const baseDomain = splitDomain[0] + '//' + subdomain + '.' + splitDomain[1];
  
  
  // const baseDomain = apiBaseUrl.hostname.split('').slice(-2).join('.');


  // const url = new URL(apiBaseUrl);
  // const baseDomain = url.hostname.split('.').slice(-2).join('.');
  console.log(baseDomain);
  
    // console.log(`${subdomain}.${baseDomain}`)
  return `${baseDomain}/api/tenant/v1`;
};
// getTenantBaseURL()
const tenantApi = axios.create({ baseURL: '/' });

tenantApi.interceptors.request.use((config) => {
  config.baseURL = getTenantBaseURL();
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
    const isAuthRequest =
      originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token');

    // console.log('Tenant Interceptor 401 check:', {
    //   url: originalRequest.url,
    //   status: error.response?.status,
    //   _retry: originalRequest._retry,
    //   isAuthRequest: isAuthRequest
    // });

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
