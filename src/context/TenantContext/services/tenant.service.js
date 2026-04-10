import api from '../../../api/tenant_api';

/**
 * Validates that the given hostname belongs to a registered tenant.
 * Returns the raw response data — caller decides what to do with it.
 */
export const validateTenantDomain = async (hostname = window.location.hostname) => {
  try {
    const res = await api.post('/validate-tenant-domain', { hostname });
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
