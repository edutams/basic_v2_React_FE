import api from '@/api/landlord/landlord_api';

const activityLogApi = {
  getActivities: async (params) => {
    const response = await api.get('/v1/landlord/activity-logs', { params });
    return response.data;
  },

  getActivity: async (id) => {
    const response = await api.get(`/v1/landlord/activity-logs/${id}`);
    return response.data;
  },

  getActivitiesByCauser: async (causerId, params = {}) => {
    const response = await api.get(`/v1/landlord/activity-logs/causer/${causerId}`, {
      params,
    });
    return response.data;
  },

  getActivitiesBySubject: async (subjectId, params = {}) => {
    const response = await api.get(`/v1/landlord/activity-logs/subject/${subjectId}`, {
      params,
    });
    return response.data;
  },

  getLogNames: async () => {
    const response = await api.get('/v1/landlord/activity-logs/log-names');
    return response.data;
  },

  getStatistics: async (params = {}) => {
    const response = await api.get('/v1/landlord/activity-logs/statistics', { params });
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get('/v1/landlord/activity-logs/filter-options');
    return response.data;
  },

  getTenantLoginStats: async (params = {}) => {
    const response = await api.get('/v1/landlord/activity-logs/tenant-login-stats', { params });
    return response.data;
  },

  getLoginActivities30Days: async (params = {}) => {
    const response = await api.get('/v1/landlord/activity-logs/login-activities-30days', { params });
    return response.data;
  },

  getTenantLoggedInUsers: async (tenantId, params = {}) => {
    const response = await api.get(`/v1/landlord/activity-logs/tenant/${tenantId}/users`, { params });
    return response.data;
  },

  getAgentLoggedInUsers: async (params = {}) => {
    const response = await api.get('/v1/landlord/activity-logs/agents/users', { params });
    return response.data;
  },

  exportExcel: async (data) => {
    const response = await api.post('/v1/landlord/activity-logs/export-excel', data, {
      responseType: 'blob'
    });
    return response;
  },

};

export default activityLogApi;
