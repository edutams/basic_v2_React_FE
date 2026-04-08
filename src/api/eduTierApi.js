import api from './auth';

const eduTierApi = {
  // Plans
  getPlans: async () => {
    const response = await api.get('/landlord/v1/edu_tier/plans/get_plans');
    return response.data;
  },
  savePlan: async (data) => {
    if (data.id) {
      const response = await api.put(`/landlord/v1/edu_tier/plans/update_plans/${data.id}`, data);
      return response.data;
    }
    const response = await api.post('/landlord/v1/edu_tier/plans/store_plans', data);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await api.delete(`/landlord/v1/edu_tier/plans/delete_plan/${id}`);
    return response.data;
  },

  // Packages
  getPackages: async () => {
    const response = await api.get('/landlord/v1/edu_tier/packages/get_packages');
    return response.data;
  },
  savePackage: async (data) => {
    if (data.id) {
      const response = await api.put(`/landlord/v1/edu_tier/packages/update_package/${data.id}`, data);
      return response.data;
    }
    const response = await api.post('/landlord/v1/edu_tier/packages/store_package', data);
    return response.data;
  },
  deletePackage: async (id) => {
    const response = await api.delete(`/landlord/v1/edu_tier/packages/delete_package/${id}`);
    return response.data;
  },

  // Modules
  getModules: async () => {
    const response = await api.get('/landlord/v1/edu_tier/modules/get_modules');
    return response.data;
  },
  getPackageModules: async (packageId) => {
    const response = await api.get(`/landlord/v1/edu_tier/packages/${packageId}/get_package_modules`);
    return response.data;
  },
  saveModule: async (data) => {
    if (data.id) {
      const response = await api.put(`/landlord/v1/edu_tier/modules/update_modules/${data.id}`, data);
      return response.data;
    }
    const response = await api.post('/landlord/v1/edu_tier/modules/store_modules', data);
    return response.data;
  },
  deleteModule: async (id) => {
    const response = await api.delete(`/landlord/v1/edu_tier/modules/delete_modules/${id}`);
    return response.data;
  },

  // Relationships
  savePlanModules: async (planId, moduleIds) => {
    const response = await api.post('/landlord/v1/edu_tier/plan_modules/save_plan_modules', {
      plan_id: planId,
      module_ids: moduleIds,
    });
    return response.data?.data;
  },
  savePackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/landlord/v1/edu_tier/plan_modules/save_package_modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data?.data;
  },
  getAgentModules: async (agentId) => {
    const response = await api.get(`/landlord/v1/edu_tier/plan_modules/get_agent_modules/${agentId}`);
    return response.data?.data;
  },
  saveAgentModules: async (agentId, moduleIds) => {
    const response = await api.post('/landlord/v1/edu_tier/plan_modules/save_agent_modules', {
      agent_id: agentId,
      module_ids: moduleIds,
    });
    return response.data?.data;
  },
  deactivateModuleForTenants: async (moduleId, status) => {
    const response = await api.post('/landlord/v1/edu_tier/plan_modules/deactivate_module_tenants', {
      module_id: moduleId,
      status: status,
    });
    return response.data;
  },
};

export default eduTierApi;
