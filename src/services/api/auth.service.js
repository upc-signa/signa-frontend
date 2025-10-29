import { baseService } from './base.service';

export const authService = {
    login: async (credentials) => {
        return baseService.post('/login', credentials);
    },

    register: async (userData) => {
        return baseService.post('/register', userData);
    },

    verifyCode: async (verificationData) => {
        return baseService.post('/verify-email', verificationData);
    },

    requestPasswordReset: async (email) => {
        return baseService.post('/request-password-reset', { email });
    },

    resetPassword: async (resetData) => {
        return baseService.post('/change-password', resetData);
    }
};