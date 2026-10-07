import tenantApi from '@/api/tenant/tenant_api';

// ── Result Sheet API ───────────────────────────────────────────
// Backed by the /result-sheet routes in routes/tenant/result_sheet.php
const resultSheetApi = {
  // ── Broadsheet ──────────────────────────────────────────────
  // Class arms for the filter's Arm dropdown, scoped server-side to arms
  // the caller is the ACTIVE CLASS TEACHER of (not just a subject teacher
  // in) when they're not an admin — stricter than the generic curriculum
  // arm dropdown, since Broadsheet writes class-teacher-only fields.
  // GET /result-sheet/my-class-arms?class_id=X&programme_id=Y
  getMyClassArms: (params) => tenantApi.get('/result-sheet/my-class-arms', { params }),

  // Termly broadsheet: students x subjects with CA/exam/total/grade,
  // positions, comments, promotion fields + stat cards.
  // POST /result-sheet/broadsheet { class_arm_id, session_term_id, search? }
  getBroadsheet: (data) => tenantApi.post('/result-sheet/broadsheet', data),

  // Results Workflow stage 2 — persists term totals, arm/class positions
  // and quality points onto student_registrations, independently of
  // approval (which also runs this as a safety net). Idempotent.
  // POST /result-sheet/broadsheet/generate-positioning { class_arm_id, session_term_id }
  generatePositioning: (data) => tenantApi.post('/result-sheet/broadsheet/generate-positioning', data),

  // Term-cumulative broadsheet: per-term averages + CWA/position for a
  // class arm across every term of a session.
  // POST /result-sheet/term-cumulative { class_arm_id, session_id, search? }
  getTermCumulative: (data) => tenantApi.post('/result-sheet/term-cumulative', data),

  // ── Publishing ──────────────────────────────────────────────
  // Two-stage flow: the School Portal Admin approves first (stage 1),
  // then the Head of School publishes (stage 2). Server rejects a HOS
  // publish until the SPA approval exists.
  // POST /result-sheet/publish/spa_approve { class_arm_id, session_term_id }
  publishSpa: (data) => tenantApi.post('/result-sheet/publish/spa_approve', data),

  // POST /result-sheet/publish/hos { class_arm_id, session_term_id }
  publishHos: (data) => tenantApi.post('/result-sheet/publish/hos', data),

  // Clears both stages at once.
  // POST /result-sheet/publish/unpublish { class_arm_id, session_term_id }
  unpublish: (data) => tenantApi.post('/result-sheet/publish/unpublish', data),

  // ── Comments & promotion ────────────────────────────────────
  // POST /result-sheet/comment { student_registration_id, type: 'teacher'|'hos', comment }
  saveComment: (data) => tenantApi.post('/result-sheet/comment', data),

  // Generate comments for a whole class arm from the current user's OWN
  // comment bank (student average → score-range grade, domain average →
  // band, gender-aware). Which field it fills (class teacher's vs school
  // admin's) is resolved server-side from the caller's role.
  // POST /result-sheet/generate-comments { class_arm_id, session_term_id }
  generateComments: (data) => tenantApi.post('/result-sheet/generate-comments', data),

  // POST /result-sheet/promotion { student_registration_id, promotion_recommendation?, next_class_arm_id? }
  savePromotion: (data) => tenantApi.post('/result-sheet/promotion', data),

  // "Recommend Promotion" — compute + persist recommendations (and the
  // resolved next class arm, for review) from the configured
  // cumulative/pass mark.
  // POST /result-sheet/recommend-promotions { class_arm_id, session_id }
  recommendPromotions: (data) => tenantApi.post('/result-sheet/recommend-promotions', data),

  // "Post Recommendation" — the execution step: creates each student's
  // registration in the destination session's first term using the
  // next_class_arm_id Recommend Promotion already assigned, and rolls the
  // school's subscription forward into that term if nothing covers it yet.
  // The destination session is resolved server-side (see getNextSession
  // below) — never chosen by the caller.
  // POST /result-sheet/post-recommendations { class_arm_id, session_id }
  postRecommendations: (data) => tenantApi.post('/result-sheet/post-recommendations', data),

  // Preview for the Post Recommendation dialog: the session that
  // chronologically follows the given one (leading year + 1, e.g.
  // "2025/2026" → "2026/2027"), and whether it's actually been created yet.
  // GET /result-sheet/next-session?session_id=X
  getNextSession: (sessionId) =>
    tenantApi.get('/result-sheet/next-session', { params: { session_id: sessionId } }),

  // ── Summary sheet ───────────────────────────────────────────
  // Grade-distribution matrix: grades x subjects with outlier/total rows.
  // POST /result-sheet/summary { class_arm_id, session_term_id }
  getSummary: (data) => tenantApi.post('/result-sheet/summary', data),

  // Students inside one grade band for one subject (cell click dialog).
  // POST /result-sheet/summary-breakdown { class_arm_id, session_term_id, subject_id, grade }
  getSummaryBreakdown: (data) => tenantApi.post('/result-sheet/summary-breakdown', data),

  // ── Comment bank ────────────────────────────────────────────
  // GET /result-sheet/comment-bank — comment grades + the current user's
  // saved cells (comment1..comment4 = domain-average bands), plus `meta`
  // describing which role/report-card field this user's bank feeds and
  // how many of its cells are filled.
  getCommentBank: () => tenantApi.get('/result-sheet/comment-bank'),

  // POST /result-sheet/comment-bank { comment_grade_id, field: 'comment1'..'comment4', value }
  saveCommentBank: (data) => tenantApi.post('/result-sheet/comment-bank', data),
};

export default resultSheetApi;
