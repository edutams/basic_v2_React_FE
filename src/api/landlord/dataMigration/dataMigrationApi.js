import api from '@/api/landlord/landlord_api';

// Agent-side (platform super-admin only) Stage 2 data migration — moved
// here from the tenant side 2026-11-09 per direct CEO decision. Every call
// is scoped to one chosen school (tenantId), unlike the tenant-side
// version where the school was always implicit.

// migration-hardening Step 4 item 7 — the backend's own
// MigrationRun::DEPENDENCIES, not a hardcoded frontend copy. Not
// tenant-scoped — the graph is the same for every school.
export const fetchDependencyGraph = async () => {
  const res = await api.get('/v1/landlord/data-migration/dependency-graph');
  return res.data;
};

export const fetchMigrationSchools = async (search = '', page = 1) => {
  const params = { page };
  if (search) {
    params.search = search;
  }
  const res = await api.get('/v1/landlord/data-migration/schools', { params });
  return res.data;
};

export const fetchMigrationSummary = async (tenantId) => {
  const res = await api.get(`/v1/landlord/data-migration/${tenantId}/summary`);
  return res.data;
};

export const triggerMigration = async (tenantId, { domain, dryRun, conflictStrategy }) => {
  const res = await api.post(`/v1/landlord/data-migration/${tenantId}/trigger`, {
    domain,
    dry_run: dryRun,
    conflict_strategy: conflictStrategy,
  });
  return res.data;
};

export const fetchMigrationStatus = async (tenantId, domain) => {
  const res = await api.get(`/v1/landlord/data-migration/${tenantId}/status/${domain}`);
  return res.data;
};

export const fetchMigrationHistory = async (tenantId) => {
  const res = await api.get(`/v1/landlord/data-migration/${tenantId}/history`);
  return res.data;
};

// Which domains have a completed, real (non-dry) run — used to disable a
// domain whose dependencies haven't genuinely been migrated yet, and show
// why, instead of letting it be selected and fail with a wall of errors.
export const fetchCompletedDomains = async (tenantId) => {
  const res = await api.get(`/v1/landlord/data-migration/${tenantId}/completed-domains`);
  return res.data;
};

// Read-only — every class this tenant currently has (name, code,
// division, v1 link), ordered by name so a visual duplicate is easy to
// spot by eye.
export const fetchClassesOverview = async (tenantId) => {
  const res = await api.get(`/v1/landlord/data-migration/${tenantId}/classes-overview`);
  return res.data;
};

// migration-hardening Step 2 item 5 — "Check now": re-runs reconciliation
// for one domain on demand (read-only against V1, only ever writes
// migration_domain_states), independent of any run finishing on its own.
export const checkDomainState = async (tenantId, domain) => {
  const res = await api.post(`/v1/landlord/data-migration/${tenantId}/check-now/${domain}`);
  return res.data;
};

// migration-hardening Step 4 — the server drives the actual migration from
// here on; this is the ONLY call that starts one. Every domain it starts
// (and every one it cascades into afterwards) finishes entirely on its
// own, batch by batch, with no further request from this screen ever
// needed — see fetchPlanStatus() below, the one thing the frontend still
// asks about it.
export const startPlan = async (tenantId, { selectedDomains, conflictStrategy, reason }) => {
  const res = await api.post(`/v1/landlord/data-migration/${tenantId}/plans`, {
    selected_domains: selectedDomains,
    conflict_strategy: conflictStrategy,
    ...(reason ? { reason } : {}),
  });
  return res.data;
};

// Read-only — this plan plus every one of its selected domains' current
// run (if any). Never triggers anything; the self-chaining job on the
// backend is the only thing that ever starts the next batch or the next
// domain.
export const fetchPlanStatus = async (tenantId) => {
  const res = await api.get(`/v1/landlord/data-migration/${tenantId}/plans/current`);
  return res.data;
};

export const pausePlan = async (tenantId) => {
  const res = await api.post(`/v1/landlord/data-migration/${tenantId}/plans/pause`);
  return res.data;
};

export const resumePlan = async (tenantId) => {
  const res = await api.post(`/v1/landlord/data-migration/${tenantId}/plans/resume`);
  return res.data;
};

export const cancelPlan = async (tenantId) => {
  const res = await api.post(`/v1/landlord/data-migration/${tenantId}/plans/cancel`);
  return res.data;
};
