import tenantApi from './tenant_api';

const learnerApi = {
  getStats: ()              => tenantApi.get('/learners/learner-stats'),
  getAll:   (params = {})   => tenantApi.get('/learners', { params }),
};

export default learnerApi;
