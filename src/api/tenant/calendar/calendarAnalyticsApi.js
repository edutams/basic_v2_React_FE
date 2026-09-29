import tenantApi from '@/api/tenant/tenant_api';

// The "intelligence" behind the Calendar Setup tab: active sessions/sections,
// weeks set vs. the previous term, holidays set, and subscription status —
// all in a single response.
export const fetchCalendarOverview = async () => {
  const response = await tenantApi.get('/calendar/overview');
  return response.data;
};
