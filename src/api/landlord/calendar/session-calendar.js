import api from '@/api/landlord/landlord_api';

export const getSessions = async (params = {}) => {
    try {
        const res = await api.get('/v1/landlord/calendar/sessions', { params });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createSession = async (data) => {
    try {
        const res = await api.post('/v1/landlord/calendar/sessions', data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const updateSession = async (session_id, data) => {
    try {
        const res = await api.put(`/v1/landlord/calendar/sessions/${session_id}`, data);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteSession = async (session_id) => {
    try {
        const res = await api.delete(`/v1/landlord/calendar/sessions/${session_id}`);
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const setCurrentSession = async (session_id) => {
    try {
        const res = await api.post('/v1/landlord/calendar/sessions/current', { session_id });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const manageSessionStatus = async (session_id, status) => {
    try {
        const res = await api.post('/v1/landlord/calendar/sessions/status', { session_id, status });
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getCurrentSession = async () => {
    try {
        const res = await api.get('/v1/landlord/calendar/sessions/current');
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getCurrentSessionForSelect = async () => {
    try {
        const res = await api.get('/v1/landlord/calendar/sessions/current/for-select');
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
export const getCurrentSessionAndAbove = async () => {
    try {
        const res = await api.get('/v1/landlord/calendar/sessions/current-and-above');
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
