import tenantApi from './tenant_api';

const guardianApi = {
  getWards: (id) => tenantApi.get(`/guardians/${id}/wards`),
  syncWards: (id, wardIds) => tenantApi.post(`/guardians/${id}/wards`, { ward_ids: wardIds }),
  searchLearners: (params = {}) => tenantApi.get('/guardians/search-learners', { params }),
  getStats: () => tenantApi.get('/guardians/stats'),
  getAll: (params = {}) => tenantApi.get('/guardians', { params }),
  create: (data) => tenantApi.post('/guardians', data),
  update: (id, data) => tenantApi.put(`/guardians/${id}`, data),
  toggleStatus: (id) => tenantApi.patch(`/guardians/${id}/toggle-status`),
  remove: (id) => tenantApi.delete(`/guardians/${id}`),
  downloadTemplate: () =>
    tenantApi.get('/guardians/download-parent-template', { responseType: 'blob' }),
  uploadTemplate: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return tenantApi.post('/guardians/upload-parent-template', formData);
  },
};

export default guardianApi;
