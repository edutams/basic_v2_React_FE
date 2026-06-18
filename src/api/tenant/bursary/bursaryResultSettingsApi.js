import api from '@/api/tenant/tenant_api';

export const fetchResultPaymentSettings = async () => {
    const res = await api.get('/bursary/result_settings/fetch');
    return res.data;
};

export const saveResultPaymentSettings = async (data) => {
    const res = await api.post('/bursary/result_settings/save', data);
    return res.data;
};