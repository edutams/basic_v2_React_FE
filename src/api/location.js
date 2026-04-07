import api from './auth';

const locationApi = {
  getStates: async () => {
    const response = await api.get('/landlord/v1/state/fetch');
    return response?.data.data || [];
  },
  getLgas: async (stateId) => {
    const response = await api.get(`/landlord/v1/state/lga/${stateId}`);
    return response?.data.data || [];
  },
};

export default locationApi;
