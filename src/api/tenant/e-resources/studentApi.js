import tenantApi from '@/api/tenant/tenant_api';

export const tenantStudentApi = {
  getIndex: async () => {
    const response = await tenantApi.get('/e-resources/student');
    return response.data;
  },
  getSubjects: async (data) => {
    const response = await tenantApi.post('/e-resources/student/subjects', data);
    return response.data;
  },
  getSubjectsWithAssessments: async (data) => {
    const response = await tenantApi.post('/e-resources/student/subjects-with-assessments', data);
    return response.data;
  },
  getLessonNoteMeta: async (subjectId, classProgId) => {
    const response = await tenantApi.get(
      `/e-resources/student/lesson-note/${subjectId}/${classProgId}`,
    );
    return response.data;
  },
  getLessonContent: async (schemeOfWorkId) => {
    const response = await tenantApi.get(
      `/e-resources/student/lesson-content/${schemeOfWorkId}`,
    );
    return response.data;
  },
  markRead: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(
      `/e-resources/student/mark-read/${schemeOfWorkId}`,
      data,
    );
    return response.data;
  },
  saveReadingMode: async (data) => {
    const response = await tenantApi.post('/e-resources/student/reading-mode', data);
    return response.data;
  },
  getReadingMode: async (params) => {
    const response = await tenantApi.get('/e-resources/student/reading-mode', { params });
    return response.data;
  },
  saveVisitRecord: async (data) => {
    const response = await tenantApi.post('/e-resources/student/visit-record', data);
    return response.data;
  },
  getProgress: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(
      `/e-resources/student/progress/${schemeOfWorkId}`,
      data,
    );
    return response.data;
  },
  getAnalytics: async (data) => {
    const response = await tenantApi.post('/e-resources/student/analytics', data);
    return response.data;
  },
};

export default tenantStudentApi;
