import axios from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://planfin.tech:8080';

export function configureApiAuth(token?: string | null) {
    try {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    } catch (error) {
        console.warn('Failed to configure axios auth header', error);
    }
}

export default axios;
