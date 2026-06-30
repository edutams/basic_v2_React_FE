import api from '@/api/tenant/tenant_api';

export const fetchTransactionValues = async () => {
    const res = await api.get('/bursary/transactions/get_online_transaction_values');
    return res.data;
}

export const fetchOnlineTransactions = async (payload) => {
    const res = await api.post('/bursary/transactions/fetch_online_transactions', payload);
    return res.data;
};

export const fetchOnlineTransactionAnalytics = async (payload) => {
    const res = await api.post('/bursary/transactions/fetch_online_transaction_analytics', payload);
    return res.data;
};