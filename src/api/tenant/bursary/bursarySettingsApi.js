import api from '@/api/tenant/tenant_api';

export const fetchBursarySettings = async () => {
    const res = await api.get('/bursary/settings/fetch_bursary_settings');
    return res.data;
};

export const changeBursarySetting = async (code, value) => {
    const res = await api.put('/bursary/settings/change_bursary_setting', { code, value });
    return res.data;
};

export const fetchActiveSessionTerm = async () => {
    const res = await api.get('/bursary/settings/bursary_active_session_term');
    return res.data;
};

export const setActiveSessionTerm = async (termId) => {
    const res = await api.post('/bursary/settings/set_bursary_active_session_term', { value: termId });
    return res.data;
};

export const fetchBursarySessionTerms = async () => {
    const res = await api.get('/bursary/settings/fetch_bursary_session_terms');
    return res.data;
};

export const fetchActiveCategories = async () => {
    const res = await api.get('/bursary/settings/fetch_active_categories');
    return res.data;
};

export const fetchTermsBySessionTerm = async (sessionId, termId) => {
    const res = await api.get(`/bursary/settings/fetch_terms_by_session/${sessionId}`);
    return res.data;
};

export const fetchClasses = async () => {
    const res = await api.get(`/bursary/settings/fetch_classes`);
    return res.data;
};

export const fetchInstallments = async () => {
    const res = await api.get(`/bursary/settings/fetch_installments`);
    return res.data;
};

export const getBursaryInstalmentSetting = async () => {
    const res = await api.get(`/bursary/settings/get_bursary_instalment_setting`);
    return res.data;
};

export const fetchGatewayChargeBearer = async () => {
    const res = await api.get('/bursary/settings/gateway_charge_bearer');
    return res.data;
}

export const fetchPaymentSchedules = async (sessionId, termId, categoryId, payOption = 'compulsory', search = '') => {
    const params = {
        session_id: sessionId,
        term_id: termId,
        category_id: categoryId,
        pay_option: payOption
    };

    if (search) {
        params.search = search;
    }

    const res = await api.get('/bursary/payment_schedule/fetch_payment_schedules', { params });
    return res.data;
};

export const batchUpsertPaymentSchedule = async (data) => {
    const res = await api.post('/bursary/payment_schedule/batch_upsert_payment_schedule', data);
    return res.data;
};

export const importPaymentSchedule = async (data) => {
    const res = await api.post('/bursary/payment_schedule/import_payment_schedule', data);
    return res.data;
};

export const createPaymentSchedule = async (data) => {
    const res = await api.post('/bursary/payment_schedule/create_payment_schedule', data);
    return res.data;
};

export const updatePaymentSchedule = async (id, data) => {
    const res = await api.put(`/bursary/payment_schedule/update_payment_schedule/${id}`, data);
    return res.data;
};


export const deletePaymentSchedule = async (id) => {
    const res = await api.delete(`/bursary/payment_schedule/delete_payment_schedule/${id}`);
    return res.data;
};

export const deletePaymentSchedulesByPaymentName = async (paymentNameId) => {
    const res = await api.delete(`/bursary/payment_schedule/delete_payment_schedules_by_name/${paymentNameId}`);
    return res.data;
};


export const fetchGenerateInvoiceData = async ({ sessionTermId, classId, categoryId } = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (categoryId) params.category_id = categoryId;
    const res = await api.get('/bursary/payment_schedule/generate_invoice_data', { params });
    return res.data;
};

export const togglePaymentScheduleStatus = async (id, status) => {
    const res = await api.put(`/bursary/payment_schedule/toggle_payment_schedule_status/${id}`, { status });
    return res.data;
};

export const fetchPaymentScheduleStats = async (sessionId, termId, payOption = 'compulsory') => {
    const res = await api.get('/bursary/payment_schedule/stats', {
        params: { session_id: sessionId, term_id: termId, pay_option: payOption }
    });
    return res.data;
};

export const fetchGenerateInvoiceStats = async (sessionTermId, classId) => {
    const params = { session_term_id: sessionTermId };
    if (classId) {
        params.class_id = classId;
    }
    const res = await api.get('/bursary/payment_schedule/generate_invoice_stats', { params });
    return res.data;
};
    
export const fetchStudentForInvoiceData = async ({ sessionTermId, classId, categoryId } = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (categoryId) params.category_id = categoryId;
    const res = await api.get('/bursary/payment_schedule/fetch_student_for_invoice_data', { params });
    return res.data;
};

export const fetchStudentOptionalPayments = async ({ sessionTermId, classId, categoryId } = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (categoryId) params.category_id = categoryId;
    const res = await api.get('/bursary/payment_schedule/fetch_student_optional_payments', { params });
    return res.data;
};

export const generateStudentInvoice = async (payload) => {
    const res = await api.post('/bursary/payment_schedule/generate_student_invoice', payload);
    return res.data;
};

export const fetchStudentInvoiceBreakdown = async ({ sessionTermId, classId, categoryId } = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (categoryId) params.category_id = categoryId;
    const res = await api.get('/bursary/payment_schedule/fetch_student_invoice_breakdown', { params });
    return res.data;
};

export const fetchStudentPrintInvoice = async ({ sessionTermId, classId, categoryId, userId } = {}) => {
    const params = {};
    if (sessionTermId) params.session_term_id = sessionTermId;
    if (classId) params.class_id = classId;
    if (categoryId) params.category_id = categoryId;
    if (userId) params.user_id = userId;
    const res = await api.get('/bursary/payment_schedule/fetch_student_print_invoice', { params });
    return res.data;
};
