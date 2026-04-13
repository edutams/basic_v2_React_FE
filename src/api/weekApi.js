import api from './tenant_api';

// Fetch weeks for a session term
export const fetchWeeks = async (sessionTermId) => {
  const response = await api.get(`/curriculum/weeks/${sessionTermId}`);
  return response.data;
};

// Auto-generate weeks
export const autoGenerateWeeks = async (sessionTermId, data) => {
  const response = await api.post(`/curriculum/weeks/auto-generate/${sessionTermId}`, data);
  return response.data;
};

// Add a single week
export const addWeek = async (sessionTermId) => {
  const response = await api.post(`/curriculum/weeks/add/${sessionTermId}`);
  return response.data;
};

// Delete a week
export const deleteWeek = async (sessionTermId, weekId) => {
  const response = await api.delete(`/curriculum/weeks/delete/${sessionTermId}/${weekId}`);
  return response.data;
};

// Toggle week status
export const toggleWeekStatus = async (id) => {
  const response = await api.patch(`/curriculum/weeks/toggle-status/${id}`);
  return response.data;
};

// Save manually edited weeks
export const saveWeeks = async (sessionTermId, weeks) => {
  const response = await api.post(`/curriculum/weeks/save/${sessionTermId}`, { weeks });
  return response.data;
};
