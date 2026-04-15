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
    // The API returns school divisions with their classes nested
    return res.data?.data || res.data || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getClassesWithDivisions = async () => {
  try {
    const res = await api.get('school_setup/classes');
    const data = res.data?.data || res.data || [];

    // If data contains divisions with classes, flatten it
    const classes = [];
    data.forEach((division) => {
      if (division.classes && Array.isArray(division.classes)) {
        division.classes.forEach((cls) => {
          const arms = cls.arms && cls.arms.length > 0 ? cls.arms[0] : null;
          classes.push({
            ...cls,
            id: cls.id,
            division_name: division.div_name,
            school_division_id: division.id,
            no_of_arms: arms?.no_of_arms || 0,
            arm_names: arms?.arm_names || [],
          });
        });
      }
    });

    return classes.length > 0 ? classes : data;
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
