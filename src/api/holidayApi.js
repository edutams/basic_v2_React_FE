import api from './tenant_api';

// Fetch holidays for a session term
export const fetchHolidays = async (sessionTermId) => {
  const response = await api.get(`/curriculum/holidays/${sessionTermId}`);
  return response.data;
};

// Create holidays (bulk)
export const createHolidays = async (sessionTermId, holidays) => {
  const response = await api.post(`/curriculum/holidays/${sessionTermId}`, { holidays });
  return response.data;
};

// Delete a holiday
export const deleteHoliday = async (holidayId) => {
  const response = await api.delete(`/curriculum/holidays/${holidayId}`);
  return response.data;
};
