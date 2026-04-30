import tenantApi from './tenant_api';

const learnerApi = {
  getStats:        ()                  => tenantApi.get('/learners/learner-stats'),
  getAll:          (params = {})       => tenantApi.get('/learners', { params }),
  update:          (id, data)          => tenantApi.put(`/learners/${id}`, data),
  updateRegistration: (id, data)       => tenantApi.patch(`/learners/${id}/registration`, data),
  remove:          (id)                => tenantApi.delete(`/learners/${id}`),
  getParents:      (id)                => tenantApi.get(`/learners/${id}/parents`),
  syncParents:     (id, guardianIds)   => tenantApi.post(`/learners/${id}/parents`, { guardian_ids: guardianIds }),
  searchGuardians: (params = {})       => tenantApi.get('/learners/search-guardians', { params }),
};

export default learnerApi;
