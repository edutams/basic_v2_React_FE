import api from '@/api/tenant/tenant_api';

export const createPendingPayment = async (data) => {
    const res = await api.post('/bursary/payment_schedule/create_pending_payment', data);
    return res.data;
}

export const confirmCardPayment = async (transref, user_id) => {
    const res = await api.get('/bursary/payment_schedule/confirm_card_payment', {
        params: { transref, user_id }
    });
    return res.data;
};