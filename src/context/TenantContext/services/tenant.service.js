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

export const getSetupStats = async () => {
  try {
    const res = await api.get('school_setup/stats');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSetupStage = async () => {
  try {
    const res = await api.get('school_setup/stage');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getClasses = async () => {
  try {
    const res = await api.get('school_setup/classes');
    return res.data?.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const saveClasses = async (classes) => {
  try {
    const res = await api.post('school_setup/classes', { classes });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
