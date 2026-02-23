import api from '../../../api/auth';

export const getAllStates = async () => {
    try {
        const res = await api.get('/agent/get_states');
        return res.data?.data;
    } catch (error) {
        console.error('Error fetching states:', error);
        throw error;
    }
};

export const getLgasByState = async (state_id) => {
    try {
        const res = await api.get(`/agent/${state_id}/get_lga_by_state_id`);
        return res.data?.data;
    } catch (error) {
        console.error(`Error fetching LGAs for state ${state_id}:`, error);
        throw error;
    }
};

export const createSchool = async (schoolData) => {
    try {
        const res = await api.post('/agent/create-tenant', schoolData);
        return res.data?.data || res.data;
    } catch (error) {
        console.error('Error creating school:', error);
        throw error.response?.data || error;
    }
};

export const getSchools = async () => {
    try {
        const res = await api.get('/agent/get-tenants');
        return res.data?.data;
    } catch (error) {
        console.error('Error fetching schools:', error);
        throw error.response?.data || error;
    }
};

export const updateSchool = async (id, schoolData) => {
    try {
        const res = await api.put(`/agent/update-tenant/${id}`, schoolData);
        return res.data?.data;
    } catch (error) {
        console.error('Error updating school:', error);
        throw error.response?.data || error;
    }
};

export const deleteSchool = async (id) => {
    try {
        const res = await api.delete(`/agent/delete-tenant/${id}`);
        return res.data;
    } catch (error) {
        console.error('Error deleting school:', error);
        throw error.response?.data || error;
    }
};
