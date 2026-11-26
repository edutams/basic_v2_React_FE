import api from '@/api/tenant/tenant_api';

export const fetchExpenditureEntries = async (params) => {
    const res = await api.get('/expenditure/fetch_entries', { params });
    return res.data;
};

export const fetchExpenditureEntry = async (id) => {
    const res = await api.get(`/expenditure/fetch_entry/${id}`);
    return res.data;
};

export const createExpenditureEntry = async (payload) => {
    const res = await api.post('/expenditure/create_entry', payload);
    return res.data;
};

export const submitExpenditureInstallment = async (entryId, payload) => {
    const res = await api.post(`/expenditure/${entryId}/submit_installment`, payload);
    return res.data;
};

export const approveExpenditureInstallment = async (id) => {
    const res = await api.put(`/expenditure/installment/${id}/approve`);
    return res.data;
};

export const rejectExpenditureInstallment = async (id, rejectionReason = null) => {
    const res = await api.put(`/expenditure/installment/${id}/reject`, { rejection_reason: rejectionReason });
    return res.data;
};

export const bulkApproveExpenditureInstallments = async (installmentIds) => {
    const res = await api.post('/expenditure/installments/bulk_approve', { installment_ids: installmentIds });
    return res.data;
};

export const bulkRejectExpenditureInstallments = async (installmentIds, rejectionReason = null) => {
    const res = await api.post('/expenditure/installments/bulk_reject', { installment_ids: installmentIds, rejection_reason: rejectionReason });
    return res.data;
};
