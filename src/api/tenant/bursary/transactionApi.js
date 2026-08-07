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

export const fetchRevenueAmountDetails = async (payload) => {
    const res = await api.post('/bursary/transactions/revenue/fetch_revenue_amount_details', payload);
    return res.data;
};

export const fetchSettlements = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement/fetch_settlements', payload);
    return res.data;
}

export const fetchSettlementAnalytics = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement/fetch_settlement_analytics', payload);
    return res.data;
}

export const settlementRevenueTransactions = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement/fetch_settlement_revenue_transactions', payload);
    return res.data;
}

export const settlementTransactions = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement/fetch_settlement_transactions', payload);
    return res.data;
}

export const fetchBursarySettlementValues = async (filters = {}) => {
    const res = await api.get('/bursary/transactions/settlement/get_settlement_values', {
        params: {
            from: filters.from || null,
            to: filters.to || null,
        }
    });
    return res.data;
}

export const fetchSettlementReconciliationData = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement_reconciliation/fetch_settlement_reconciliation_data', payload);
    return res.data;
}

export const fetchSettlementReconciliationAnalytics = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement_reconciliation/fetch_settlement_reconciliation_analytics', payload);
    return res.data;
}

export const fetchSettlementReconciliationDetails = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement_reconciliation/fetch_settlement_reconciliation_details', payload);
    return res.data;
}

export const fetchSettlementReconciliationRevenues = async (payload) => {
    const res = await api.post('/bursary/transactions/settlement_reconciliation/fetch_settlement_reconciliation_revenues', { payload });
    return res.data;
};

export const exportSettlementReconciliationCsv = (data, config = {}) =>
    api.post('/bursary/transactions/settlement_reconciliation/export_csv_settlement_reconciliation', data, { responseType: 'blob', ...config },);

export const fetchWalletTransactions = async (wallet_account_no) => {
    const res = await api.get('/bursary/transactions/wallet_transactions', {
        params: { wallet_account_no: wallet_account_no },
    });
    return res.data;
}