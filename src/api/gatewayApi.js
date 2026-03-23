import agentApi from './auth';

const gatewayApi = {
  getAll: () => agentApi.get('/agent/gateways'),

  create: (data) => agentApi.post('/agent/gateways', data),

  update: (id, data) => agentApi.put(`/agent/gateways/${id}`, data),

  delete: (id) => agentApi.delete(`/agent/gateways/${id}`),
};

export default gatewayApi;
