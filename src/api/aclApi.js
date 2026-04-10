import api from './auth';
import tenantApi from './tenant_api';

const aclApi = {
  getRoles: async (params) => {
    const response = await api.get('/landlord/v1/acl/roles/get_paginated_roles', { params });
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await api.put(`/landlord/v1/acl/roles/${id}`, data);
    return response.data;
  },

  createRole: async (data) => {
    const response = await api.post('/landlord/v1/acl/roles', data);
    return response.data;
  },

  getAllPermissions: async () => {
    const response = await api.get('/landlord/v1/acl/roles/permissions/all');
    return response.data;
  },

  getRolePermissions: async (roleId) => {
    const response = await api.get(`/landlord/v1/acl/roles/${roleId}/permissions`);
    return response.data;
  },

  attachPermissions: async (roleId, permissions) => {
    const response = await api.post(`/landlord/v1/acl/roles/${roleId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  getAssignments: async () => {
    const response = await api.get('/landlord/v1/acl/assignments');
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/landlord/v1/acl/assignments/agents/list');
    return response.data;
  },

  getRolesList: async () => {
    const response = await api.get('/landlord/v1/acl/assignments/roles/list');
    return response.data;
  },

  assignAgentRole: async (agentId, roleIds) => {
    const response = await api.post(`/landlord/v1/acl/assignments/agents/${agentId}/assign`, {
      roles: roleIds,
    });
    return response.data;
  },

  unassignAgentRole: async (agentId, roleIds) => {
    const response = await api.post(`/landlord/v1/acl/assignments/agents/${agentId}/unassign`, {
      roles: roleIds,
    });
    return response.data;
  },

  getAgentDirectPermissions: async (agentId) => {
    const response = await api.get(`/landlord/v1/acl/assignments/agents/${agentId}/permissions`);
    return response.data;
  },

  assignAgentDirectPermissions: async (agentId, permissions) => {
    const response = await api.post(`/landlord/v1/acl/assignments/agents/${agentId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  getRoleAnalytics: async (params) => {
    const response = await api.get('/landlord/v1/acl', { params });
    return response.data;
  },

  getPermissionAnalytics: async (params) => {
    const response = await api.get('/landlord/v1/acl/permissions/analytics', { params });
    return response.data;
  },

  getRoleOrganizations: async (roleId, params) => {
    const response = await api.get(`/landlord/v1/acl/roles/${roleId}/organizations`, { params });
    return response.data;
  },

  getRoleUsers: async (roleId, params) => {
    const response = await api.get(`/landlord/v1/acl/roles/${roleId}/users`, { params });
    return response.data;
  },

  /*************************************************************************************************************************************************************
    
    School ALC methods (using tenant-based tables - school_acl_tables)
    
  **************************************************************************************************************************************************************/

  getSchoolRoles: async (params) => {
    // console.log('Fetching school roles with params:', tenantApi.defaults.baseURL, params);
    const response = await tenantApi.get('/landlord/v1/censis/acl/roles/get_paginated_roles', {
      params,
    });
    return response.data;
  },

  createSchoolRole: async (data) => {
    const response = await tenantApi.post('/landlord/v1/censis/acl/roles', data);
    return response.data;
  },

  updateSchoolRole: async (id, data) => {
    const response = await tenantApi.put(`/landlord/v1/censis/acl/roles/${id}`, data);
    return response.data;
  },

  getSchoolRolePermissions: async (roleId) => {
    const response = await tenantApi.get(`/landlord/v1/censis/acl/roles/${roleId}/permissions`);
    return response.data;
  },

  attachSchoolRolePermissions: async (roleId, permissions) => {
    const response = await tenantApi.post(`/landlord/v1/censis/acl/roles/${roleId}/permissions`, {
      permissions,
    });
    return response.data;
  },

  getSchoolAllPermissions: async () => {
    const response = await tenantApi.get('/landlord/v1/censis/acl/roles/permissions/all');
    return response.data;
  },

  getSchoolUsers: async () => {
    const response = await tenantApi.get('/landlord/v1/censis/acl/assignments/users/list');
    return response.data;
  },

  getSchoolRolesList: async () => {
    const response = await tenantApi.get('/landlord/v1/censis/acl/assignments/roles/list');
    return response.data;
  },

  assignSchoolUserRole: async (userId, roleIds) => {
    const response = await tenantApi.post('/landlord/v1/censis/acl/assignments/users/assign', {
      user_id: userId,
      roles: roleIds,
    });
    return response.data;
  },

  unassignSchoolUserRole: async (userId, roleIds) => {
    const response = await tenantApi.post('/landlord/v1/censis/acl/assignments/users/unassign', {
      user_id: userId,
      roles: roleIds,
    });
    return response.data;
  },

  getSchoolRoleAnalytics: async (params) => {
    const response = await tenantApi.get('/landlord/v1/censis/acl', { params });
    return response.data;
  },

  getSchoolPermissionAnalytics: async (params) => {
    const response = await tenantApi.get('/landlord/v1/censis/acl/permissions/analytics', {
      params,
    });
    return response.data;
  },
};

export default aclApi;
