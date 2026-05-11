import api from './auth';

const agentApi = {
  createAgent: async (data) => {
    const response = await api.post('/v1/landlord/organizations/create_organization', data);
    return response.data;
  },
  getAll: async (params) => {
    const response = await api.get('/v1/landlord/organizations/get_all_organizations', { params });
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/v1/landlord/organizations/get_analytics');
    return response.data;
  },
  getSchoolChartData: async (params) => {
    const response = await api.get('/v1/landlord/organizations/get_school_chart_data', { params });
    return response.data;
  },
  getSubOrganizations: async (id, params) => {
    const response = await api.get(`/v1/landlord/organizations/${id}/sub-organizations`, {
      params,
    });
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.post(`/v1/landlord/organizations/update/${id}`, data);
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/v1/landlord/organizations/get_organization_details/${id}`);
    return response.data;
  },
  getTeamMembers: async () => {
    const response = await api.get(`/v1/landlord/organizations/team`);
    return response.data;
  },
  addTeamMember: async (data) => {
    const response = await api.post(`/v1/landlord/organizations/team`, data);
    return response.data;
  },
  updateTeamMember: async (orgId, memberId, data) => {
    const response = await api.put(
      `/v1/landlord/organizations/team/${orgId}/member/${memberId}`,
      data,
    );
    return response.data;
  },
  removeTeamMember: async (orgId, memberId) => {
    const response = await api.delete(
      `/v1/landlord/organizations/team/${orgId}/member/${memberId}`,
    );
    return response.data;
  },
  syncTeamMemberPermissions: async (orgId, memberId, data) => {
    const response = await api.post(
      `/v1/landlord/organizations/team/${orgId}/member/${memberId}/permissions`,
      data,
    );
    return response.data;
  },
  getLeadPermissions: async (id) => {
    const response = await api.get(`/v1/landlord/organizations/${id}/lead-permissions`);
    return response.data;
  },
  impersonateAgent: async (id) => {
    const response = await api.post(`/v1/landlord/impersonation/landlord/${id}`);
    return response.data;
  },
  impersonateTenant: async (id) => {
    const response = await api.post(`/v1/landlord/impersonation/tenant/${id}`);
    return response.data;
  },
};

export default agentApi;
