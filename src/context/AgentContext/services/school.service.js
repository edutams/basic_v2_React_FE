import api from '../../../api/auth';

export const getAllStates = async () => {
    try {
        const res = await api.get('/landlord/v1/state/get_states');
        return res.data?.data;
    } catch (error) {
        console.error('Error fetching states:', error);
        throw error;
    }
};

export const getLgasByState = async (state_id) => {
    try {
        const res = await api.get(`/landlord/v1/state/lga/${state_id}/get_lga_by_state_id`);
        return res.data?.data;
    } catch (error) {
        console.error(`Error fetching LGAs for state ${state_id}:`, error);
        throw error;
    }
};

export const createSchool = async (schoolData) => {
    try {
        const res = await api.post('/landlord/v1/create-tenant', schoolData);
        return res.data?.data || res.data;
    } catch (error) {
        console.error('Error creating school:', error);
        throw error.response?.data || error;
    }
};

export const getSchools = async () => {
    try {
        const res = await api.get('/landlord/v1/get-tenants');
        return res.data?.data;
    } catch (error) {
        console.error('Error fetching schools:', error);
        throw error.response?.data || error;
    }
};

export const updateSchool = async (id, schoolData) => {
    try {
        const res = await api.put(`/landlord/v1/update-tenant/${id}`, schoolData);
        return res.data;
    } catch (error) {
        console.error('Error updating school:', error);
        throw error.response?.data || error;
    }
};

export const deleteSchool = async (id) => {
    try {
        const res = await api.delete(`/landlord/v1/delete-tenant/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error deleting school:', error);
        throw error.response?.data || error;
    }
};

export const getSchoolCategories = async () => {
    try {
        const res = await api.get('/landlord/v1/get_school_categories');
        return res.data?.data;
    } catch (error) {
        console.error('Error fetching school categories:', error);
        throw error;
    }
};

export const getSchoolDivisions = async () => {
    try {
        const res = await api.get('/landlord/v1/get_school_divisions');
        return res.data?.data;
    } catch (error) {
        console.error('Error fetching school divisions:', error);
        throw error;
    }
};

// Category Management
export const storeSchoolCategory = async (data) => {
    try {
        const res = await api.post('/landlord/v1/school_categories', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateSchoolCategory = async (id, data) => {
    try {
        const res = await api.put(`/landlord/v1/school_categories/${id}`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteSchoolCategory = async (id) => {
    try {
        const res = await api.delete(`/landlord/v1/school_categories/${id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Division Management
export const storeSchoolDivision = async (data) => {
    try {
        const res = await api.post('/landlord/v1/school_divisions', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateSchoolDivision = async (id, data) => {
    try {
        const res = await api.put(`/landlord/v1/school_divisions/${id}`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteSchoolDivision = async (id) => {
    try {
        const res = await api.delete(`/landlord/v1/school_divisions/${id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ── Prospective Tenant (School Applications) ──────────────────────────────

export const getProspectiveTenants = async () => {
    try {
        const res = await api.get('/landlord/v1/prospective-tenants/get-prospective-tenants');
        return res.data?.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createProspectiveTenant = async (data) => {
    try {
        const res = await api.post('/landlord/v1/prospective-tenants/create-prospective-tenant', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getProspectiveTenant = async (id) => {
    try {
        const res = await api.get(`/landlord/v1/prospective-tenants/get-single-prospective-tenant/${id}`);
        return res.data?.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const approveProspectiveTenant = async (id) => {
    try {
        const res = await api.post(`/landlord/v1/prospective-tenants/${id}/approve-prospective-tenant`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const rejectProspectiveTenant = async (id, reason = '') => {
    try {
        const res = await api.post(`/landlord/v1/prospective-tenants/${id}/reject-prospective-tenant`, { reason });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
