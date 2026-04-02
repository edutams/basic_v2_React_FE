import api from './auth';

const agentApi = {
  createAgent: async (data) => {
    const response = await api.post('/landlord/v1/organizations/create_organization', data);
    return response.data;
  },
  getAll: async (params) => {
    const response = await api.get('/landlord/v1/organizations/get_all_organizations', { params });
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/landlord/v1/organizations/get_analytics');
    return response.data;
  },
  update: async (id, data) => {
    const url = id ? `/landlord/v1/update_agent_profile/${id}` : `/landlord/v1/update_agent_profile`;
    const response = await api.post(url, data);
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/landlord/v1/organizations/get_agent_details/${id}`);
    return response.data;
  },
  impersonateAgent: async (id) => {
    const response = await api.post(`/landlord/v1/impersonation/agent/${id}`);
    return response.data;
  },
  impersonateTenant: async (id) => {
    const response = await api.post(`/agent/impersonate/tenant/${id}`);
    return response.data;
  },
};

export default agentApi;
