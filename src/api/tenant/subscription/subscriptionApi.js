import tenantApi from '../tenant_api';

const subscriptionApi = {
  /**
   * Get form options (sessions, terms, plans) for subscription form
   */
  getFormOptions: async () => {
    const response = await tenantApi.get('/get-form-options');
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
   * Get subscription status
   */
  getSubscriptionStatus: async () => {
    const response = await tenantApi.get('/subscription-status');
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
   * Subscribe to a plan
   * @param {Object} data - { agent_plan_id, session_id, term_id? }
   */
  subscribe: async (data) => {
    const response = await tenantApi.post('/subscribe', data);
    return response.data;
  },

  /**
   * Get transactions for a subscription
   * @param {number|string} subscriptionId
   */
  getTransactions: async (subscriptionId) => {
    const response = await tenantApi.get(`/subscriptions/${subscriptionId}/transactions`);
    return response.data;
  },
};

export default subscriptionApi;
