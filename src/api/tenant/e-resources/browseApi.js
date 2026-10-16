import tenantApi from '@/api/tenant/tenant_api';

export const tenantBrowseApi = {
  getBrowse: async (filters) => {
    const response = await tenantApi.get('/e-resources/browse', { params: { filters } });
    return response.data;
  },
  getStudentBrowse: async (filters) => {
    const response = await tenantApi.get('/e-resources/browse/student', { params: { filters } });
    return response.data;
  },
  getStudentSubjects: async () => {
    const response = await tenantApi.get('/e-resources/browse/student/subjects');
    return response.data;
  },
};

export const tenantForumApi = {
  getMessages: async (data) => {
    const response = await tenantApi.post('/e-resources/forum/messages', data);
    return response.data;
  },
  sendMessage: async (data) => {
    const response = await tenantApi.post('/e-resources/forum/messages/send', data);
    return response.data;
  },
  deleteMessage: async (data) => {
    const response = await tenantApi.post('/e-resources/forum/messages/delete', data);
    return response.data;
  },
  uploadFile: async (data) => {
    const response = await tenantApi.post('/e-resources/forum/files', data);
    return response.data;
  },
};

export const tenantSharedApi = {
  getLessonNoteData: async (filters) => {
    const response = await tenantApi.post('/e-resources/lesson-note-data', { filters });
    return response.data;
  },
  getRatings: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(`/e-resources/ratings/${schemeOfWorkId}`, data);
    return response.data;
  },
  rateLesson: async (schemeOfWorkId, data) => {
    const response = await tenantApi.post(`/e-resources/ratings/${schemeOfWorkId}/rate`, data);
    return response.data;
  },
};
