import tenantApi from '@/api/tenant/tenant_api';

// ── Student Dossier API ────────────────────────────────────────
// Backed by the /result-dossier routes in routes/tenant/score_manager.php
const resultDossierApi = {
  // All students registered in a class arm for a session-term, with
  // score stats (subjects taken/scored/submitted, average, position, paid)
  // and summary stats for the stat cards.
  // GET /result-dossier/class-students?class_arm_id=&session_term_id=
  getClassStudents: (params) =>
    tenantApi.get('/result-dossier/class-students', { params }),

  // Full report-card payload for one student registration: subject results
  // with per-CA breakdown, high/low/average/position per subject, grades,
  // affective & psychomotor ratings, attendance, template + publish status.
  // POST /result-dossier/student-report { student_registration_id }
  getStudentReport: (data) =>
    tenantApi.post('/result-dossier/student-report', data),

  // The logged-in learner's own registrations (one row per session-term) +
  // the one to open by default. Drives the term selector on the learner
  // Report Card / CA Breakdown pages.
  // GET /result-dossier/my-registration?session_term_id=
  getMyRegistration: (params = {}) =>
    tenantApi.get('/result-dossier/my-registration', { params }),

  // Report card for the authenticated learner — no student id in the body;
  // the auth token decides whose report is returned.
  // POST /result-dossier/my-report { session_term_id? }
  getMyReport: (data = {}) =>
    tenantApi.post('/result-dossier/my-report', data),

  // The logged-in guardian's wards — drives the ward picker on the parent
  // "View Wards' Result" page.
  // GET /result-dossier/my-wards
  getMyWards: () => tenantApi.get('/result-dossier/my-wards'),

  // A single ward's registrations (one row per session-term) + the one to
  // open by default — same shape as getMyRegistration, scoped to the ward.
  // POST /result-dossier/ward-registration { student_user_id, session_term_id? }
  getWardRegistration: (data) =>
    tenantApi.post('/result-dossier/ward-registration', data),

  // Report card for one of the logged-in guardian's wards. Never gated on
  // outstanding fees — only on the ward actually belonging to this guardian
  // and the result being approved/published.
  // POST /result-dossier/ward-report { student_user_id, session_term_id? }
  getWardReport: (data) =>
    tenantApi.post('/result-dossier/ward-report', data),
};

export default resultDossierApi;
