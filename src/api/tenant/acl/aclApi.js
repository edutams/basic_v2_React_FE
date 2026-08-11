import tenantApi from '@/api/tenant/tenant_api';


const aclApi = {
    getSchoolRoles: async (params) => {
        const response = await tenantApi.get('/censis/acl/roles/get_paginated_roles', {
            params,
            without_pagination: true,
        });
        return response.data;
    },

    createSchoolRole: async (data) => {
        const response = await tenantApi.post('/censis/acl/roles', data);
        return response.data;
    },

    updateSchoolRole: async (id, data) => {
        const response = await tenantApi.put(`/censis/acl/roles/${id}`, data);
        return response.data;
    },

    attachSchoolRolePermissions: async (roleId, permissions) => {
        const response = await tenantApi.post(`/censis/acl/roles/${roleId}/permissions`, {
            permissions,
        });
        return response.data;
    },

    getSchoolAllPermissions: async () => {
        const response = await tenantApi.get('/censis/acl/roles/permissions/all');
        return response.data;
    },

    getSchoolUsers: async () => {
        const response = await tenantApi.get('/censis/acl/assignments/users/list');
        return response.data;
    },

    getSchoolRolesList: async () => {
        const response = await tenantApi.get('/censis/acl/assignments/roles/list');
        return response.data;
    },

    assignSchoolUserRole: async (userId, roleIds) => {
        const response = await tenantApi.post('/censis/acl/assignments/users/assign', {
            user_id: userId,
            roles: roleIds,
        });
        return response.data;
    },

    unassignSchoolUserRole: async (userId, roleIds) => {
        const response = await tenantApi.post('/censis/acl/assignments/users/unassign', {
            user_id: userId,
            roles: roleIds,
        });
        return response.data;
    },

    getSchoolRoleAnalytics: async (params) => {
        const response = await tenantApi.get('/censis/acl', { params });
        return response.data;
    },

    getSchoolRoleSummaryStats: async () => {
        const response = await tenantApi.get('/censis/acl/roles/summary_stats');
        return response.data;
    },

    getSchoolAssignmentSummaryStats: async () => {
        const response = await tenantApi.get('/censis/acl/assignments/users/summary_stats');
        return response.data;
    },

    toggleSchoolUserStatus: async (userId) => {
        const response = await tenantApi.post(`/censis/acl/assignments/users/${userId}/toggle_status`);
        return response.data;
    },

    getSchoolPermissionAnalytics: async (params) => {
        const response = await tenantApi.get('/censis/acl/permissions/analytics', {
            params,
        });
        return response.data;
    },

    // Modal-specific API functions
    getSchoolRoleUsers: async (roleId, params) => {
        const response = await tenantApi.get(`/censis/acl/roles/${roleId}/users`, {
            params,
        });
        return response.data;
    },

    getSchoolRolesByPermission: async (permissionId, params) => {
        const response = await tenantApi.get(`/censis/acl/permissions/${permissionId}/roles`, {
            params,
        });
        return response.data;
    },

    getSchoolUsersByPermission: async (permissionId, params) => {
        const response = await tenantApi.get(`/censis/acl/permissions/${permissionId}/users`, {
            params,
        });
        return response.data;
    },
    getSchoolRolePermissions: async (roleId, params = {}) => {
        const response = await tenantApi.get(`/censis/acl/roles/${roleId}/permissions`, { params });
        return response.data;
    },

    getSchoolAllRolePermissions: async (roleId) => {
        const response = await tenantApi.get(`/censis/acl/roles/${roleId}/permissions/all`);
        return response.data;
    },

    getSchoolUserDirectPermissions: async (userId) => {
        const response = await tenantApi.get(`/censis/acl/assignments/users/${userId}/permissions`);
        return response.data;
    },

    assignSchoolUserDirectPermissions: async (userId, permissions) => {
        const response = await tenantApi.post(`/censis/acl/assignments/users/${userId}/permissions`, {
            permissions,
        });
        return response.data;
    },

    revokeSchoolUserDirectPermissions: async (userId, permissions) => {
        const response = await tenantApi.post(
            `/censis/acl/assignments/users/${userId}/permissions/revoke`,
            {
                permissions,
            },
        );
        return response.data;
    },

    getSchoolUserProfile: async (userId) => {
        const response = await tenantApi.get(`/users/${userId}/profile`);
        return response.data;
    },

    updateSchoolUserProfile: async (userId, data) => {
        const response = await tenantApi.post(`/users/${userId}/profile`, data);
        return response.data;
    },

    changeSchoolUserPassword: async (userId, data) => {
        const response = await tenantApi.post(`/users/${userId}/password`, data);
        return response.data;
    },

    getUserActivityLogs: async (userId, params = {}) => {
        const response = await tenantApi.get(`/activity-logs/causer/${userId}`, { params });
        return response.data;
    },
};

export default aclApi;