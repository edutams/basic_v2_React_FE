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
};

export default resultDossierApi;
