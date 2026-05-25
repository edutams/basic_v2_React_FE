import api from '@/api/tenant/tenant_api';

// ─── Admin Endpoints ─────────────────────────────────────────────────────────

// Get all admission batches for a given session term
export const fetchAdmissionBatches = async (sessionTermId) => {
  const response = await api.get('/admission/batches', {
    params: { session_term_id: sessionTermId },
  });
  return response.data;
};

// Create a new admission batch
export const createAdmissionBatch = async (data) => {
  const response = await api.post('/admission/batches', data);
  return response.data;
};

// Update an existing admission batch
export const updateAdmissionBatch = async (id, data) => {
  const response = await api.put(`/admission/batches/${id}`, data);
  return response.data;
};

// Toggle batch open / close status
export const toggleAdmissionBatchStatus = async (id) => {
  const response = await api.patch(`/admission/batches/${id}/toggle-status`);
  return response.data;
};

// Get entry session term options (current + next term)
export const fetchAdmissionEntrySessionTerm = async (sessionTermId) => {
  const response = await api.get(`/admission/entry-session-terms/${sessionTermId}`);
  return response.data;
};

// ─── Public / Student Endpoints ──────────────────────────────────────────────

// Get all available admission batches (student-facing)
export const getBatches = (params = {}) =>
  api.get('/admission/batches', { params });

// Get a specific batch by ID
export const getBatch = (id) => api.get(`/admission/batches/${id}`);

// Apply for admission with a specific batch
export const applyForAdmission = (batchId, data) =>
  api.post(`/admission/batches/${batchId}/apply`, data);

// Get application status
export const getApplicationStatus = (applicationId) =>
  api.get(`/admission/applications/${applicationId}`);
