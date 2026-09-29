import api from '@/api/landlord/landlord_api';

// Summary stat cards (Total Transaction Value/Volume, Total Commission, My
// Commission) — scoped to the given organization's own SkoolPay wallet.
// Pass type: 'subscription' to have Total Transaction Value/Volume and
// Inflow/Outflow report on that organization's own subscription ledger
// instead of the (type-mixed) wallet — see "My Commission by Subscription".
export const getStats = async ({ organizationId, from, to, type } = {}) => {
  const res = await api.get('/v1/landlord/commission/stats', {
    params: { organization_id: organizationId, from, to, type },
  });
  return res.data;
};

// Wallet transaction list — a proxy of SkoolPay's own response shape, unless
// type: 'subscription' is passed, which switches to this organization's own
// subscription_transactions rows instead (real, type-pure — the wallet list
// mixes subscription and transaction credits with no way to tell them apart).
export const getTransactions = async ({ organizationId, from, to, search, type } = {}) => {
  const res = await api.post('/v1/landlord/commission/transactions', {
    organization_id: organizationId,
    from,
    to,
    search,
    type,
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

// Set an agent's commission percentage — triggered from the "Update
// Commission" action on the Agents tab (/organization, level 1) and the
// Sub Agents tab (/dashboard, level 2-5), NOT from Commission Management
// (which is read-only reporting).
export const updateCommission = async (organizationId, commission) => {
  const res = await api.post(`/v1/landlord/commission/organizations/${organizationId}/commission`, {
    commission,
  });
  return res.data;
};

// Every school across the given organization's own subtree (itself
// included) — the same scope the "Total School" stat card counts. Each row
// also carries subscription/transaction value+volume and subscription
// commission for that specific school.
export const getCommissionSchools = async ({ organizationId } = {}) => {
  const res = await api.get('/v1/landlord/commission/schools', {
    params: { organization_id: organizationId },
  });
  return res.data;
};

// One school's own transactions — subscription transactions (full rows,
// from our own DB) and its SkoolPay settlement batches. Powers "View
// Transactions" on a row in the Schools list.
export const getSchoolTransactions = async (tenantId) => {
  const res = await api.get(`/v1/landlord/commission/schools/${tenantId}/transactions`);
  return res.data;
};
