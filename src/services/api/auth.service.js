import { baseService } from '../base.service';

export const authService = {
    login: async (credentials) => {
        return baseService.post('/auth/login', credentials);
    },

    register: async (userData) => {
        return baseService.post('/auth/register', userData);
    },

    verifyCode: async (verificationData) => {
        return baseService.post('/auth/verify-email', verificationData);
    },

    requestPasswordReset: async (email) => {
        return baseService.post('/auth/request-password-reset', { email });
    },

    resetPassword: async (resetData) => {
        return baseService.post('/auth/change-password', resetData);
    }
};