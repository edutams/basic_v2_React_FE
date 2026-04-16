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
    const data = res.data?.data || res.data || [];

    // If data contains divisions with classes, flatten it
    const classes = [];
    data.forEach((division) => {
      if (division.classes && Array.isArray(division.classes)) {
        division.classes.forEach((cls) => {
          // Expand arms: each arm_name becomes a separate arm object
          const expandedArms = [];
          if (cls.arms && cls.arms.length > 0) {
            const firstArm = cls.arms[0];
            const armNames = firstArm.arm_names || [];
            armNames.forEach((armName, index) => {
              expandedArms.push({
                id: `${cls.id}-arm-${index}`, // Create unique ID
                class_id: cls.id,
                no_of_arms: armNames.length,
                arm_names: [armName], // Single arm name
                order: index,
                status: firstArm.status || 'active',
                arm_name: armName, // For display convenience
              });
            });
          }

          classes.push({
            ...cls,
            id: cls.id,
            division_name: division.div_name,
            school_division_id: division.id,
            no_of_arms: expandedArms.length || cls.no_of_arms || 0,
            arms: expandedArms,
            arm_names: expandedArms.map((a) => a.arm_name),
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
