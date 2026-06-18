import api from '@/api/landlord/landlord_api';

const moduleApi = {
  getModules: async (params) => {
    const response = await api.get('/v1/landlord/edu_tier/modules/get_modules', { params });
    return response.data.data;
  },

  getModule: async (id) => {
    const response = await api.get(`/v1/landlord/edu_tier/modules/get_agent_module/${id}`);
    return response.data.data;
  },

  createModule: async (data) => {
    const response = await api.post('/v1/landlord/edu_tier/modules/store_module', data);
    return response.data.data;
  },

  updateModule: async (id, data) => {
    const response = await api.put(`/v1/landlord/edu_tier/modules/update_module/${id}`, data);
    return response.data.data;
  },

  deleteModule: async (id) => {
    const response = await api.delete(`/v1/landlord/edu_tier/modules/delete_module/${id}`);
    return response.data.data;
  },

  activateModule: async (id) => {
    const response = await api.put(`/v1/landlord/edu_tier/modules/activate_module_tenants/${id}`, {
      module_status: 'active',
    });
    return response.data.data;
  },

  deactivateModule: async (id) => {
    const response = await api.put(
      `/v1/landlord/edu_tier/plan_modules/deactivate_module_tenants/${id}`,
      { module_status: 'inactive' },
    );
    return response.data.data;
  },

  getAllModules: async () => {
    const response = await api.get('/v1/landlord/edu_tier/modules/get_modules');
    return response.data.data;
  },

  getPackageModules: async (packageId) => {
    const response = await api.get(
      `/v1/landlord/edu_tier/modules/${packageId}/get_package_modules`,
    );
    return response.data.data;
  },

  savePlanModules: async (planId, moduleIds) => {
    const response = await api.post('/v1/landlord/edu_tier/plan_modules/save_plan_modules', {
      plan_id: planId,
      module_ids: moduleIds,
    });
    return response.data.data;
  },

  savePackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/v1/landlord/edu_tier/plan_modules/save_package_modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data.data;
  },

  /*********************************************************************************************
   *
   * Tenant Module APIs - Fetch from tenant_modules table using agent API
   * Now using the agent API which fetches from tenant_modules table
   *
   *********************************************************************************************/

  /**
   * Get all modules from tenant database (tenant_modules table)
   * Uses /api/v1/v1/landlord/edu_tier/modules endpoint
   * @param {Object} params - Query parameters (page, limit, search, status)
   */
  getTenantModules: async (params) => {
    const response = await api.get('/v1/landlord/edu_tier/modules/get_modules', { params });
    return response.data; // Return full response to handle data structure in component
  },

  /**
   * Get a single tenant module by ID
   * @param {number|string} id - Tenant Module ID
   */
  getTenantModule: async (id) => {
    const response = await api.get(`/v1/landlord/edu_tier/modules/${id}`);
    return response.data.data;
  },

  /**
   * Create a new module in tenant database
   * @param {Object} data - Tenant module data
   */
  createTenantModule: async (data) => {
    const response = await api.post('/v1/landlord/edu_tier/modules', data);
    return response.data.data;
  },

  /**
   * Update an existing module in tenant database
   * @param {number|string} id - Tenant Module ID
   * @param {Object} data - Module data to update
   */
  updateTenantModule: async (id, data) => {
    const response = await api.put(`/v1/landlord/edu_tier/modules/${id}`, data);
    return response.data.data;
  },

  deleteTenantModule: async (id) => {
    const response = await api.delete(`/v1/landlord/edu_tier/modules/${id}`);
    return response.data.data;
  },

  activateTenantModule: async (id) => {
    const response = await api.put(`/v1/landlord/edu_tier/modules/${id}`, {
      module_status: 'active',
    });
    return response.data.data;
  },
  
  deactivateTenantModule: async (id) => {
    const response = await api.put(`/v1/landlord/edu_tier/modules/${id}`, {
      module_status: 'inactive',
    });
    return response.data.data;
  },

  /**
   * Get all tenant modules (non-paginated list)
   */
  getAllTenantModules: async () => {
    const response = await api.get('/v1/landlord/edu_tier/modules/all');
    return response.data.data;
  },

  /**
   * Get sidebar modules from tenant
   */
  getTenantSidebarModules: async () => {
    const response = await api.get('/v1/landlord/edu_tier/sidebar-modules');
    return response.data.data;
  },

  /**
   * Get tenant packages
   */
  getTenantPackages: async () => {
    const response = await api.get('/v1/landlord/edu_tier/packages');
    return response.data.data;
  },

  /**
   * Get modules for a specific tenant package
   * @param {number|string} packageId - Tenant Package ID
   */
  getTenantPackageModules: async (packageId) => {
    const response = await api.get(`/v1/landlord/edu_tier/packages/${packageId}/modules`);
    return response.data.data;
  },

  /**
   * Save tenant package-module relationships
   * @param {number|string} packageId - Tenant Package ID
   * @param {Array} moduleIds - Array of module IDs
   */
  saveTenantPackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/v1/landlord/edu_tier/save-package-modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data.data;
  },
};

export default moduleApi;
