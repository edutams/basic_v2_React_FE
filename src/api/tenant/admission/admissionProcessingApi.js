import api from '@/api/tenant/tenant_api';

/**
 * Fetch all admission batches for the school (for filter dropdown)
 * GET /admission/process/batches
 */
export const fetchAllAdmissionBatches = async () => {
  const response = await api.get('/admission/process/batches');
  return response.data;
};

/**
 * Fetch paginated applications with filters
 * POST /admission/process/applications
 * @param {Object} filters - { appBatchId, search }
 * @param {string|null} url - Optional pagination URL override
 */
export const fetchApplications = async (filters = null, url = null) => {
  const endpoint = url || '/admission/process/applications';
  const response = await api.post(endpoint, { filters });
  return response.data;
};

/**
 * Fetch application statistics (total, admitted, declined, pending)
 * POST /admission/process/stats
 * @param {Object} filters - { appBatchId, search }
 */
export const fetchApplicationStats = async (filters = null) => {
  const response = await api.post('/admission/process/stats', { filters });
  return response.data;
};

/**
 * Auto-admit applicants for a batch
 * POST /admission/process/auto-admit
 * @param {Object} data
 */
export const autoAdmitApplications = async (data) => {
  const response = await api.post('/admission/process/auto-admit', data);
  return response.data;
};

/**
 * Reset admission offer for an applicant
 * POST /admission/process/reset-offer
 * @param {Object} payload - { form_number, status, fname, lname, mname, batchname, prog_name, sesname }
 */
export const resetAdmissionOffer = async (payload) => {
  const response = await api.post('/admission/process/reset-offer', payload);
  return response.data;
};

/**
 * Accept admission offer for an applicant
 * POST /admission/process/accept-offer
 * @param {Object} app - the application data
 */
export const acceptAdmissionOffer = async (app) => {
  const response = await api.post('/admission/process/accept-offer', app);
  return response.data;
};

/**
 * Fetch a single applicant's details by form number for processing
 * GET /admission/process/applicant/{formNumber}
 * @param {string} formNumber - the applicant's form number
 */
export const getApplicantByFormNumber = async (formNumber) => {
  const response = await api.get(`/admission/process/applicant/${formNumber}`);
  return response.data;
};

/**
 * Update admission status for an applicant (admit / decline / pending / revoked)
 * POST /admission/process/update-status
 * @param {string} formNumber - the applicant's form number
 * @param {string} status - 'admitted' | 'declined' | 'pending' | 'revoked'
 * @param {Object} [options] - additional options
 * @param {string} [options.rejection_reason] - reason for rejection (when declining)
 * @param {string} [options.revoked_reason] - reason for revocation (when revoking)
 */
export const updateAdmissionStatus = async (formNumber, status, options = {}) => {
  const payload = {
    form_number: formNumber,
    status,
  };
  if (options.rejection_reason) {
    payload.rejection_reason = options.rejection_reason;
  }
  if (options.revoked_reason) {
    payload.revoked_reason = options.revoked_reason;
  }
  const response = await api.post('/admission/process/update-status', payload);
  return response.data;
};

/**
 * Fetch payment history for an applicant
 * GET /admission/process/payment-history/{formNumber}
 * @param {string} formNumber - the applicant's form number
 */
export const fetchApplicantPaymentHistory = async (formNumber) => {
  const response = await api.get(`/admission/process/payment-history/${formNumber}`);
  return response.data;
};

/**
 * Update an applicant's form details (edit form)
 * POST /admission/process/update-form
 * @param {Object} data - the form data to update
 */
export const updateApplicantForm = async (data) => {
  const response = await api.post('/admission/process/update-form', data);
  return response.data;
};
