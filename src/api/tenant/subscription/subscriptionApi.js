import tenantApi from '../tenant_api';

/**
 * Fetch a PDF (auth headers included, via tenantApi) and return an object
 * URL for it. Both invoice and receipt PDFs are now generated server-side
 * (Dompdf), not via window.print(), so every consumer needs this same
 * authenticated fetch — a plain <a href> or window.open(url) wouldn't carry
 * the auth token.
 */
const fetchPdfBlobUrl = async (url) => {
  let response;
  try {
    response = await tenantApi.get(url, { responseType: 'blob' });
  } catch (err) {
    // A non-2xx response (e.g. the receipt's "not approved yet" 422) still
    // comes back as a Blob because responseType forced it — without this,
    // callers' existing `err.response?.data?.message` pattern would find a
    // Blob instead of the real message. Parse it out and re-throw in the
    // same shape the rest of the app already expects.
    if (err.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        err.response.data = JSON.parse(text);
      } catch {
        // Not JSON either — leave the original error as-is.
      }
    }
    throw err;
  }

  return window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
};

/** Fetch a PDF and trigger a browser save-as download for it. */
const downloadBlob = async (url, filename) => {
  const blobUrl = await fetchPdfBlobUrl(url);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

/** Fetch a PDF and open it in a new tab — for "Print", so the browser's own PDF viewer (with its print button) handles it. */
const openBlobInNewTab = async (url) => {
  const blobUrl = await fetchPdfBlobUrl(url);
  window.open(blobUrl, '_blank');
  // Deliberately not revoking the object URL immediately — the new tab
  // needs it to still resolve after this function returns.
};

const subscriptionApi = {
  /**
   * Get all sessions for the subscription form dropdown
   */
  getSessions: async () => {
    const response = await tenantApi.get('/subscriptions/sessions');
    return response.data;
  },

  /**
   * Get terms available for a session (excludes already subscribed)
   * @param {number|string} sessionId
   */
  getTermsBySession: async (sessionId) => {
    const response = await tenantApi.get(`/subscriptions/terms-by-session/${sessionId}`);
    return response.data;
  },

  /**
   * Get available plans for the subscription form dropdown
   */
  getPlans: async () => {
    const response = await tenantApi.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Get available plans filtered by student population range
   * @param {string} studentpopulation - e.g. "1-50", "51-100", etc.
   */
  getPlansByPopulation: async (studentpopulation) => {
    const response = await tenantApi.post('/subscriptions/plans-by-population', { studentpopulation });
    return response.data;
  },

 

  /**
   * Get all subscriptions for the current tenant (table data)
   * @param {Object} params - query params (search, status)
   */
  getSubscriptions: async (params = {}) => {
    const response = await tenantApi.get('/subscriptions', { params });
    return response.data;
  },

  /**
   * Get a single subscription by ID
   * @param {number|string} id
   */
  getSubscription: async (id) => {
    const response = await tenantApi.get(`/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Create a new subscription
   * @param {Object} data - { agent_plan_id, session_id, term_id?, subscription_mode? }
   */
  createSubscription: async (data) => {
    const response = await tenantApi.post('/subscriptions', data);
    return response.data;
  },

  /**
   * Update a subscription
   * @param {number|string} id
   * @param {Object} data
   */
  updateSubscription: async (id, data) => {
    const response = await tenantApi.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a subscription
   * @param {number|string} id
   */
  deleteSubscription: async (id) => {
    const response = await tenantApi.delete(`/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Manually extend a pending subscription's grace period — super_admin only
   * @param {number|string} id
   * @param {string} dueDate - 'YYYY-MM-DD'
   */
  extendDueDate: async (id, dueDate) => {
    const response = await tenantApi.put(`/subscriptions/${id}/extend-due-date`, { due_date: dueDate });
    return response.data;
  },

  /**
   * Download a subscription's invoice as a server-generated PDF.
   * @param {number|string} id
   */
  downloadInvoicePdf: (id) => downloadBlob(`/subscriptions/${id}/invoice/download`, `invoice_${id}.pdf`),

  /** Open a subscription's invoice PDF in a new tab, for printing. */
  printInvoicePdf: (id) => openBlobInNewTab(`/subscriptions/${id}/invoice/download`),

  /**
   * Download a transaction's receipt as a server-generated PDF — only
   * available once the transaction is approved.
   * @param {string} transId
   */
  downloadReceiptPdf: (transId) =>
    downloadBlob(`/subscriptions/transactions/${transId}/receipt/download`, `receipt_${transId}.pdf`),

  /** Open a transaction's receipt PDF in a new tab, for printing. */
  printReceiptPdf: (transId) => openBlobInNewTab(`/subscriptions/transactions/${transId}/receipt/download`),

  /**
   * Upgrade a subscription to a new plan
   * @param {number|string} id - subscription ID
   * @param {Object} data - { my_plan_id }
   */
  upgradeSubscription: async (id, data) => {
    const response = await tenantApi.put(`/subscriptions/${id}/upgrade`, data);
    return response.data;
  },

  /**
   * Revert a subscription to a previous plan
   * @param {number|string} id - subscription ID
   * @param {Object} data - { my_plan_id }
   */
  revertSubscription: async (id, data) => {
    const response = await tenantApi.put(`/subscriptions/${id}/revert`, data);
    return response.data;
  },

  /**
   * Get subscription status
   */
  getSubscriptionStatus: async () => {
    const response = await tenantApi.get('/subscriptions/status');
    return response.data;
  },

  /**
   * Get subscription charges from config
   */
  getSubscriptionCharges: async () => {
    const response = await tenantApi.get('/subscriptions/subscription-charges');
    return response.data;
  },

  /**
   * Get available plans for the tenant
   */
  getMyPlans: async () => {
    const response = await tenantApi.get('/my-plans');
    return response.data;
  },

  /**
   * Get transaction data for a subscription (payment details)
   * @param {number|string} id - subscription ID
   */
  getTransactionData: async (id) => {
    const response = await tenantApi.get(`/subscriptions/${id}/transaction-data`);
    return response.data;
  },

  /**
   * Create a subscription transaction and return payment gateway data
   * @param {Object} data - { subscription_id }
   */
  createTransaction: async (data) => {
    const response = await tenantApi.post('/subscriptions/create-transaction', data);
    return response.data;
  },

  /**
   * Get the payment breakdown for a per_session subscription group
   * (one row per term, plus the combined total due)
   * @param {number|string} sessionId
   */
  getBulkTransactionData: async (sessionId) => {
    const response = await tenantApi.get(`/subscriptions/session/${sessionId}/bulk-transaction-data`);
    return response.data;
  },

  /**
   * Pay for every pending term in a per_session subscription group with a
   * single gateway transaction
   * @param {Object} data - { session_id }
   */
  createBulkTransaction: async (data) => {
    const response = await tenantApi.post('/subscriptions/create-bulk-transaction', data);
    return response.data;
  },

  /**
   * Get subscription transaction history
   * @param {Object} params - { status, search, per_page, page }
   */
  getHistory: async (params = {}) => {
    const response = await tenantApi.get('/subscriptions/history', { params });
    return response.data;
  },

  /**
   * Manually requery a transaction's status from the gateway ("Check Status")
   * @param {string} bulkOrderId - the transaction's bulk_order_id (trans_bulk_id)
   */
  checkTransactionStatus: async (bulkOrderId) => {
    const response = await tenantApi.post(`/subscriptions/transactions/${bulkOrderId}/check-status`);
    return response.data;
  },

  };

export default subscriptionApi;

export const fetchSubscriptionStatus = subscriptionApi.getSubscriptionStatus;
