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
        return res.data;
    } catch (error) {
        console.error('Error creating school:', error);
        throw error.response?.data || error;
    }
};
