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

export const fetchTermsBySessionTerm = async (sessionTermId) => {
    const res = await api.get(`/bursary/settings/fetch_terms_by_session_term/${sessionTermId}`);
    return res.data;
};
export const fetchGatewayChargeBearer = async () => {
    const res = await api.get('/bursary/settings/gateway_charge_bearer');
    return res.data;
}
