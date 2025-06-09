import axios from 'axios';
import * as localStorage from 'local-storage';

const API_URL = 'https://lpu-lostfound-tyh24.ondigitalocean.app/';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type' : 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await localStorage.get('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;