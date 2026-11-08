import api from '@/api/tenant/tenant_api';

export const fetchMigrationSummary = async () => {
  const res = await api.get('/data-migration/summary');
  return res.data;
};

export const triggerMigration = async ({ domain, dryRun, conflictStrategy }) => {
  const res = await api.post('/data-migration/trigger', {
    domain,
    dry_run: dryRun,
    conflict_strategy: conflictStrategy,
  });
  return res.data;
};

export const fetchMigrationStatus = async (domain) => {
  const res = await api.get(`/data-migration/status/${domain}`);
  return res.data;
};

export const fetchMigrationHistory = async () => {
  const res = await api.get('/data-migration/history');
  return res.data;
};
