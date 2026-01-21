import axios from 'axios';

const api = axios.create({
    baseURL: 'http://' + window.location.host,
    withCredentials: true,
});

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        if (error.response && error.response.status === 401) {
            try {
                // Try to refresh token
                await api.post('/refresh-token');
                return api.request(error.config); // retry original request
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);



export default api;
