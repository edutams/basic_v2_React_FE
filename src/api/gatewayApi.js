import agentApi from './auth';

const gatewayApi = {
  getAll: (params = {}) => agentApi.get('/v1/landlord/gateways', { params }),

  create: (data) => agentApi.post('/v1/landlord/gateways', data),

  update: (id, data) => agentApi.put(`/v1/landlord/gateways/${id}`, data),

  delete: (id) => agentApi.delete(`/v1/landlord/gateways/${id}`),
};

export default gatewayApi;
