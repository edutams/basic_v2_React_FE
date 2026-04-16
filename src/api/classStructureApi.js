import api from './tenant_api';

// Fetch all classes with their arms
export const fetchClassStructures = async () => {
  const response = await api.get('/class-structure');
  return response.data;
};

// Toggle class active/inactive status
export const toggleClassStructureStatus = async (id) => {
  const response = await api.patch(`/class-structure/${id}/toggle-status`);
  return response.data;
};
