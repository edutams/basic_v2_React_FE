import tenantApi from '../tenant_api';

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

  };

export default subscriptionApi;

export const fetchSubscriptionStatus = subscriptionApi.getSubscriptionStatus;
