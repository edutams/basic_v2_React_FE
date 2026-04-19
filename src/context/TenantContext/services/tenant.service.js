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
export const getClassArms = async (class_id) => {
  try {
    const res = await api.get('school_setup/student/get_class_arms', { params: { class_id } });
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

export const getClassesWithDivisions = async () => {
  try {
    const res = await api.get('school_setup/classes');
    const responseData = res.data;

    console.log('Full API Response:', responseData);

    // Handle the response structure { status: true, data: [divisions], message: "..." }
    const data = responseData?.data || responseData || [];

    // If data is not an array or is empty, return empty array
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    // If data contains divisions with classes, flatten it
    const classes = [];
    data.forEach((division) => {
      // Check if it's a division (has programmes) or already a class
      if (division.programmes && Array.isArray(division.programmes)) {
        // It's a division structure
        division.programmes.forEach((programme) => {
          if (programme.classes && Array.isArray(programme.classes)) {
            programme.classes.forEach((cls) => {
              // Expand arms: each arm_name becomes a separate arm object
              const expandedArms = [];
              if (cls.class_arms && cls.class_arms.length > 0) {
                // Use class_arms from API
                cls.class_arms.forEach((arm, index) => {
                  expandedArms.push({
                    id: arm.id,
                    class_id: cls.id,
                    arm_name: arm.arm_name,
                    status: arm.status || 'active',
                  });
                });
              } else if (cls.arms && cls.arms.length > 0) {
                // Already transformed
                cls.arms.forEach((arm) => {
                  expandedArms.push({
                    id: arm.id,
                    class_id: cls.id,
                    arm_name: arm.arm_name,
                  });
                });
              }

              classes.push({
                ...cls,
                id: cls.id,
                division_name: division.div_name,
                school_division_id: division.id,
                arms: expandedArms,
              });
            });
          }
        });
      } else if (division.id && division.class_name) {
        // It's already a class object
        classes.push(division);
      }
    });

    console.log('Transformed classes:', classes);
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
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

// Staff API functions
export const createStaff = async (data) => {
  try {
    const res = await api.post('school_setup/staff/create_staff', data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllStaff = async (params = {}) => {
  try {
    const res = await api.get('school_setup/staff/all', { params });
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
