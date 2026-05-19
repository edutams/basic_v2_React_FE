import api from './tenant_api';

// Fetch weeks for a session term
export const fetchWeeks = async (sessionTermId) => {
  const response = await api.get(`/weeks/${sessionTermId}`);
  return response.data;
};

// Auto-generate weeks
export const autoGenerateWeeks = async (sessionTermId, data) => {
  const response = await api.post(`/weeks/auto-generate/${sessionTermId}`, data);
  return response.data;
};

// Add a single week
export const addWeek = async (sessionTermId) => {
  const response = await api.post(`/weeks/add/${sessionTermId}`);
  return response.data;
};

// Delete a week
export const deleteWeek = async (sessionTermId, weekId) => {
  const response = await api.delete(`/weeks/delete/${sessionTermId}/${weekId}`);
  return response.data;
};

// Toggle week status
export const toggleWeekStatus = async (id) => {
  const response = await api.patch(`/weeks/toggle-status/${id}`);
  return response.data;
};

// Save manually edited weeks
export const saveWeeks = async (sessionTermId, weeks) => {
  const response = await api.post(`/weeks/save/${sessionTermId}`, { weeks });
  return response.data;
};

/**
 * Derive the calendar date range for a session term from its generated weeks.
 * Returns { start_date, end_date } as 'YYYY-MM-DD' strings, or null if no weeks exist.
 */
export const fetchTermDateRange = async (sessionTermId) => {
  const response = await api.get(`/weeks/${sessionTermId}`);
  const weeks = response.data?.data ?? [];
  if (!weeks.length) return null;

  const start = weeks
    .map((w) => w.start_date)
    .filter(Boolean)
    .sort()[0];

  const end = weeks
    .map((w) => w.end_date)
    .filter(Boolean)
    .sort()
    .at(-1);

  return start && end ? { start_date: start, end_date: end } : null;
};
