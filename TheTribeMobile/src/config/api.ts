// API Configuration for TheTribe Backend

// For Android emulator, use 10.0.2.2 to access host localhost
// For iOS simulator, use localhost
// For physical device, use your computer's LAN IP
const API_BASE_URL = __DEV__
    ? 'http://10.0.2.2:5290/api'
    : 'https://your-production-api.com/api'; // Update for production

export const API = {
    baseUrl: API_BASE_URL,
    endpoints: {
        auth: {
            login: '/Auth/login',
            register: '/Auth/register',
            refresh: '/Auth/refresh',
        },
        chat: {
            conversations: '/Chat/conversations',
            history: '/Chat/history',
            send: '/Chat/send',
        },
        user: {
            profile: '/User/profile',
        },
    },
};

export default API;
