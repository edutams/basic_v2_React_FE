import tenantApi from './tenant_api';

const allocationApi = {
  // Class Teacher Allocations
  getClassTeacherAllocations: async (params = {}) => {
    const response = await tenantApi.get('/school_setup/allocations/class-teacher', { params });
    return response.data;
  },

  saveClassTeacherAllocations: async (data) => {
    const response = await tenantApi.post('/school_setup/allocations/class-teacher', data);
    return response.data;
  },

  removeClassTeacherAllocation: async (id) => {
    const response = await tenantApi.delete(`/school_setup/allocations/class-teacher/${id}`);
    return response.data;
  },

  // Subject Teacher Allocations
  getSubjectTeacherAllocations: async (params = {}) => {
    const response = await tenantApi.get('/school_setup/allocations/subject-teacher', { params });
    return response.data;
  },

  saveSubjectTeacherAllocations: async (data) => {
    const response = await tenantApi.post('/school_setup/allocations/subject-teacher', data);
    return response.data;
  },

  removeSubjectTeacherAllocation: async (id) => {
    const response = await tenantApi.delete(`/school_setup/allocations/subject-teacher/${id}`);
    return response.data;
  },
};

export default allocationApi;
