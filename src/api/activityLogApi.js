import tenantApi from './tenant_api';

const activityLogApi = {
  /**
   * Get paginated list of activities with optional filtering
   */
  getActivities: async (params) => {
    const response = await tenantApi.get('/activity-logs', { params });
    return response.data;
  },

  /**
   * Get a single activity by ID
   */
  getActivity: async (id) => {
    const response = await tenantApi.get(`/activity-logs/${id}`);
    return response.data;
  },

  /**
   * Get activities by a specific user (causer)
   */
  getActivitiesByCauser: async (causerId, params = {}) => {
    const response = await tenantApi.get(`/activity-logs/causer/${causerId}`, { params });
    return response.data;
  },

  /**
   * Get activities for a specific subject
   */
  getActivitiesBySubject: async (subjectId, params = {}) => {
    const response = await tenantApi.get(`/activity-logs/subject/${subjectId}`, { params });
    return response.data;
  },

  /**
   * Get all unique log names
   */
  getLogNames: async () => {
    const response = await tenantApi.get('/activity-logs/log-names');
    return response.data;
  },

  /**
   * Get activity statistics
   */
  getStatistics: async (params = {}) => {
    const response = await tenantApi.get('/activity-logs/statistics', { params });
    return response.data;
  },

  /**
   * Prune (delete) activity logs older than specified days
   */
  pruneLogs: async (days) => {
    const response = await tenantApi.delete('/activity-logs/prune', {
      data: { days },
    });
    return response.data;
  },
};

export default activityLogApi;
