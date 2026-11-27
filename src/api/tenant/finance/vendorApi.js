import api from '@/api/tenant/tenant_api';

export const fetchVendors = async (params) => {
    const res = await api.get('/vendor_manager/fetch_vendors', { params });
    return res.data;
};

export const fetchVendor = async (id) => {
    const res = await api.get(`/vendor_manager/fetch_vendor/${id}`);
    return res.data;
};

export const fetchVendorTransactions = async (id, params) => {
    const res = await api.get(`/vendor_manager/fetch_vendor_transactions/${id}`, { params });
    return res.data;
};

export const createVendor = async (payload) => {
    const res = await api.post('/vendor_manager/create_vendor', payload);
    return res.data;
};

export const updateVendor = async (id, payload) => {
    const res = await api.put(`/vendor_manager/update_vendor/${id}`, payload);
    return res.data;
};

export const toggleVendorStatus = async (id) => {
    const res = await api.put(`/vendor_manager/toggle_vendor_status/${id}`);
    return res.data;
};

export const fetchBanks = async () => {
    const res = await api.get('/vendor_manager/fetch_banks');
    return res.data;
};

export const resolveVendorAccount = async (payload) => {
    const res = await api.post('/vendor_manager/resolve_account', payload);
    return res.data;
};
