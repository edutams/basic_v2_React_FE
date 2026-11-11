import api from '@/api/landlord/landlord_api';

// Agent-side (platform super-admin only) Stage 2 data migration — moved
// here from the tenant side 2026-11-09 per direct CEO decision. Every call
// is scoped to one chosen school (tenantId), unlike the tenant-side
// version where the school was always implicit.

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
