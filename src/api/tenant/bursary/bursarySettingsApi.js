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
    const res = await api.get('/bursary/settings/active_session_term');
    return res.data;
};

export const setActiveSessionTerm = async (termId) => {
    const res = await api.post('/bursary/settings/set_active_session_term', { value: termId });
    return res.data;
};