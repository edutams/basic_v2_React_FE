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
export const fetchInvoiceByNumber = async ({ sessionId, termId, userId, invoiceNumber }) => {
    const params = {
        session_id: sessionId,
        term_id: termId,
        user_id: userId,
        invoice_number: invoiceNumber,
    };
    const res = await api.get('/bursary/payment_schedule/fetch_invoice_by_number', { params });
    return res.data;
};

