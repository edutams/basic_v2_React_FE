import tenantApi from '@/api/tenant/tenant_api';

// Fetch all classes with their arms
export const fetchClassStructures = async () => {
  const response = await tenantApi.get('/class-structure');
  return response.data;
};

// Toggle class active/inactive status
export const toggleClassStructureStatus = async (pivot_id) => {
  const response = await tenantApi.patch(`/class-structure/${pivot_id}/toggle-status`);
  return response.data;
};
