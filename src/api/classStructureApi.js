import api from './tenant_api';

// Fetch all class structures
export const fetchClassStructures = async (params = {}) => {
  const response = await api.get('/class-structures', { params });
  return response.data;
};

// Fetch active class structures only
export const fetchActiveClassStructures = async () => {
  const response = await api.get('/class-structures/active');
  return response.data;
};

// Fetch class structure by ID
export const fetchClassStructureById = async (id) => {
  const response = await api.get(`/class-structures/${id}`);
  return response.data;
};

// Create a new class structure
export const createClassStructure = async (data) => {
  const response = await api.post('/class-structures', data);
  return response.data;
};

// Update a class structure
export const updateClassStructure = async (id, data) => {
  const response = await api.put(`/class-structures/${id}`, data);
  return response.data;
};

// Delete a class structure
export const deleteClassStructure = async (id) => {
  const response = await api.delete(`/class-structures/${id}`);
  return response.data;
};

// Toggle class structure status
export const toggleClassStructureStatus = async (id) => {
  const response = await api.patch(`/class-structures/${id}/toggle-status`);
  return response.data;
};

// Reorder class structures
export const reorderClassStructures = async (orders) => {
  const response = await api.post('/class-structures/reorder', { orders });
  return response.data;
};

// Fetch class structure statistics
export const fetchClassStructureStats = async () => {
  const response = await api.get('/class-structures/stats');
  return response.data;
};
