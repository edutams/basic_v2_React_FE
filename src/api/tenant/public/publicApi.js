import api from '@/api/tenant/tenant_api';

// Public, unauthenticated snapshot of school-level state for the tenant
// login page's pre-login cards (admission open? result published?). Safe to
// call before login — the backend route sits outside auth:tenant and only
// ever returns yes/no facts plus a term label.
export const fetchLandingStatus = async () => {
  const response = await api.get('/public/landing-status');
  return response.data;
};
