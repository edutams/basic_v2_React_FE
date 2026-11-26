import api from '@/api/tenant/tenant_api';

export const fetchIncomeEntries = async (params) => {
    const res = await api.get('/income/fetch_entries', { params });
    return res.data;
};

export const fetchIncomeEntry = async (id) => {
    const res = await api.get(`/income/fetch_entry/${id}`);
    return res.data;
};

export const createIncomeEntry = async (payload) => {
    const res = await api.post('/income/create_entry', payload);
    return res.data;
};

export const submitIncomeInstallment = async (entryId, payload) => {
    const res = await api.post(`/income/${entryId}/submit_installment`, payload);
    return res.data;
};

export const approveIncomeInstallment = async (id) => {
    const res = await api.put(`/income/installment/${id}/approve`);
    return res.data;
};

export const rejectIncomeInstallment = async (id, rejectionReason = null) => {
    const res = await api.put(`/income/installment/${id}/reject`, { rejection_reason: rejectionReason });
    return res.data;
};

export const bulkApproveIncomeInstallments = async (installmentIds) => {
    const res = await api.post('/income/installments/bulk_approve', { installment_ids: installmentIds });
    return res.data;
};

export const bulkRejectIncomeInstallments = async (installmentIds, rejectionReason = null) => {
    const res = await api.post('/income/installments/bulk_reject', { installment_ids: installmentIds, rejection_reason: rejectionReason });
    return res.data;
};
