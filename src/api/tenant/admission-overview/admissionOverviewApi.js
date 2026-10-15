import tenantApi from '@/api/tenant/tenant_api';

// ── Admission Overview API ──────────────────────────────────────
// Backed by the /admission-overview routes in routes/tenant/admission_overview.php
const admissionOverviewApi = {
  // Every active class, for the "Class" filter dropdown.
  // GET /admission-overview/classes
  getClasses: () => tenantApi.get('/admission-overview/classes'),

  // Full dashboard payload: stat row (vs previous session), 5-session
  // trend, status breakdown, conversion funnel, by-class breakdown, and
  // rule-based insights — optionally scoped by batch/class/status/dates.
  // POST /admission-overview { admission_batch_id?, class_id?, status?, date_from?, date_to? }
  getOverview: (data) => tenantApi.post('/admission-overview', data),
};

export default admissionOverviewApi;
