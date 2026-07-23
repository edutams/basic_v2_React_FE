import tenantApi from '@/api/tenant/tenant_api';

const resultSetupApi = {
  // ── Affective Domains ────────────────────────────────────
  getAffectiveDomains: (params = {}) =>
    tenantApi.get('/result-setup/affective-domains', { params }),

  saveAffectiveDomain: (data) =>
    tenantApi.post('/result-setup/affective-domains', data),

  deleteAffectiveDomain: (id) =>
    tenantApi.delete(`/result-setup/affective-domains/${id}`),

  // ── Psychomotor Domains ──────────────────────────────────
  getPsychomotorDomains: (params = {}) =>
    tenantApi.get('/result-setup/psychomotor-domains', { params }),

  savePsychomotorDomain: (data) =>
    tenantApi.post('/result-setup/psychomotor-domains', data),

  deletePsychomotorDomain: (id) =>
    tenantApi.delete(`/result-setup/psychomotor-domains/${id}`),

  // ── Sync ─────────────────────────────────────────────────
  syncConfig: () => tenantApi.post('/result-setup/sync'),
};

export default resultSetupApi;
