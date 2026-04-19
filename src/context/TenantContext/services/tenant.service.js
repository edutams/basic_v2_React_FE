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
    console.error(err);
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
    return res.data?.data || res.data || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};
export const getClassesWithDivisions = async () => {
  try {
    const res = await api.get('school_setup/classes');
    const data = res.data?.data || res.data || [];

    // NOTE: The API returns nested structure:
    // data -> divisions -> programmes -> classes -> class_arms
    // We return this original structure for components like SetUpClassesTab
    // that expect this format.
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getClassArms = async (classId) => {
  try {
    const res = await api.get('school_setup/student/get_class_arms', {
      params: { class_id: classId },
    });
    return res.data?.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createLearner = async (data) => {
  try {
    const res = await api.post('school_setup/student/create_student', data);
    return res.data;
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

export const getStudentCountByClass = async () => {
  try {
    const res = await api.get('school_setup/student/get_student_count_by_class');
    return res.data?.data || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getLearnersByClass = async (classId, params = {}) => {
  try {
    const res = await api.get('school_setup/student/get_learners_by_class', {
      params: { class_id: classId, ...params },
    });
    return res.data || { data: [], total: 0, per_page: 10 };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllStaff = async (params = {}) => {
  try {
    const res = await api.get('school_setup/staff/all', { params });
    return res.data || { data: [], total: 0, per_page: 10 };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStaffByClass = async (classId, params = {}) => {
  try {
    const res = await api.get('school_setup/staff/by_class', {
      params: { class_id: classId, ...params },
    });
    return res.data || { data: [], total: 0, per_page: 10 };
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createStaff = async (data) => {
  try {
    const res = await api.post('school_setup/staff/create_staff', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteStaff = async (id) => {
  try {
    const res = await api.delete(`school_setup/staff/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateStaff = async (id, data) => {
  try {
    const res = await api.put(`school_setup/staff/${id}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
