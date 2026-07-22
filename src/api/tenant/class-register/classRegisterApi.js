import tenantApi from '@/api/tenant/tenant_api';

const classRegisterApi = {
  // ── Sessions / Terms ─────────────────────────────────────
  getSessions: () => tenantApi.get('/sessions'),
  getTerms: (sessionId = null) =>
    tenantApi.get('/terms', { params: sessionId ? { session_id: sessionId } : {} }),

  // ── Programmes / Classes / Arms ──────────────────────────
  getProgrammes: () => tenantApi.get('/programmes'),
  getClassesByProgramme: (programmeId) =>
    tenantApi.get(`/classes/by-programme/${programmeId}`),
  getArmsByClass: (classId, params = {}) =>
    tenantApi.get(`/class-arms/by-class/${classId}`, { params }),

  // ── Student Data ─────────────────────────────────────────
  getStudents: (params = {}) => tenantApi.get('/students', { params }),
  getStudentDetail: (id) => tenantApi.get(`/students/${id}`),
  getStudentsByClass: (classId, armId, params = {}) =>
    tenantApi.get(`/students/by-class/${classId}`, { params: { ...params, arm_id: armId } }),
  getStudentsByClassMultiArm: (classId, params = {}) =>
    tenantApi.get(`/students/by-class/${classId}`, { params }),

  // ── Enrollment / Stats ───────────────────────────────────
  getEnrollmentStats: (params = {}) =>
    tenantApi.get('/enrollment/stats', { params }),
  getClassEnrollmentBreakdown: (params = {}) =>
    tenantApi.get('/enrollment/class-breakdown', { params }),

  // ── Registration / Arm Assignment ────────────────────────
  assignArm: (studentId, data) =>
    tenantApi.patch(`/students/${studentId}/assign-arm`, data),
  unassignArm: (studentId, armId) =>
    tenantApi.patch(`/students/${studentId}/unassign-arm`, { arm_id: armId }),
  bulkAssignArm: (data) =>
    tenantApi.post('/students/bulk-assign-arm', data),

  // ── Student Transfers (Change Class) ─────────────────────
  changeStudentClass: (studentId, data) =>
    tenantApi.put(`/students/${studentId}/change-class`, data),

  // ── Export ───────────────────────────────────────────────
  exportStudentList: (params = {}) =>
    tenantApi.get('/students/export', { params, responseType: 'blob' }),
};

export default classRegisterApi;
