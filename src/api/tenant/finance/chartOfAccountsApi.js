import api from '@/api/tenant/tenant_api';

export const fetchChartOfAccountsTree = async () => {
    const res = await api.get('/chart_of_accounts/fetch_tree');
    return res.data;
};

export const fetchDetailAccountOptions = async (category) => {
    const res = await api.get('/chart_of_accounts/fetch_detail_options', { params: { category } });
    return res.data;
};

export const createAccount = async (payload) => {
    const res = await api.post('/chart_of_accounts/create_account', payload);
    return res.data;
};

export const updateAccount = async (id, payload) => {
    const res = await api.put(`/chart_of_accounts/update_account/${id}`, payload);
    return res.data;
};

export const toggleAccountStatus = async (id) => {
    const res = await api.put(`/chart_of_accounts/toggle_account_status/${id}`);
    return res.data;
};
