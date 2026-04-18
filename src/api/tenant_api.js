import axios from 'axios';

// const getTenantBaseURL = () => {
//   const hostname = window.location.hostname;
//   const appMode = import.meta.env.MODE;

//   const apiBaseUrl =
//     appMode === 'production'
//       ? import.meta.env.VITE_API_BASE_URL_PROD
//       : import.meta.env.VITE_API_BASE_URL_LOCAL;

//   const subdomain = hostname.split('.')[0];
//   const splitDomain = apiBaseUrl.split('//');
//   const baseDomain = splitDomain[0] + '//' + subdomain + '.' + splitDomain[1];
//   console.log(`${baseDomain}/api/tenant/v1`, 22222);

//   return `${baseDomain}/api/tenant/v1`;
// };
// getTenantBaseURL()

const getTenantBaseURL = () => {

  const appMode = import.meta.env.MODE;

  const apiBaseUrl =
    appMode === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;

  return `${apiBaseUrl}/api/tenant/v1`;
};
// getTenantBaseURL()
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

tenantApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest =
      originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token');

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
      }
    }

    return Promise.reject(error);
  },
);

export default tenantApi;

export const getTenantInfo = async () => {
  const response = await tenantApi.get('/school_setup/get_current_tenant');
  return response.data;
};

export const updateSchoolLogo = async (formData) => {
  const response = await tenantApi.post('/update_school_logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
