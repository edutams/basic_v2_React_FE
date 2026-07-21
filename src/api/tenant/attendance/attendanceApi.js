import tenantApi from '@/api/tenant/tenant_api';

const attendanceApi = {
  // ── Sessions / Terms / Weeks / Programmes / Classes ──────
  getSessions: () => tenantApi.get('/sessions'),
  getTerms: (sessionId = null) =>
    tenantApi.get('/terms', { params: sessionId ? { session_id: sessionId } : {} }),
  getWeeks: (termId) => tenantApi.get('/weeks', { params: { term_id: termId } }),
  getProgrammes: () => tenantApi.get('/programmes'),
  getClassesByProgramme: (programmeId) =>
    tenantApi.get(`/classes/by-programme/${programmeId}`),

  // ── Attendance ───────────────────────────────────────────
  getAttendanceLearners: (params = {}) =>
    tenantApi.get('/attendance/learners', { params }),
  getAttendanceByClass: (classId, params = {}) =>
    tenantApi.get(`/attendance/by-class/${classId}`, { params }),
  getAttendanceByDay: (date, classId) =>
    tenantApi.get('/attendance/by-day', { params: { date, class_id: classId } }),

  markAttendance: (data) =>
    tenantApi.post('/attendance/mark', data),
  markBulkAttendance: (day, status, data) =>
    tenantApi.post('/attendance/bulk-mark', { day, status, ...data }),
  updateAttendance: (id, data) =>
    tenantApi.put(`/attendance/${id}`, data),
  submitAttendance: (data) =>
    tenantApi.post('/attendance/submit', data),

  // ── Attendance Stats ─────────────────────────────────────
  getAttendanceStats: (params = {}) =>
    tenantApi.get('/attendance/stats', { params }),
  getWeekAttendanceRate: (params = {}) =>
    tenantApi.get('/attendance/week-rate', { params }),
  getTermAttendanceRate: (params = {}) =>
    tenantApi.get('/attendance/term-rate', { params }),
  getAbsenteesList: (params = {}) =>
    tenantApi.get('/attendance/absentees', { params }),
  getAtRiskLearners: (params = {}) =>
    tenantApi.get('/attendance/at-risk', { params }),

  // ── Psychomotor / Affective ──────────────────────────────
  getPsychomotorLearners: (params = {}) =>
    tenantApi.get('/psychomotor/learners', { params }),
  getPsychomotorAssessments: (classId, params = {}) =>
    tenantApi.get(`/psychomotor/by-class/${classId}`, { params }),

  saveAssessment: (learnerId, data) =>
    tenantApi.post(`/psychomotor/assess/${learnerId}`, data),
  submitAssessments: (data) =>
    tenantApi.post('/psychomotor/submit', data),

  // ── Psychomotor Stats ────────────────────────────────────
  getPsychomotorStats: (params = {}) =>
    tenantApi.get('/psychomotor/stats', { params }),
  getRatingByGender: (params = {}) =>
    tenantApi.get('/psychomotor/rating-by-gender', { params }),
  getLearnersNeedingSupport: (params = {}) =>
    tenantApi.get('/psychomotor/needing-support', { params }),

  // ── Alerts / Notifications ───────────────────────────────
  sendAttendanceAlerts: (learnerIds) =>
    tenantApi.post('/attendance/send-alerts', { learner_ids: learnerIds }),
  sendRiskAlerts: (learnerIds) =>
    tenantApi.post('/attendance/risk-alerts', { learner_ids: learnerIds }),

  // ── Export ───────────────────────────────────────────────
  exportAttendanceReport: (params = {}) =>
    tenantApi.get('/attendance/export', { params, responseType: 'blob' }),
  exportPsychomotorReport: (params = {}) =>
    tenantApi.get('/psychomotor/export', { params, responseType: 'blob' }),
};

export default attendanceApi;
