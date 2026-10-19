import tenantApi from '@/api/tenant/tenant_api';

const allocationApi = {
  // Coverage stats for the Class & Subject Allocations tab's header cards
  getAllocationStats: async (params = {}) => {
    const response = await tenantApi.get('/allocations/stats', { params });
    return response.data;
  },

  // Class Teacher Allocations
  getClassTeacherAllocations: async (params = {}) => {
    const response = await tenantApi.get('/allocations/class-teacher', { params });
    return response.data;
  },

  saveClassTeacherAllocations: async (data) => {
    const response = await tenantApi.post('/allocations/class-teacher', data);
    return response.data;
  },

  // Whether a teacher already holds a different active class teacher
  // assignment this term — informational, for a warn-but-allow prompt.
  checkClassTeacherConflict: async (params) => {
    const response = await tenantApi.get('/allocations/class-teacher/check-conflict', { params });
    return response.data;
  },

  removeClassTeacherAllocation: async (id) => {
    const response = await tenantApi.delete(`/allocations/class-teacher/${id}`);
    return response.data;
  },

  // Ranked teaching-staff candidates by lightest current load — the
  // "Suggested Teachers" panel.
  getSuggestedClassTeachers: async (params = {}) => {
    const response = await tenantApi.get('/allocations/class-teacher/suggested-teachers', {
      params,
    });
    return response.data;
  },

  // Fills every class-teacher gap in a programme with the least-loaded
  // available teacher — never touches an arm that already has one.
  autoAllocateClassTeachers: async (data) => {
    const response = await tenantApi.post('/allocations/class-teacher/auto-allocate', data);
    return response.data;
  },

  downloadClassTeacherTemplate: async (params) => {
    const response = await tenantApi.get('/allocations/class-teacher/template', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  uploadClassTeacherTemplate: async (file, sessionTermId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_term_id', sessionTermId);
    const response = await tenantApi.post('/allocations/class-teacher/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getClassArmRoster: async (classArmId, params = {}) => {
    const response = await tenantApi.get(`/allocations/class-arm/${classArmId}/roster`, {
      params,
    });
    return response.data;
  },

  // Subject Teacher Allocations
  getSubjectTeacherAllocations: async (params = {}) => {
    const response = await tenantApi.get('/allocations/subject-teacher', { params });
    return response.data;
  },

  saveSubjectTeacherAllocations: async (data) => {
    const response = await tenantApi.post('/allocations/subject-teacher', data);
    return response.data;
  },

  removeSubjectTeacherAllocation: async (id) => {
    const response = await tenantApi.delete(`/allocations/subject-teacher/${id}`);
    return response.data;
  },

  // One teacher per (class, subject), applied to every arm of the class.
  saveSubjectTeacherAllocationsForClass: async (data) => {
    const response = await tenantApi.post('/allocations/subject-teacher/for-class', data);
    return response.data;
  },

  removeSubjectTeacherAllocationForClass: async (data) => {
    const response = await tenantApi.post('/allocations/subject-teacher/for-class/remove', data);
    return response.data;
  },

  getSubjectAllocationClassesOverview: async (params = {}) => {
    const response = await tenantApi.get('/allocations/subject-teacher/classes-overview', {
      params,
    });
    return response.data;
  },

  getSuggestedSubjectTeachers: async (params = {}) => {
    const response = await tenantApi.get('/allocations/subject-teacher/suggested-teachers', {
      params,
    });
    return response.data;
  },

  autoAllocateSubjectTeachers: async (data) => {
    const response = await tenantApi.post('/allocations/subject-teacher/auto-allocate', data);
    return response.data;
  },

  copySubjectTeachersToClass: async (data) => {
    const response = await tenantApi.post('/allocations/subject-teacher/copy-from-class', data);
    return response.data;
  },

  downloadSubjectTeacherTemplate: async (params) => {
    const response = await tenantApi.get('/allocations/subject-teacher/template', {
      params,
      responseType: 'blob',
    });
    return response;
  },

  uploadSubjectTeacherTemplate: async (file, programmeClassId, sessionTermId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('programme_class_id', programmeClassId);
    formData.append('session_term_id', sessionTermId);
    const response = await tenantApi.post('/allocations/subject-teacher/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default allocationApi;
