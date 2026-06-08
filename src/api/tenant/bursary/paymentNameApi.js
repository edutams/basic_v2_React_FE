import api from '@/api/tenant/tenant_api';

export const fetchPaymentNames = async (page = 1, search = '', per_page = 10) => {
    const res = await api.get('/bursary/payment_name/fetch_payment_names', { params: { page, search, per_page } });
    return res.data;
};

export const createPaymentName = async (data) => {
    const res = await api.post('/bursary/payment_name/create_payment_name', data);
    return res.data;
};

export const updatePaymentName = async (id, data) => {
    const res = await api.put(`/bursary/payment_name/update_payment_name/${id}`, data);
    return res.data;
};

export const togglePaymentNameStatus = async (id) => {
    const res = await api.put(`/bursary/payment_name/toggle_payment_name_status/${id}`);
    return res.data;
};

export const fetchSkoolPayBanks = async () => {
    const res = await api.get('/bursary/payment_name/fetch_skoolpay_banks');
    return res.data;
};

export const validateBankAccount = async (data) => {
    const res = await api.post('/bursary/payment_name/validate_account', data);
    return res.data;
};

export const fetchPaymentNameStats = async () => {
    const res = await api.get('/bursary/payment_name/stats');
    return res.data;
};