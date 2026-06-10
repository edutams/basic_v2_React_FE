import api from '@/api/tenant/tenant_api';


export const fetchClassLedgerAnalytics = async () => {
    const res = await api.get('/bursary/class_ledger/fetch_analytics');
    return res.data;
}
export const getPaymentType = async () => {
    const res = await api.get('/bursary/class_ledger/fetch_payment_type');
    return res.data;
}
export const getClassStudentsPaymentStatus = async () => {
    const res = await api.get('/bursary/class_ledger/fetch_payment_status');
    return res.data;
}