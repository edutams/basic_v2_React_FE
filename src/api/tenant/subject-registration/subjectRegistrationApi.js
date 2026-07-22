import tenantApi from '@/api/tenant/tenant_api';

const subjectRegistrationApi = {
  // ── Sessions / Terms / Programmes / Classes / Arms ───────
  getSessions: () => tenantApi.get('/sessions'),
  getTerms: (sessionId = null) =>
    tenantApi.get('/terms', { params: sessionId ? { session_id: sessionId } : {} }),
  getProgrammes: () => tenantApi.get('/programmes'),
  getClassesByProgramme: (programmeId) =>
    tenantApi.get(`/classes/by-programme/${programmeId}`),
  getArmsByClass: (classId, params = {}) =>
    tenantApi.get(`/class-arms/by-class/${classId}`, { params }),

  // ── Subject Data ─────────────────────────────────────────
  getSubjects: (params = {}) => tenantApi.get('/subjects', { params }),
  getGeneralSubjects: (classId, params = {}) =>
    tenantApi.get(`/subjects/general/${classId}`, { params }),
  getOptionalSubjects: (classId, params = {}) =>
    tenantApi.get(`/subjects/optional/${classId}`, { params }),

  // ── Learner Registration ─────────────────────────────────
  getLearners: (classId, armId, params = {}) =>
    tenantApi.get('/learners/by-class', { params: { ...params, class_id: classId, arm_id: armId } }),
  getLearnerSubjectRegistration: (classId, armId, params = {}) =>
    tenantApi.get('/subject-registration/learners', {
      params: { ...params, class_id: classId, arm_id: armId },
    }),

  // ── Registration Actions ─────────────────────────────────
  registerSubject: (learnerId, subjectId) =>
    tenantApi.post(`/subject-registration/register`, { learner_id: learnerId, subject_id: subjectId }),
  unregisterSubject: (learnerId, subjectId) =>
    tenantApi.post(`/subject-registration/unregister`, { learner_id: learnerId, subject_id: subjectId }),
  bulkRegisterSubject: (subjectId, learnerIds) =>
    tenantApi.post(`/subject-registration/bulk-register`, { subject_id: subjectId, learner_ids: learnerIds }),
  bulkUnregisterSubject: (subjectId, learnerIds) =>
    tenantApi.post(`/subject-registration/bulk-unregister`, { subject_id: subjectId, learner_ids: learnerIds }),
  toggleRegistration: (learnerId, subjectId, registered) =>
    tenantApi.post(`/subject-registration/toggle`, {
      learner_id: learnerId,
      subject_id: subjectId,
      registered,
    }),

  // ── Stats ────────────────────────────────────────────────
  getRegistrationStats: (classId, armId) =>
    tenantApi.get('/subject-registration/stats', { params: { class_id: classId, arm_id: armId } }),
  getLearnerProgress: (classId, armId) =>
    tenantApi.get('/subject-registration/learner-progress', { params: { class_id: classId, arm_id: armId } }),
};

export default subjectRegistrationApi;
