import tenantApi from '@/api/tenant/tenant_api';

const admissionSetupApi = {
  // ── Batches ──────────────────────────────────────────────────────────────

  /** Get all batches for a given session term */
  getBatchesByTerm: (sessionTermId) =>
    tenantApi.get(`/admission/batches`, { params: { session_term_id: sessionTermId } })
      .then((r) => r.data),

  /** Get a single batch */
  getBatch: (id) =>
    tenantApi.get(`/admission/batches/${id}`).then((r) => r.data),

  /** Create a new admission batch */
  createBatch: (data) =>
    tenantApi.post('/admission/batches', data).then((r) => r.data),

  /** Update an existing batch */
  updateBatch: (id, data) =>
    tenantApi.put(`/admission/batches/${id}`, data).then((r) => r.data),

  /** Toggle batch open/close status */
  toggleBatchStatus: (id) =>
    tenantApi.patch(`/admission/batches/${id}/toggle-status`).then((r) => r.data),

  /** Delete a batch */
  deleteBatch: (id) =>
    tenantApi.delete(`/admission/batches/${id}`).then((r) => r.data),

  /** Get entry session term options (current + next term) */
  getEntrySessionTerms: (sessionTermId) =>
    tenantApi.get(`/admission/entry-session-terms/${sessionTermId}`).then((r) => r.data),
};

export default admissionSetupApi;
