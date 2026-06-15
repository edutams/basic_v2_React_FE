import api from '@/api/tenant/tenant_api';


export const fetchClassLedgerAnalytics = async (payload) => {
    const res = await api.post('/bursary/class_ledger/fetch_analytics', { payload });
    return res.data;
}
export const fetchPaymentNameOptions = async () => {
    const res = await api.get('/bursary/class_ledger/fetch_payment_name_options');
    return res.data;
}
export const getClassStudentsPaymentStatus = async (payload) => {
    const res = await api.post('/bursary/class_ledger/fetch_payment_status', { payload });
    return res.data;
}