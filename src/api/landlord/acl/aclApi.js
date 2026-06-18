import api from '@/api/landlord/landlord_api';

const aclApi = {
  getRoles: async (params) => {
    const response = await api.get('/v1/landlord/acl/roles/get_paginated_roles', { params });
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await api.put(`/v1/landlord/acl/roles/${id}`, data);
    return response.data;
  },

  createRole: async (data) => {
    const response = await api.post('/v1/landlord/acl/roles', data);
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await api.get('/v1/landlord/acl/roles/permissions/all');
    return response.data;
  },

  getRolePermissions: async (roleId) => {
    const response = await api.get(`/v1/landlord/acl/roles/${roleId}/permissions`);
    return response.data;
  },

  attachPermissions: async (roleId, permissions) => {
    const response = await api.post(`/v1/landlord/acl/roles/${roleId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/v1/landlord/acl/assignments');
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/v1/landlord/acl/assignments/agents/list');
    return response.data;
  },

  getRolesList: async () => {
    const response = await api.get('/v1/landlord/acl/assignments/roles/list');
    return response.data;
  },

  assignAgentRole: async (agentId, roleIds) => {
    const response = await api.post(`/v1/landlord/acl/assignments/agents/${agentId}/assign`, {
      roles: roleIds,
    });
    return response.data;
  },

  unassignAgentRole: async (agentId, roleIds) => {
    const response = await api.post(`/v1/landlord/acl/assignments/agents/${agentId}/unassign`, {
      roles: roleIds,
    });
    return response.data;
  },

  getAgentDirectPermissions: async (agentId) => {
    const response = await api.get(`/v1/landlord/acl/assignments/agents/${agentId}/permissions`);
    return response.data;
  },

  assignAgentDirectPermissions: async (agentId, permissions) => {
    const response = await api.post(`/v1/landlord/acl/assignments/agents/${agentId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  getRoleAnalytics: async (params) => {
    const response = await api.get('/v1/landlord/acl/roles/analytics', { params });
    return response.data;
  },

  getPermissionAnalytics: async (params) => {
    const response = await api.get('/v1/landlord/acl/permissions/analytics', { params });
    return response.data;
  },

  getRoleOrganizations: async (roleId, params) => {
    const response = await api.get(`/v1/landlord/acl/roles/${roleId}/organizations`, { params });
    return response.data;
  },

  getRoleUsers: async (roleId, params) => {
    const response = await api.get(`/v1/landlord/acl/roles/${roleId}/users`, { params });
    return response.data;
  },

  getPermissionRoles: async (permissionId, params) => {
    const response = await api.get(`/v1/landlord/acl/permissions/${permissionId}/roles`, {
      params,
    });
    return response.data;
  },

  getPermissionOrganizations: async (permissionId, params) => {
    const response = await api.get(`/v1/landlord/acl/permissions/${permissionId}/organizations`, {
      params,
    });
    return response.data;
  },

};

export default aclApi;
