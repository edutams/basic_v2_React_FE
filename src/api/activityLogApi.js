import api from './auth';

const activityLogApi = {
  /**
   * Get paginated list of activities with optional filtering
   */
  getActivities: async (params) => {
    const response = await api.get('/activity-logs', { params });
    return response.data;
  },

  getActivity: async (id) => {
    const response = await api.get(`/activity-logs/${id}`);
    return response.data;
  },

  getActivitiesByCauser: async (causerId, params = {}) => {
    const response = await api.get(`/activity-logs/causer/${causerId}`, { params });
    return response.data;
  },

  getActivitiesBySubject: async (subjectId, params = {}) => {
    const response = await api.get(`/activity-logs/subject/${subjectId}`, { params });
    return response.data;
  },

  getLogNames: async () => {
    const response = await api.get('/activity-logs/log-names');
    return response.data;
  },

  /**
   * Get activity statistics
   */
  getStatistics: async (params = {}) => {
    const response = await api.get('/activity-logs/statistics', { params });
    return response.data;
  },

  /**
   * Prune (delete) activity logs older than specified days
   */
  pruneLogs: async (days) => {
    const response = await api.delete('/activity-logs/prune', {
      data: { days },
    });
    return response.data;
  },
};

export default activityLogApi;
