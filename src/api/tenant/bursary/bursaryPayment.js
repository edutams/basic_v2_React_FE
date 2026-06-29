import api from '@/api/tenant/tenant_api';

export const createPendingPayment = async (data) => {
    const res = await api.post('/bursary/payment/create_pending_payment', data);
    return res.data;
}

export const confirmCardPayment = async (transref, user_id) => {
    const res = await api.get('/bursary/payment/confirm_card_payment', {
        params: { transref, user_id }
    });
    return res.data;
};

export const postCashData = async (payload) => {
    const res = await api.post('/bursary/payment/post_cash_data', payload);
    return res.data;
};