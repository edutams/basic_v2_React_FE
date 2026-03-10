import api from './auth';
import tenantApi from './tenant_api';

const moduleApi = {
  /**
   * Get all modules from landlord/agent (modules table)
   */
  getModules: async (params) => {
    const response = await api.get('/agent/edu-tier/modules', { params });
    return response.data.data;
  },

  /**
   * Get a single module by ID from landlord/agent
   * @param {number|string} id - Module ID
   */
  getModule: async (id) => {
    const response = await api.get(`/agent/edu-tier/modules/${id}`);
    return response.data.data;
  },

  /**
   * Create a new module in landlord/agent
   * @param {Object} data - Module data
   */
  createModule: async (data) => {
    const response = await api.post('/agent/edu-tier/modules', data);
    return response.data.data;
  },

  /**
   * Update an existing module in landlord/agent
   * @param {number|string} id - Module ID
   * @param {Object} data - Module data to update
   */
  updateModule: async (id, data) => {
    const response = await api.put(`/agent/edu-tier/modules/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a module from landlord/agent
   * @param {number|string} id - Module ID
   */
  deleteModule: async (id) => {
    const response = await api.delete(`/agent/edu-tier/modules/${id}`);
    return response.data.data;
  },

  /**
   * Activate a module (landlord/agent)
   * @param {number|string} id - Module ID
   */
  activateModule: async (id) => {
    const response = await api.put(`/agent/edu-tier/modules/${id}`, { module_status: 'active' });
    return response.data.data;
  },

  /**
   * Deactivate a module (landlord/agent)
   * @param {number|string} id - Module ID
   */
  deactivateModule: async (id) => {
    const response = await api.put(`/agent/edu-tier/modules/${id}`, { module_status: 'inactive' });
    return response.data.data;
  },

  /**
   * Get all modules (non-paginated list) from landlord/agent
   */
  getAllModules: async () => {
    const response = await api.get('/agent/edu-tier/modules/all');
    return response.data.data;
  },

  /**
   * Get modules for a specific package from landlord/agent
   * @param {number|string} packageId - Package ID
   */
  getPackageModules: async (packageId) => {
    const response = await api.get(`/agent/edu-tier/packages/${packageId}/modules`);
    return response.data.data;
  },

  /**
   * Save plan-module relationships (landlord/agent)
   * @param {number|string} planId - Plan ID
   * @param {Array} moduleIds - Array of module IDs
   */
  savePlanModules: async (planId, moduleIds) => {
    const response = await api.post('/agent/edu-tier/save-plan-modules', {
      plan_id: planId,
      module_ids: moduleIds,
    });
    return response.data.data;
  },

  /**
   * Save package-module relationships (landlord/agent)
   * @param {number|string} packageId - Package ID
   * @param {Array} moduleIds - Array of module IDs
   */
  savePackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/agent/edu-tier/save-package-modules', {
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
   * Uses /api/v1/agent/edu-tier/modules endpoint
   * @param {Object} params - Query parameters (page, limit, search, status)
   */
  getTenantModules: async (params) => {
    const response = await api.get('/agent/edu-tier/modules', { params });
    return response.data.data;
  },

  /**
   * Get a single tenant module by ID
   * @param {number|string} id - Tenant Module ID
   */
  getTenantModule: async (id) => {
    const response = await api.get(`/agent/edu-tier/modules/${id}`);
    return response.data.data;
  },

  /**
   * Create a new module in tenant database
   * @param {Object} data - Tenant module data
   */
  createTenantModule: async (data) => {
    const response = await api.post('/agent/edu-tier/modules', data);
    return response.data.data;
  },

  /**
   * Update an existing module in tenant database
   * @param {number|string} id - Tenant Module ID
   * @param {Object} data - Module data to update
   */
  updateTenantModule: async (id, data) => {
    const response = await api.put(`/agent/edu-tier/modules/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete a module from tenant database
   * @param {number|string} id - Tenant Module ID
   */
  deleteTenantModule: async (id) => {
    const response = await api.delete(`/agent/edu-tier/modules/${id}`);
    return response.data.data;
  },

  /**
   * Activate a tenant module
   * @param {number|string} id - Tenant Module ID
   */
  activateTenantModule: async (id) => {
    const response = await api.put(`/agent/edu-tier/modules/${id}`, { module_status: 'active' });
    return response.data.data;
  },

  /**
   * Deactivate a tenant module
   * @param {number|string} id - Tenant Module ID
   */
  deactivateTenantModule: async (id) => {
    const response = await api.put(`/agent/edu-tier/modules/${id}`, { module_status: 'inactive' });
    return response.data.data;
  },

  /**
   * Get all tenant modules (non-paginated list)
   */
  getAllTenantModules: async () => {
    const response = await api.get('/agent/edu-tier/modules/all');
    return response.data.data;
  },

  /**
   * Get sidebar modules from tenant
   */
  getTenantSidebarModules: async () => {
    const response = await api.get('/agent/edu-tier/sidebar-modules');
    return response.data.data;
  },

  /**
   * Get tenant packages
   */
  getTenantPackages: async () => {
    const response = await api.get('/agent/edu-tier/packages');
    return response.data.data;
  },

  /**
   * Get modules for a specific tenant package
   * @param {number|string} packageId - Tenant Package ID
   */
  getTenantPackageModules: async (packageId) => {
    const response = await api.get(`/agent/edu-tier/packages/${packageId}/modules`);
    return response.data.data;
  },

  /**
   * Save tenant package-module relationships
   * @param {number|string} packageId - Tenant Package ID
   * @param {Array} moduleIds - Array of module IDs
   */
  saveTenantPackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/agent/edu-tier/save-package-modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data.data;
  },
};

export default moduleApi;
