import api from '@/api/tenant/tenant_api';

export const fetchInstallments = async () => {
    const res = await api.get('/bursary/payment_installment/fetch_payment_installments');
    return res.data;
}

export const createInstallment = async (data) => {
    const res = await api.post('/bursary/payment_installment/create_payment_installment', data);
    return res.data;
}

export const updateInstallment = async (id, data) => {
    const res = await api.put(`/bursary/payment_installment/update_payment_installment/${id}`, data);
    return res.data;
}

export const deleteInstallment = async (id) => {
    const res = await api.delete(`/bursary/payment_installment/delete_payment_installment/${id}`);
    return res.data;
}

export const fetchInstallment = async (id) => {
    const res = await api.get(`/bursary/payment_installment/fetch_payment_installment/${id}`);
    return res.data;
}

export const toggleInstallmentStatus = async (id) => {
    const res = await api.put(`/bursary/payment_installment/toggle_payment_installment_status/${id}`);
    return res.data;
}