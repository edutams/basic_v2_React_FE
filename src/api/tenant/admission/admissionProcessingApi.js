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
 * @param {number} [options.programme_id] - programme ID (when admitting)
 * @param {number} [options.class_id] - class ID (when admitting)
 * @param {number} [options.class_arm_id] - class arm ID (when admitting)
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
  if (options.programme_id) {
    payload.programme_id = options.programme_id;
  }
  if (options.class_id) {
    payload.class_id = options.class_id;
  }
  if (options.class_arm_id) {
    payload.class_arm_id = options.class_arm_id;
  }
  if (options.admission_number) {
    payload.admission_number = options.admission_number;
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

/**
 * Fetch classes for a specific admission batch
 * GET /admission/process/batch-classes/{batchId}
 * @param {number} batchId - the admission batch ID
 */
export const fetchBatchClasses = async (batchId) => {
  const response = await api.get(`/admission/process/batch-classes/${batchId}`);
  return response.data;
};

/**
 * Fetch applications by batch and class for batch processing
 * POST /admission/process/applications-by-class
 * @param {Object} filters - { appBatchId, classId, search }
 */
export const fetchApplicationsByClass = async (filters = null) => {
  const response = await api.post('/admission/process/applications-by-class', { filters });
  return response.data;
};

/**
 * Batch process admissions (admit/decline/revoke multiple applications)
 * POST /admission/process/batch-process
 * @param {Object} data - { action, form_numbers, programme_id, class_id, class_arm_id, rejection_reason, revoked_reason, admission_prefix }
 */
export const batchProcessAdmissions = async (data) => {
  const response = await api.post('/admission/process/batch-process', data);
  return response.data;
};

/**
 * Download an Excel template of admission applicants for a given batch and class arm
 * GET /admission/process/download-template
 * @param {Object} params - { batch_id, class_arm_id }
 */
export const downloadAdmissionTemplate = async (params) => {
  const response = await api.get('/admission/process/download-template', {
    params,
    responseType: 'blob',
  });
  return response;
};

/**
 * Upload a filled Excel template to bulk admit applicants
 * POST /admission/process/upload-template
 * @param {FormData} formData - file and batch info
 */
export const uploadAdmissionTemplate = async (formData) => {
  const response = await api.post('/admission/process/upload-template', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Fetch enrolled wards for the currently logged-in guardian/parent
 * GET /admission/process/enrolled-wards
 */
export const fetchEnrolledWards = async () => {
  const response = await api.get('/admission/process/enrolled-wards');
  return response.data;
};

/**
 * Fetch detailed information for a single enrolled ward
 * GET /admission/process/enrolled-wards/{id}
 * @param {number} wardId - the ward's user ID
 */
export const fetchWardDetail = async (wardId) => {
  const response = await api.get(`/admission/process/enrolled-wards/${wardId}`);
  return response.data;
};
