import tenantApi from '@/api/tenant/tenant_api';

// ── Result Overview API ─────────────────────────────────────────
// Backed by the /result-overview routes in routes/tenant/result_overview.php
const resultOverviewApi = {
  // Every active class, for the "Class" filter — independent of whether a
  // class has any scored results yet (unlike the heatmap's own rows).
  // GET /result-overview/classes
  getClasses: () => tenantApi.get('/result-overview/classes'),

  // Full dashboard payload: stats, trend, heatmap, distribution, gender,
  // top students/subjects, at-risk students — for one session-term
  // (+ optional class filter), compared against a prior period.
  // POST /result-overview { session_term_id, class_id?, compare_with? }
  getOverview: (data) => tenantApi.post('/result-overview', data),

  // One heatmap cell clicked: students in that class grouped by arm, with
  // their score for the clicked subject (or overall average when
  // subject_id is omitted — the "Overall" column).
  // POST /result-overview/heatmap-drilldown { session_term_id, class_id, subject_id? }
  getHeatmapDrilldown: (data) => tenantApi.post('/result-overview/heatmap-drilldown', data),
};

export default resultOverviewApi;
