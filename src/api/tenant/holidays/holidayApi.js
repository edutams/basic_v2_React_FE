import tenantApi from '@/api/tenant/tenant_api';

// Fetch holidays for a session term
export const fetchHolidays = async (sessionTermId) => {
  const response = await tenantApi.get(`/curriculum/holidays/${sessionTermId}`);
  return response.data;
};

// Create holidays (bulk)
export const createHolidays = async (sessionTermId, holidays) => {
  const response = await tenantApi.post(`/curriculum/holidays/${sessionTermId}`, { holidays });
  return response.data;
};

// Delete a holiday
export const deleteHoliday = async (holidayId) => {
  const response = await tenantApi.delete(`/curriculum/holidays/${holidayId}`);
  return response.data;
};

export const fetchHolidayStatistics = async (sessionTermId) => {
  const response = await tenantApi.get(`/curriculum/holidays/${sessionTermId}/statistics`);

  return response.data;
};
