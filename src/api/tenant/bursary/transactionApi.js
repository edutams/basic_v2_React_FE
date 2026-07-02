import api from '@/api/tenant/tenant_api';

export const fetchTransactionValues = async () => {
    const res = await api.get('/bursary/transactions/overview/get_online_transaction_values');
    return res.data;
}

export const fetchOnlineTransactions = async (payload) => {
    const res = await api.post('/bursary/transactions/overview/fetch_online_transactions', payload);
    return res.data;
};

export const fetchOnlineTransactionAnalytics = async (payload) => {
    const res = await api.post('/bursary/transactions/overview/fetch_online_transaction_analytics', payload);
    return res.data;
};

export const fetchRevenueTransactionValues = async () => {
    const res = await api.get('/bursary/transactions/revenue/get_revenue_transaction_values');
    return res.data;
}

export const fetchRevenueChartData = async (payload) => {
    const res = await api.post('/bursary/transactions/revenue/fetch_revenue_chart_data', payload);
    return res.data;
};

export const revenueTransactionAmount = async (payload) => {
    const res = await api.post('/bursary/transactions/revenue/fetch_revenue_transaction_amount', payload);
    return res.data;
};

export const fetchPrintReceipt = async ({ order_id, user_id, session_term_id }) => {
    const res = await api.get('/bursary/transactions/print_receipt', {
        params: { order_id, user_id, session_term_id },
    });
    return res.data;
};

export const checkTransactionStatus = async (id) => {
    const res = await api.get('/bursary/transactions/update_status', {
        params: { id },
    });
    return res.data;
};