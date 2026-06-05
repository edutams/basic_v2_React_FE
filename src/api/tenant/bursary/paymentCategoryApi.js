import api from '@/api/tenant/tenant_api';

export const fetchPaymentCategories = async () => {
    const res = await api.get('/bursary/payment_category/fetch_payment_categories');
    return res.data;
}

export const createPaymentCategory = async (data) => {
    const res = await api.post('/bursary/payment_category/create_payment_category', data);
    return res.data;
}

export const updatePaymentCategory = async (id, data) => {
    const res = await api.put(`/bursary/payment_category/update_payment_category/${id}`, data);
    return res.data;
}

export const deletePaymentCategory = async (id) => {
    const res = await api.delete(`/bursary/payment_category/delete_payment_category/${id}`);
    return res.data;
}

export const fetchPaymentCategory = async (id) => {
    const res = await api.get(`/bursary/payment_category/fetch_payment_category/${id}`);
    return res.data;
}

export const togglePaymentCategoryStatus = async (id) => {
    const res = await api.put(`/bursary/payment_category/toggle_payment_category_status/${id}`);
    return res.data;
}
