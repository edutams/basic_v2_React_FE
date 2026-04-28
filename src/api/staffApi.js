import tenantApi from './tenant_api';

const staffApi = {
  getAll: async (params = {}) => {
    const response = await tenantApi.get('/school_setup/staff/all', { params });
    return response.data;
  },

  getSingle: async (id) => {
    const response = await tenantApi.get(`/school_setup/staff/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await tenantApi.post('/school_setup/staff/create_staff', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await tenantApi.put(`/school_setup/staff/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await tenantApi.delete(`/school_setup/staff/${id}`);
    return response.data;
  },
};

export default staffApi;
