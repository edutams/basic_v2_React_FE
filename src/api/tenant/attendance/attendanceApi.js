import tenantApi from '@/api/tenant/tenant_api';

const attendanceApi = {
  // ── Sessions / Terms / Weeks / Programmes / Classes ──────
  getSessions: () => tenantApi.get('/sessions'),
  getTerms: (sessionId = null) =>
    tenantApi.get('/terms', { params: sessionId ? { session_id: sessionId } : {} }),
  getWeeks: (sessionTermId) => tenantApi.get(`/weeks/${sessionTermId}`),
  getWeeksBySessionTerm: (params = {}) =>
    tenantApi.get('/attendance/weeks', { params }),
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
  markBulkAttendance: (day, period, status, data) =>
    tenantApi.post('/attendance/bulk-mark', { date: day, period, status, ...data }),
  markBatchAttendance: (data) =>
    tenantApi.post('/attendance/batch-mark', data),
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
  getDailyBreakdown: (params = {}) =>
    tenantApi.get('/attendance/daily-breakdown', { params }),
  getWeeklyTrend: (params = {}) =>
    tenantApi.get('/attendance/weekly-trend', { params }),

  // ── Teacher Class ────────────────────────────────────────────
  getTeacherClass: () =>
    tenantApi.get('/attendance/teacher-class'),

  // ── Psychomotor / Affective ──────────────────────────────
  getPsychomotorLearners: (params = {}) =>
    tenantApi.get('/psychomotor/learners', { params }),
  getPsychomotorDomains: (params = {}) =>
    tenantApi.get('/psychomotor/domains', { params }),
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
  getTraitBreakdown: (params = {}) =>
    tenantApi.get('/psychomotor/trait-breakdown', { params }),

  // ── Alerts / Notifications ───────────────────────────────
  sendAttendanceAlerts: (learnerIds, weekTermId, classArmId, selectedDays = []) =>
    tenantApi.post('/attendance/send-alerts', { learner_ids: learnerIds, week_term_id: weekTermId, class_arm_id: classArmId, selected_days: selectedDays }),
  sendRiskAlerts: (learnerIds, weekTermId, classArmId, selectedDays = []) =>
    tenantApi.post('/attendance/risk-alerts', { learner_ids: learnerIds, week_term_id: weekTermId, class_arm_id: classArmId, selected_days: selectedDays }),
  toggleWeeklyReport: (classArmId, enabled) =>
    tenantApi.post('/attendance/toggle-weekly-report', { class_arm_id: classArmId, enabled }),

  // ── Export ───────────────────────────────────────────────
  exportAttendanceReport: (params = {}) =>
    tenantApi.get('/attendance/export', { params, responseType: 'blob' }),
  exportAttendancePdf: (params = {}) =>
    tenantApi.get('/attendance/export-pdf', { params, responseType: 'blob' }),
  exportPsychomotorReport: (params = {}) =>
    tenantApi.get('/psychomotor/export', { params, responseType: 'blob' }),
};

export default attendanceApi;
