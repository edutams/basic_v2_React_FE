import agentApi from '@/api/landlord/landlord_api';

const gatewayApi = {
  getAll: (params = {}) => agentApi.get('/v1/landlord/gateways', { params }),

  create: (data) => agentApi.post('/v1/landlord/gateways', data),

  update: (id, data) => agentApi.put(`/v1/landlord/gateways/${id}`, data),

  delete: (id) => agentApi.delete(`/v1/landlord/gateways/${id}`),

  saveSchoolGateway: async (data) => {
    const res = await agentApi.post('/v1/landlord/gateways/save_school_gateway', data);
    return res.data;
  }
};

export default gatewayApi;
