import api from './auth';

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

  // pruneLogs: async (days) => {
  //   const response = await api.delete('/activity-logs/prune', {
  //     data: { days },
  //   });
  //   return response.data;
  // },
};

export default activityLogApi;
