import tenantApi from './tenant_api';

const learnerApi = {
  getStats:        ()                  => tenantApi.get('/learners/learner-stats'),
  getAll:          (params = {})       => tenantApi.get('/learners', { params }),
  getParents:      (id)                => tenantApi.get(`/learners/${id}/parents`),
  syncParents:     (id, guardianIds)   => tenantApi.post(`/learners/${id}/parents`, { guardian_ids: guardianIds }),
  searchGuardians: (params = {})       => tenantApi.get('/learners/search-guardians', { params }),
};

export default learnerApi;
