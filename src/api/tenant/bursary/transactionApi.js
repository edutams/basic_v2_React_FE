import api from '@/api/tenant/tenant_api';

export const fetchTransactionValues = async () => {
    const res = await api.get('/bursary/transactions/get_online_transaction_values');
    return res.data;
}