import agentApi from './auth';

const gatewayApi = {
  getAll: () => agentApi.get('/landlord/v1/gateways'),

  create: (data) => agentApi.post('/landlord/v1/gateways', data),

  update: (id, data) => agentApi.put(`/landlord/v1/gateways/${id}`, data),

  delete: (id) => agentApi.delete(`/landlord/v1/gateways/${id}`),
};

export default gatewayApi;
