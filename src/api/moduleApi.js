import api from './auth';
import tenantApi from './tenant_api';

const moduleApi = {
  /**
   * Get all modules from landlord/agent (modules table)
   */
  getModules: async (params) => {
    const response = await api.get('/modules', { params });
    return response.data;
  },

  /**
   * Get a single module by ID from landlord/agent
   * @param {number|string} id - Module ID
   */
  getModule: async (id) => {
    const response = await api.get(`/modules/${id}`);
    return response.data;
  },

  /**
   * Create a new module in landlord/agent
   * @param {Object} data - Module data
   */
  createModule: async (data) => {
    const response = await api.post('/modules', data);
    return response.data;
  },

  /**
   * Update an existing module in landlord/agent
   * @param {number|string} id - Module ID
   * @param {Object} data - Module data to update
   */
  updateModule: async (id, data) => {
    const response = await api.put(`/modules/${id}`, data);
    return response.data;
  },

  /**
   * Delete a module from landlord/agent
   * @param {number|string} id - Module ID
   */
  deleteModule: async (id) => {
    const response = await api.delete(`/modules/${id}`);
    return response.data;
  },

  /**
   * Activate a module (landlord/agent)
   * @param {number|string} id - Module ID
   */
  activateModule: async (id) => {
    const response = await api.put(`/modules/${id}`, { module_status: 'active' });
    return response.data;
  },

  /**
   * Deactivate a module (landlord/agent)
   * @param {number|string} id - Module ID
   */
  deactivateModule: async (id) => {
    const response = await api.put(`/modules/${id}`, { module_status: 'inactive' });
    return response.data;
  },

  /**
   * Get all modules (non-paginated list) from landlord/agent
   */
  getAllModules: async () => {
    const response = await api.get('/modules/all');
    return response.data;
  },

  /**
   * Get modules for a specific package from landlord/agent
   * @param {number|string} packageId - Package ID
   */
  getPackageModules: async (packageId) => {
    const response = await api.get(`/packages/${packageId}/modules`);
    return response.data;
  },

  /**
   * Save plan-module relationships (landlord/agent)
   * @param {number|string} planId - Plan ID
   * @param {Array} moduleIds - Array of module IDs
   */
  savePlanModules: async (planId, moduleIds) => {
    const response = await api.post('/save-plan-modules', {
      plan_id: planId,
      module_ids: moduleIds,
    });
    return response.data;
  },

  /**
   * Save package-module relationships (landlord/agent)
   * @param {number|string} packageId - Package ID
   * @param {Array} moduleIds - Array of module IDs
   */
  savePackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/save-package-modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data;
  },

  /*************************************************************************************************************************************************************
   *
   * Tenant Module APIs - Fetch from tenant_modules table using /api/v1/modules
   *
   *************************************************************************************************************************************************************/

  /**
   * Get all modules from tenant database (tenant_modules table)
   * Uses /api/v1/modules endpoint
   * @param {Object} params - Query parameters (page, limit, search, status)
   */
  getTenantModules: async (params) => {
    const response = await tenantApi.get('/modules', { params });
    return response.data;
  },

  /**
   * Get a single tenant module by ID
   * @param {number|string} id - Tenant Module ID
   */
  getTenantModule: async (id) => {
    const response = await tenantApi.get(`/modules/${id}`);
    return response.data;
  },

  /**
   * Create a new module in tenant database
   * @param {Object} data - Tenant module data
   */
  createTenantModule: async (data) => {
    const response = await tenantApi.post('/modules', data);
    return response.data;
  },

  /**
   * Update an existing module in tenant database
   * @param {number|string} id - Tenant Module ID
   * @param {Object} data - Module data to update
   */
  updateTenantModule: async (id, data) => {
    const response = await tenantApi.put(`/modules/${id}`, data);
    return response.data;
  },

  /**
   * Delete a module from tenant database
   * @param {number|string} id - Tenant Module ID
   */
  deleteTenantModule: async (id) => {
    const response = await tenantApi.delete(`/modules/${id}`);
    return response.data;
  },

  /**
   * Activate a tenant module
   * @param {number|string} id - Tenant Module ID
   */
  activateTenantModule: async (id) => {
    const response = await tenantApi.put(`/modules/${id}`, { module_status: 'active' });
    return response.data;
  },

  /**
   * Deactivate a tenant module
   * @param {number|string} id - Tenant Module ID
   */
  deactivateTenantModule: async (id) => {
    const response = await tenantApi.put(`/modules/${id}`, { module_status: 'inactive' });
    return response.data;
  },

  /**
   * Get all tenant modules (non-paginated list)
   */
  getAllTenantModules: async () => {
    const response = await tenantApi.get('/modules/all');
    return response.data;
  },

  /**
   * Get sidebar modules from tenant
   */
  getTenantSidebarModules: async () => {
    const response = await tenantApi.get('/sidebar-modules');
    return response.data;
  },

  /**
   * Get tenant packages
   */
  getTenantPackages: async () => {
    const response = await tenantApi.get('/packages');
    return response.data;
  },

  /**
   * Get modules for a specific tenant package
   * @param {number|string} packageId - Tenant Package ID
   */
  getTenantPackageModules: async (packageId) => {
    const response = await tenantApi.get(`/packages/${packageId}/modules`);
    return response.data;
  },

  /**
   * Save tenant package-module relationships
   * @param {number|string} packageId - Tenant Package ID
   * @param {Array} moduleIds - Array of module IDs
   */
  saveTenantPackageModules: async (packageId, moduleIds) => {
    const response = await tenantApi.post('/save-package-modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data;
  },
};

export default moduleApi;
