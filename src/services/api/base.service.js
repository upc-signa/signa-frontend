import axios from 'axios';
import { env } from '../../config/env';

const api = axios.create({
    baseURL: env.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const baseService = {
    get: async (url, config = {}) => {
        const response = await api.get(url, config);
        return response.data;
    },
    
    post: async (url, data, config = {}) => {
        const response = await api.post(url, data, config);
        return response.data;
    },
    
    put: async (url, data, config = {}) => {
        const response = await api.put(url, data, config);
        return response.data;
    },
    
    delete: async (url, config = {}) => {
        const response = await api.delete(url, config);
        return response.data;
    }
};