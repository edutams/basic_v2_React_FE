import tenantApi from '@/api/tenant/tenant_api';

export const tenantAssessmentApi = {
  getSubject: async (subjectId) => {
    const response = await tenantApi.get(`/e-resources/assessment/subject/${subjectId}`);
    return response.data;
  },
  getSubjectAssessment: async (data) => {
    const response = await tenantApi.post('/e-resources/assessment/subject', data);
    return response.data;
  },
  attemptQuiz: async (weekId) => {
    const response = await tenantApi.get(`/e-resources/assessment/attempt/${weekId}`);
    return response.data;
  },
  getRandomAssessment: async (weekId, classProgId) => {
    const response = await tenantApi.get(
      `/e-resources/assessment/random/${weekId}/${classProgId}`,
    );
    return response.data;
  },
  getStudentAssessment: async (schemeOfWorkId, weekId) => {
    const response = await tenantApi.get(
      `/e-resources/assessment/${schemeOfWorkId}/${weekId}`,
    );
    return response.data;
  },
  retakeAssessment: async (schemeOfWorkId, weekId) => {
    const response = await tenantApi.post(
      `/e-resources/assessment/retake/${schemeOfWorkId}/${weekId}`,
    );
    return response.data;
  },
  submitReport: async (data) => {
    const response = await tenantApi.post('/e-resources/assessment/report', data);
    return response.data;
  },
};

export default tenantAssessmentApi;
