import { type AuthProvider, HttpError } from 'react-admin';
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api.motodiv.store',
    withCredentials: true, // Wajib kirim cookie
});

export const authProvider: AuthProvider = {
    login: async ({ username, password }) => {
        try {
            await api.post('/auth/login', { email: username, password });
            return Promise.resolve();
        } catch {
            return Promise.reject(new HttpError('Login gagal', 401));
        }
    },
    // FIX: Logout tetap sukses meski API error (misal session sudah habis)
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            console.log('Logout server failed, clearing client session anyway.');
        }
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            return Promise.reject();
        }
        return Promise.resolve();
    },
    // FIX: Tangkap error check-session agar redirect ke login page dengan mulus
    checkAuth: async () => {
        try {
            await api.get('/auth/check-session');
            return Promise.resolve();
        } catch {
            return Promise.reject();
        }
    },
    getPermissions: () => Promise.resolve(),
};