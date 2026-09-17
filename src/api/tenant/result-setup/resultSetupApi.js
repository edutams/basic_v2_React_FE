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

  // ── Grade & Config Settings ──────────────────────────────
  getGradeConfigStats: (sessionTermId) =>
    tenantApi.get(`/result-setup/grade-config-stats/${sessionTermId}`),

  getConfigurations: (sessionTermId) =>
    tenantApi.get(`/result-setup/configurations/${sessionTermId}`),

  saveMarkConfiguration: (data) =>
    tenantApi.post('/result-setup/mark-configurations', data),

  saveGradeSettings: (data) =>
    tenantApi.post('/result-setup/grade-settings', data),

  savePassMark: (data) =>
    tenantApi.post('/result-setup/pass-mark', data),

  resetMarkConfiguration: (data) =>
    tenantApi.delete('/result-setup/mark-configurations/reset', { data }),

  // ── Promotion Settings ───────────────────────────────────
  getPromotionConfigurations: (params) =>
    tenantApi.get('/result-setup/promotion-settings', { params }),

  saveCumulativeMark: (data) =>
    tenantApi.post('/result-setup/promotion-settings/save-cumulative', data),

  getPromotionBySubjectSettings: (params) =>
    tenantApi.get('/result-setup/promotion-settings/by-subject', { params }),

  savePromotionBySubjectSettings: (data) =>
    tenantApi.post('/result-setup/promotion-settings/by-subject', data),

  // ── Subject Search (for promotion settings) ──────────────
  searchSubjects: (params) =>
    tenantApi.get('/result-setup/subjects/search', { params }),

  // ── Comment Nomenclature ─────────────────────────────────
  getCommentNomenclatures: () =>
    tenantApi.get('/result-setup/comment-nomenclatures'),

  saveCommentNomenclature: (data) =>
    tenantApi.post('/result-setup/comment-nomenclatures', data),

  deleteCommentNomenclature: (id) =>
    tenantApi.delete(`/result-setup/comment-nomenclatures/${id}`),

  toggleCommentNomenclatureStatus: (id) =>
    tenantApi.post(`/result-setup/comment-nomenclatures/${id}/toggle-status`),

  // ── Result Templates ─────────────────────────────────────
  getTemplates: () => tenantApi.get('/result-templates/'),
  getActiveTemplate: (params) => tenantApi.get('/result-templates/active', { params }),
  setTemplate: (data) => tenantApi.post('/result-templates/set', data),
  toggleCAReport: (data) => tenantApi.post('/result-templates/enable-ca-report', data),
};

export default resultSetupApi;
