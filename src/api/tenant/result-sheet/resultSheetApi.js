import tenantApi from '@/api/tenant/tenant_api';

// ── Result Sheet API ───────────────────────────────────────────
// Backed by the /result-sheet routes in routes/tenant/result_sheet.php
const resultSheetApi = {
  // ── Broadsheet ──────────────────────────────────────────────
  // Termly broadsheet: students x subjects with CA/exam/total/grade,
  // positions, comments, promotion fields + stat cards.
  // POST /result-sheet/broadsheet { class_arm_id, session_term_id, search? }
  getBroadsheet: (data) => tenantApi.post('/result-sheet/broadsheet', data),

  // Term-cumulative broadsheet: per-term averages + CWA/position for a
  // class arm across every term of a session.
  // POST /result-sheet/term-cumulative { class_arm_id, session_id, search? }
  getTermCumulative: (data) => tenantApi.post('/result-sheet/term-cumulative', data),

  // ── Comments & promotion ────────────────────────────────────
  // POST /result-sheet/comment { student_registration_id, type: 'teacher'|'hos', comment }
  saveComment: (data) => tenantApi.post('/result-sheet/comment', data),

  // POST /result-sheet/promotion { student_registration_id, promotion_recommendation?, next_class_arm_id? }
  savePromotion: (data) => tenantApi.post('/result-sheet/promotion', data),

  // "Recommend Promotion" — compute + persist recommendations from the
  // configured cumulative/pass mark.
  // POST /result-sheet/recommend-promotions { class_arm_id, session_id }
  recommendPromotions: (data) => tenantApi.post('/result-sheet/recommend-promotions', data),

  // "Post Recommendation" — resolve each student's next class arm.
  // POST /result-sheet/post-recommendations { class_arm_id, session_id }
  postRecommendations: (data) => tenantApi.post('/result-sheet/post-recommendations', data),

  // ── Summary sheet ───────────────────────────────────────────
  // Grade-distribution matrix: grades x subjects with outlier/total rows.
  // POST /result-sheet/summary { class_arm_id, session_term_id }
  getSummary: (data) => tenantApi.post('/result-sheet/summary', data),

  // Students inside one grade band for one subject (cell click dialog).
  // POST /result-sheet/summary-breakdown { class_arm_id, session_term_id, subject_id, grade }
  getSummaryBreakdown: (data) => tenantApi.post('/result-sheet/summary-breakdown', data),

  // ── Comment bank ────────────────────────────────────────────
  // GET /result-sheet/comment-bank — comment grades + the current user's
  // saved cells (comment1..comment4 = domain-average bands).
  getCommentBank: () => tenantApi.get('/result-sheet/comment-bank'),

  // POST /result-sheet/comment-bank { comment_grade_id, field: 'comment1'..'comment4', value }
  saveCommentBank: (data) => tenantApi.post('/result-sheet/comment-bank', data),
};

export default resultSheetApi;
