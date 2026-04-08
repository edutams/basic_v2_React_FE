import api from './auth';

const locationApi = {
  getStates: async () => {
    const res = await api.get('/landlord/v1/state/get_states');
    return res.data?.data;

  },
  getLgas: async (state_id) => {
    const res = await api.get(`/landlord/v1/state/lga/${state_id}/get_lga_by_state_id`);
    return res.data?.data;
  },
};

export default locationApi;
