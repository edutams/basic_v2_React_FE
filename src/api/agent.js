import api from './auth';

const agentApi = {
  create: async (data) => {
    const response = await api.post('/agent/create_agent', data);
    return response.data;
  },
  getAll: async (params) => {
    // Modify based on actual backend implementation if needed (currently using mock data in component)
    // Assuming we need an endpoint to fetch agents
    const response = await api.get('/agent/get_all_agents', { params });
    return response.data;
  },
  update: async (data) => {
    const response = await api.post(`/agent/update_agent_profile`, data);
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/agent/get_agent_details/${id}`);
    return response.data;
  },
  impersonateAgent: async (id) => {
    const response = await api.post(`/agent/impersonate/agent/${id}`);
    return response.data;
  },
  impersonateTenant: async (id) => {
    const response = await api.post(`/agent/impersonate/tenant/${id}`);
    return response.data;
  },
};


export default agentApi;
