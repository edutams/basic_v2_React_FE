import api from './auth';

const eduTierApi = {
  // Plans
  getPlans: async () => {
    const response = await api.get('/agent/edu-tier/plans');
    return response.data;
  },
  savePlan: async (data) => {
    if (data.id) {
      const response = await api.put(`/agent/edu-tier/plans/${data.id}`, data);
      return response.data;
    }
    const response = await api.post('/agent/edu-tier/plans', data);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await api.delete(`/agent/edu-tier/plans/${id}`);
    return response.data;
  },

  // Packages
  getPackages: async () => {
    const response = await api.get('/agent/edu-tier/packages');
    return response.data;
  },
  savePackage: async (data) => {
    if (data.id) {
      const response = await api.put(`/agent/edu-tier/packages/${data.id}`, data);
      return response.data;
    }
    const response = await api.post('/agent/edu-tier/packages', data);
    return response.data;
  },
  deletePackage: async (id) => {
    const response = await api.delete(`/agent/edu-tier/packages/${id}`);
    return response.data;
  },

  // Modules
  getModules: async () => {
    const response = await api.get('/agent/edu-tier/modules');
    return response.data;
  },
  saveModule: async (data) => {
    if (data.id) {
      const response = await api.put(`/agent/edu-tier/modules/${data.id}`, data);
      return response.data;
    }
    const response = await api.post('/agent/edu-tier/modules', data);
    return response.data;
  },
  deleteModule: async (id) => {
    const response = await api.delete(`/agent/edu-tier/modules/${id}`);
    return response.data;
  },

  // Relationships
  savePlanModules: async (planId, moduleIds) => {
    const response = await api.post('/agent/edu-tier/save-plan-modules', {
      plan_id: planId,
      module_ids: moduleIds,
    });
    return response.data;
  },
  savePackageModules: async (packageId, moduleIds) => {
    const response = await api.post('/agent/edu-tier/save-package-modules', {
      package_id: packageId,
      module_ids: moduleIds,
    });
    return response.data;
  },
};

export default eduTierApi;
