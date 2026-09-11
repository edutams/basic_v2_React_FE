import api from '@/api/landlord/landlord_api';

// Summary stat cards (Total Transaction Value/Volume, Total Commission, My
// Commission) — scoped to the given organization's own SkoolPay wallet.
export const getStats = async ({ organizationId, from, to } = {}) => {
  const res = await api.get('/v1/landlord/commission/stats', {
    params: { organization_id: organizationId, from, to },
  });
  return res.data;
};

// Wallet transaction list — a proxy of SkoolPay's own response shape.
export const getTransactions = async ({ organizationId, from, to, search } = {}) => {
  const res = await api.post('/v1/landlord/commission/transactions', {
    organization_id: organizationId,
    from,
    to,
    search,
  });
  return res.data;
};

export const getTransactionDetails = async (id, { organizationId, from, to, search, creditType } = {}) => {
  const res = await api.post(`/v1/landlord/commission/transactions/${id}`, {
    organization_id: organizationId,
    from,
    to,
    search,
    creditType,
  });
  return res.data;
};

// Every organization under the caller (their full subtree), each with its
// own commission%, commission_type, school count, and computed earnings —
// powers the Overview/Manage/by-Subscription/by-Transaction tabs.
export const getOrganizations = async () => {
  const res = await api.get('/v1/landlord/commission/organizations');
  return res.data;
};

export const updateCommission = async (organizationId, commission) => {
  const res = await api.post(`/v1/landlord/commission/organizations/${organizationId}/commission`, {
    commission,
  });
  return res.data;
};

export const updateCommissionType = async (organizationId, commissionType) => {
  const res = await api.post(`/v1/landlord/commission/organizations/${organizationId}/commission-type`, {
    commission_type: commissionType,
  });
  return res.data;
};

// Every school across the given organization's own subtree (itself
// included) — the same scope the "Total School" stat card counts.
export const getCommissionSchools = async ({ organizationId } = {}) => {
  const res = await api.get('/v1/landlord/commission/schools', {
    params: { organization_id: organizationId },
  });
  return res.data;
};
