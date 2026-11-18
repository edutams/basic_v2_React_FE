import tenantApi from '@/api/tenant/tenant_api';

export const fetchSupportWidgetConfig = async () => {
  const response = await tenantApi.get('/support/widget-config');
  return response.data;
};
