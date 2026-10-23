import tenantApi from '@/api/tenant/tenant_api';

const learnerApi = {
  getStats: () => tenantApi.get('/learners/learner-stats'),
  getOverviewStats: () => tenantApi.get('/learners/overview-stats'),
  getClassArms: (params = {}) => tenantApi.get('/learners/class-arms', { params }),
  getAll: (params = {}) => tenantApi.get('/learners', { params }),
  update: (id, data) => tenantApi.put(`/learners/${id}`, data),
  updatePhoto: (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return tenantApi.post(`/learners/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  resetPassword: (id) => tenantApi.post(`/learners/${id}/reset-password`),
  updateRegistration: (id, data) => tenantApi.patch(`/learners/${id}/registration`, data),
  remove: (id) => tenantApi.delete(`/learners/${id}`),
  getParents: (id) => tenantApi.get(`/learners/${id}/parents`),
  syncParents: (id, guardianIds) => tenantApi.post(`/learners/${id}/parents`, { guardian_ids: guardianIds }),
  searchGuardians: (params = {}) => tenantApi.get('/learners/search-guardians', { params }),
  // Takes a registration id (not user id) — existing endpoint reused from
  // Class Register rather than duplicated. Changes enrolment stage
  // (student/graduate/withdrawn/...), not account access.
  updateStatus: (registrationId, status) => tenantApi.patch(`/students/${registrationId}/status`, { status }),
  // Toggles the account-level active/inactive flag (login access) — takes
  // the learner's user id, independent of enrolment status above.
  toggleAccountStatus: (userId) => tenantApi.patch(`/learners/${userId}/toggle-account-status`),
};

export default learnerApi;
