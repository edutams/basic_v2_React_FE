import api from './auth';

const locationApi = {
  getStates: async () => {
    const response = await api.get('/agent/get_states');
    return response.data?.data || [];
  },
  getLgas: async (stateId) => {
    const response = await api.get(`/agent/${stateId}/get_lga_by_state_id`);
    return response.data?.data || [];
  },
};

export default locationApi;
