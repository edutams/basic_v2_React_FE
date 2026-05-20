import tenantApi from './tenant_api';

const admissionSetupApi = {
  // ── Batches ──────────────────────────────────────────────────────────────

  /** Get all batches for a given session term */
  getBatchesByTerm: (sessionTermId) =>
    tenantApi.get(`/admission/setup/batches`, { params: { session_term_id: sessionTermId } })
      .then((r) => r.data),

  /** Get a single batch */
  getBatch: (id) =>
    tenantApi.get(`/admission/setup/batches/${id}`).then((r) => r.data),

  /** Create a new admission batch */
  createBatch: (data) =>
    tenantApi.post('/admission/setup/batches', data).then((r) => r.data),

  /** Update an existing batch */
  updateBatch: (id, data) =>
    tenantApi.put(`/admission/setup/batches/${id}`, data).then((r) => r.data),

  /** Toggle batch open/close status */
  toggleBatchStatus: (id) =>
    tenantApi.post(`/admission/setup/batches/${id}/toggle-status`).then((r) => r.data),

  /** Delete a batch */
  deleteBatch: (id) =>
    tenantApi.delete(`/admission/setup/batches/${id}`).then((r) => r.data),
};

export default admissionSetupApi;
