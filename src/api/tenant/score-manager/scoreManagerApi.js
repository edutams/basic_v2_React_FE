import tenantApi from '@/api/tenant/tenant_api';

const scoreManagerApi = {
  // ── Score Upload Routes ────────────────────────────────────
  // Overview & Filters
  getScoreUploadOverview: (params = {}) =>
    tenantApi.get('/score-upload/allocations', { params }),

  getScoreUploadAnalytics: (data) =>
    tenantApi.post('/score-upload/analytics', data),

  fetchMarksConfiguration: (data) =>
    tenantApi.post('/score-upload/marks-configuration', data),

  getClassSubjects: (data) =>
    tenantApi.post('/score-upload/class-subjects', data),

  getClassCurriculums: (data) =>
    tenantApi.post('/score-upload/class-curriculums', data),

  downloadCombinedScoresheet: (data) =>
    tenantApi.post('/score-upload/download-combined-scoresheet', data, { responseType: 'blob' }),

  uploadCombinedScoresheet: (formData) =>
    tenantApi.post('/score-upload/upload-combined-scoresheet', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getRegisteredStudents: (data) =>
    tenantApi.post('/score-upload/registered-students', data),

  // Score Entry & Editing
  manualUpload: (data) =>
    tenantApi.post('/score-upload/manual-upload', data),

  editResult: (data) =>
    tenantApi.post('/score-upload/edit-result', data),

  bulkEditResults: (data) =>
    tenantApi.post('/score-upload/bulk-edit-results', data),

  // Submission
  // Submission
  submitScores: (data) =>
    tenantApi.post('/score-upload/submit-scores', data),

  getSubmitStatus: (subjectId, classArmId, sessionTermId) =>
    tenantApi.get(`/score-upload/submit-status/${subjectId}/${classArmId}/${sessionTermId}`),

  submitAllScoresValidated: (data) =>
    tenantApi.post('/score-upload/submit-all-scores-validated', data),

  submitAllScores: (data) =>
    tenantApi.post('/score-upload/submit-all-scores', data),

  reverseSubmission: (data) =>
    tenantApi.post('/score-upload/reverse-submission', data),

  // Purge
  purgeScores: (data) =>
    tenantApi.post('/score-upload/purge-scores', data),

  // ── Score Sheet Routes ─────────────────────────────────────
  getScoreSheetData: (data) =>
    tenantApi.post('/score-sheet/data', data),

  // ── CA Breakdown ──────────────────────────────────────────
  // POST /ca-breakdown { student_registration_id | user_id, session_term_id? }
  getCaBreakdown: (data) =>
    tenantApi.post('/ca-breakdown', data),
};

export default scoreManagerApi;
