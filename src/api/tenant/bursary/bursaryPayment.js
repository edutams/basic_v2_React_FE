import api from '@/api/tenant/tenant_api';


export const createPendingPayment = async (data) => {
    const res = await api.post('/bursary/payment_schedule/create_pending_payment', data);
    return res.data;
}