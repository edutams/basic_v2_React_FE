import api from '../../../api/auth';

export const getSessions = async (params = {}) => {
    try {
        const res = await api.get('/agent/sessions', { params });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createSession = async (data) => {
    try {
        const res = await api.post('/agent/sessions', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateSession = async (session_id, data) => {
    try {
        const res = await api.put(`/agent/sessions/${session_id}`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteSession = async (session_id) => {
    try {
        const res = await api.delete(`/agent/sessions/${session_id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const setCurrentSession = async (session_id) => {
    try {
        const res = await api.post('/agent/sessions/current', { session_id });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const manageSessionStatus = async (session_id, status) => {
    try {
        const res = await api.post('/agent/sessions/status', { session_id, status });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};