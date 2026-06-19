import api from '@/api/tenant/tenant_api';

export const fetchSendInvoiceFilterOptions = async () => {
    const res = await api.get('/bursary/send_invoice/fetch_filter_options');
    return res.data;
};

export const fetchClassesByProgramme = async (programmeId) => {
    const res = await api.get('/bursary/send_invoice/fetch_classes_by_programme', {
        params: { programme_id: programmeId },
    });
    return res.data;
};


export const fetchParentsForInvoice = async ({
    sessionTermId,
    classId,
    programmeId,
    search = '',
} = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (programmeId) params.programme_id = programmeId;
    if (search) params.search = search;

    const res = await api.get('/bursary/send_invoice/fetch_parents', { params });
    return res.data;
};


export const fetchSendInvoiceStats = async ({
    sessionTermId,
    classId,
    programmeId,
} = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (programmeId) params.programme_id = programmeId;

    const res = await api.get('/bursary/send_invoice/stats', { params });
    return res.data;
};


export const updateParentPhoneNumberOrEmail = async (userId, field, value) => {
    const res = await api.put('/bursary/send_invoice/update_parent_contact', {
        user_id: userId,
        field,
        value,
    });
    return res.data;
};


export const generateInvoiceExcel = async (params) => {
    const res = await api.get('/bursary/send_invoice/generate_excel', {
        params,
        responseType: 'blob',
    });
    return res.data;
};


export const sendInvoiceSms = async ({ parentIds, sessionTermId, customMessage } = {}) => {
    const res = await api.post('/bursary/send_invoice/send_sms', {
        parent_ids: parentIds,
        session_term_id: sessionTermId,
        custom_message: customMessage,
    });
    return res.data;
};


export const sendInvoiceEmail = async ({ parentIds, sessionTermId, customMessage } = {}) => {
    const res = await api.post('/bursary/send_invoice/send_email', {
        parent_ids: parentIds,
        session_term_id: sessionTermId,
        custom_message: customMessage,
    });
    return res.data;
};
