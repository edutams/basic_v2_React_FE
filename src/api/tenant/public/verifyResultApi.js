import axios from 'axios';
import { getApiBaseURL } from '@/api/tenant/tenant_api';

// Public, unauthenticated verify-result route — the link a parent taps in
// the Result → Messaging email/SMS/WhatsApp carries the school and
// registration ids in the path, so there is no session, no X-Tenant-ID
// header and no bearer token to send. This instance therefore sets only the
// API origin and never attaches credentials.
const verifyResultApi = axios.create({ baseURL: '/' });

verifyResultApi.interceptors.request.use((config) => {
  config.baseURL = getApiBaseURL();
  return config;
});

/**
 * Full report-card payload for one registration, plus the school branding
 * its header needs.
 *
 * @returns {Promise<{status: boolean, data?: object, message?: string, reason?: string}>}
 */
export const fetchVerifyResult = async (tenantId, regId) => {
  const response = await verifyResultApi.get(`/v1/public/verify-result/${tenantId}/${regId}`);
  return response.data;
};

export default verifyResultApi;
