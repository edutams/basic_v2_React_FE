import tenantApi from '@/api/tenant/tenant_api';

// ── Physical Development Records ───────────────────────────────
// Backed by /physical-development in routes/tenant/physical_development.php
const physicalRecordApi = {
  // Students in a class arm for a term, with existing record values.
  // GET /physical-development?class_arm_id=&session_term_id=
  getRecords: (params) => tenantApi.get('/physical-development', { params }),

  // Bulk-save for a class arm.
  // POST /physical-development { class_arm_id, records: [...] }
  saveRecords: (data) => tenantApi.post('/physical-development', data),
};

export default physicalRecordApi;
