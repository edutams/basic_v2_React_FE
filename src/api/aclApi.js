import api from './auth';

const aclApi = {
  getRoles: async (params) => {
    const response = await api.get('/acl/roles/get_paginated_roles', { params });
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await api.put(`/acl/roles/${id}`, data);
    return response.data;
  },

  createRole: async (data) => {
    const response = await api.post('/acl/roles', data);
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await api.get('/acl/roles/permissions/all');
    return response.data;
  },

  getRolePermissions: async (roleId) => {
    const response = await api.get(`/acl/roles/${roleId}/permissions`);
    return response.data;
  },

  attachPermissions: async (roleId, permissions) => {
    const response = await api.post(`/acl/roles/${roleId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/acl/assignments');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/acl/assignments/users/list');
    return response.data;
  },

  getRolesList: async () => {
    const response = await api.get('/acl/assignments/roles/list');
    return response.data;
  },

  assignAgentRole: async (agentId, roleIds) => {
    const response = await api.post(`/acl/assignments/users/${agentId}/assign`, {
      roles: roleIds,
    });
    return response.data;
  },

  unassignUserRole: async (userId, data) => {
    const response = await api.post(`/acl/assignments/users/${agentId}/unassign`, data);
    return response.data;
  },

  getRoleAnalytics: async (params) => {
    const response = await api.get('/acl', { params });
    return response.data;
  },

  getPermissionAnalytics: async (params) => {
    const response = await api.get('/acl/permissions/analytics', { params });
    return response.data;
  },
};

export default aclApi;
