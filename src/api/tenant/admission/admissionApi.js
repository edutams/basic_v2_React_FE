import tenantApi from '@/api/tenant/tenant_api';

const admissionApi = {
  // Get all available admission batches
  getBatches: (params = {}) => tenantApi.get('/admission/batches', { params }),

  // Get a specific batch by ID
  getBatch: (id) => tenantApi.get(`/admission/batches/${id}`),

  // Apply for admission with a specific batch
  applyForAdmission: (batchId, data) =>
    tenantApi.post(`/admission/batches/${batchId}/apply`, data),

  // Get application status
  getApplicationStatus: (applicationId) =>
    tenantApi.get(`/admission/applications/${applicationId}`),
};

export default admissionApi;
