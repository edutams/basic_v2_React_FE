import api from '@/api/tenant/tenant_api';


export const fetchClassLedgerAnalytics = async (payload) => {
    const res = await api.post('/bursary/class_ledger/fetch_analytics', { payload });
    return res.data;
}
// export const fetchPaymentNameOptions = async () => {
//     const res = await api.get('/bursary/class_ledger/fetch_payment_name_options');
//     return res.data;
// }
export const getClassStudentsPaymentStatus = async (payload) => {
    const res = await api.post('/bursary/class_ledger/fetch_payment_status', { payload });
    return res.data;
}
export const fetchInvoiceByNumber = async ({ sessionId, termId, userId, invoiceNumber, categoryId } = {}) => {
    const params = {
        session_id: sessionId,
        term_id: termId,
        user_id: userId,
        invoice_number: invoiceNumber,
    };
    // if (categoryId) params.category_id = categoryId;
    const res = await api.get('/bursary/payment_schedule/fetch_invoice_by_number', { params });
    return res.data;
};

export const fetchCashPostData = async ({ sessionId, termId, userId, categoryId, invoiceId } = {}) => {
    const params = {
        session_id: sessionId,
        term_id: termId,
        user_id: userId,
    };
    if (invoiceId) params.invoice_id = invoiceId;
    const res = await api.get('/bursary/payment_schedule/fetch_cash_post_data', { params });
    return res.data;
};


export const generateClassLedgerExcel = async (payload) => {
    const res = await api.post('/bursary/class_ledger/generate_excel', { payload }, {
        responseType: 'blob',
    });
    return res.data;
};

export const printClassLedgerPaymentList = async (payload) => {
    const res = await api.post('/bursary/class_ledger/print_payment_list', { payload });
    return res.data;
};

export const fetchDrilldownStudents = async (payload) => {
    const res = await api.post('/bursary/class_ledger/drilldown_students', { payload });
    return res.data;
};

export const postCashData = async (payload) => {
    const res = await api.post('/bursary/payment_schedule/post_cash_data', payload);
    return res.data;
};
