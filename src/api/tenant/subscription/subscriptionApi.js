import tenantApi from '@/api/tenant/tenant_api';

// Current subscription status + resolved grace/lock tier for the active session-term
export const fetchSubscriptionStatus = async () => {
  const response = await tenantApi.get('/subscription-status');
  return response.data;
};

// Everything the "Subscribe" form needs: eligible sessions/terms + agent plans
export const fetchSubscriptionFormOptions = async () => {
  const response = await tenantApi.get('/get-form-options');
  return response.data;
};

export const fetchMyPlans = async () => {
  const response = await tenantApi.get('/my-plans');
  return response.data;
};

export const subscribe = async ({ agent_plan_id, session_id, term_id, subscription_mode }) => {
  const response = await tenantApi.post('/subscribe', {
    agent_plan_id,
    session_id,
    term_id,
    subscription_mode,
  });
  return response.data;
};
