import landlordApi from './auth';
import tenantApi from './tenant_api';

export const landlordSchemeApi = {
  getTerms: async () => {
    const response = await landlordApi.get('/landlord/v1/scheme-of-work/terms');
    return response.data;
  },
  fetchScheme: async (data) => {
    const response = await landlordApi.post('/landlord/v1/scheme-of-work/fetch', data);
    return response.data;
  },
  addTopic: async (data) => {
    const response = await landlordApi.post('/landlord/v1/scheme-of-work/topic', data);
    return response.data;
  },
  updateTopic: async (id, data) => {
    const response = await landlordApi.put(`/landlord/v1/scheme-of-work/topic/${id}`, data);
    return response.data;
  },
  deleteTopic: async (id) => {
    const response = await landlordApi.delete(`/landlord/v1/scheme-of-work/topic/${id}`);
    return response.data;
  },
  addSubtopic: async (data) => {
    const response = await landlordApi.post('/landlord/v1/scheme-of-work/subtopic', data);
    return response.data;
  },
  updateSubtopic: async (id, data) => {
    const response = await landlordApi.put(`/landlord/v1/scheme-of-work/subtopic/${id}`, data);
    return response.data;
  },
  deleteSubtopic: async (id) => {
    const response = await landlordApi.delete(`/landlord/v1/scheme-of-work/subtopic/${id}`);
    return response.data;
  },
  getAnalytics: async (params) => {
    const response = await landlordApi.get('/landlord/v1/scheme-of-work/analytics', { params });
    return response.data;
  },
  addObjective: async (data) => {
    const response = await landlordApi.post('/landlord/v1/scheme-of-work/learning-objective', data);
    return response.data;
  },
  updateObjective: async (id, data) => {
    const response = await landlordApi.put(`/landlord/v1/scheme-of-work/learning-objective/${id}`, data);
    return response.data;
  },
  deleteObjective: async (id) => {
    const response = await landlordApi.delete(`/landlord/v1/scheme-of-work/learning-objective/${id}`);
    return response.data;
  },
  updateSchemeEntry: async (id, data) => {
    const response = await landlordApi.put(`/landlord/v1/scheme-of-work/entry/${id}`, data);
    return response.data;
  },
  getDetails: async (id) => {
    const response = await landlordApi.get(`/landlord/v1/scheme-of-work/view/${id}`);
    return response.data;
  },
  downloadTemplate: async (params) => {
    const response = await landlordApi.get('/landlord/v1/scheme-of-work/template/download', {
      params,
      responseType: 'blob',
    });
    return response;
  },
  uploadTemplate: async (formData) => {
    const response = await landlordApi.post('/landlord/v1/scheme-of-work/template/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  downloadSchemeOfWork: async (params) => {
    const response = await landlordApi.get('/landlord/v1/scheme-of-work/download', {
      params,
      responseType: 'blob',
    });
    return response;
  },
};

export const tenantSchemeApi = {
  getTerms: async () => {
    const response = await tenantApi.get('/scheme-of-work/terms');
    return response.data;
  },
  fetchScheme: async (data) => {
    const response = await tenantApi.post('/scheme-of-work/fetch', data);
    return response.data;
  },
  importFromLandlord: async (data) => {
    const response = await tenantApi.post('/scheme-of-work/import', data);
    return response.data;
  },
  addTopic: async (data) => {
    const response = await tenantApi.post('/scheme-of-work/topic', data);
    return response.data;
  },
  updateTopic: async (id, data) => {
    const response = await tenantApi.put(`/scheme-of-work/topic/${id}`, data);
    return response.data;
  },
  deleteTopic: async (id) => {
    const response = await tenantApi.delete(`/scheme-of-work/topic/${id}`);
    return response.data;
  },
  addSubtopic: async (data) => {
    const response = await tenantApi.post('/scheme-of-work/subtopic', data);
    return response.data;
  },
  updateSubtopic: async (id, data) => {
    const response = await tenantApi.put(`/scheme-of-work/subtopic/${id}`, data);
    return response.data;
  },
  deleteSubtopic: async (id) => {
    const response = await tenantApi.delete(`/scheme-of-work/subtopic/${id}`);
    return response.data;
  },
  getAnalytics: async (params) => {
    const response = await tenantApi.get('/scheme-of-work/analytics', { params });
    return response.data;
  },
  addObjective: async (data) => {
    const response = await tenantApi.post('/scheme-of-work/learning-objective', data);
    return response.data;
  },
  updateObjective: async (id, data) => {
    const response = await tenantApi.put(`/scheme-of-work/learning-objective/${id}`, data);
    return response.data;
  },
  deleteObjective: async (id) => {
    const response = await tenantApi.delete(`/scheme-of-work/learning-objective/${id}`);
    return response.data;
  },
  updateSchemeEntry: async (id, data) => {
    const response = await tenantApi.put(`/scheme-of-work/entry/${id}`, data);
    return response.data;
  },
  getDetails: async (id) => {
    const response = await tenantApi.get(`/scheme-of-work/view/${id}`);
    return response.data;
  },
  downloadTemplate: async (params) => {
    const response = await tenantApi.get('/scheme-of-work/template/download', {
      params,
      responseType: 'blob',
    });
    return response;
  },
  uploadTemplate: async (formData) => {
    const response = await tenantApi.post('/scheme-of-work/template/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  downloadSchemeOfWork: async (params) => {
    const response = await tenantApi.get('/scheme-of-work/download', {
      params,
      responseType: 'blob',
    });
    return response;
  },
};
