// API Service for TheTribe Mobile
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../config/api';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER: 'user',
};

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            async config => {
                const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            error => Promise.reject(error),
        );

        // Response interceptor for token refresh
        this.client.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = await AsyncStorage.getItem(
                            STORAGE_KEYS.REFRESH_TOKEN,
                        );
                        if (refreshToken) {
                            const response = await axios.post(
                                `${API.baseUrl}${API.endpoints.auth.refresh}`,
                                { refreshToken },
                            );

                            const { accessToken, refreshToken: newRefreshToken } =
                                response.data.data;

                            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                            await AsyncStorage.setItem(
                                STORAGE_KEYS.REFRESH_TOKEN,
                                newRefreshToken,
                            );

                            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, clear tokens
                        await this.clearTokens();
                    }
                }

                return Promise.reject(error);
            },
        );
    }

    async clearTokens() {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER,
        ]);
    }

    // Auth endpoints
    async login(email: string, password: string) {
        const response = await this.client.post(API.endpoints.auth.login, {
            email,
            password,
        });
        return response.data;
    }

    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const response = await this.client.post(API.endpoints.auth.register, data);
        return response.data;
    }

    // Chat endpoints
    async getConversations(filter: string = 'all') {
        const response = await this.client.get(
            `${API.endpoints.chat.conversations}?filter=${filter}`,
        );
        return response.data;
    }

    async getChatHistory(chatRoomId?: string) {
        const url = chatRoomId
            ? `${API.endpoints.chat.history}?chatRoomId=${chatRoomId}`
            : API.endpoints.chat.history;
        const response = await this.client.get(url);
        return response.data;
    }

    async sendMessage(data: {
        content: string;
        receiverId?: string;
        chatRoomId?: string;
    }) {
        const response = await this.client.post(API.endpoints.chat.send, data);
        return response.data;
    }

    // User endpoints
    async getProfile() {
        const response = await this.client.get('/Users/me');
        return response.data;
    }

    async updateProfile(data: {
        firstName?: string;
        lastName?: string;
        bio?: string;
        phoneNumber?: string;
        location?: string;
        occupation?: string;
    }) {
        const response = await this.client.put('/Users/me', data);
        return response.data;
    }

    // Connection endpoints
    async getConnections() {
        const response = await this.client.get('/Connection');
        return response.data;
    }

    async getPendingConnections() {
        const response = await this.client.get('/Connection/pending');
        return response.data;
    }

    async sendConnectionRequest(targetUserId: string) {
        const response = await this.client.post('/Connection/request', { targetUserId });
        return response.data;
    }

    async respondToConnection(connectionId: string, status: number) {
        const response = await this.client.put(`/Connection/${connectionId}/respond`, { status });
        return response.data;
    }

    // Chat Room endpoints
    async getChatRooms() {
        const response = await this.client.get('/ChatRoom');
        return response.data;
    }

    async createChatRoom(name: string, description: string) {
        const response = await this.client.post('/ChatRoom', { name, description });
        return response.data;
    }

    async getChatRoom(id: string) {
        const response = await this.client.get(`/ChatRoom/${id}`);
        return response.data;
    }

    async addMemberToRoom(roomId: string, userId: string) {
        const response = await this.client.post(`/ChatRoom/${roomId}/members`, { userId });
        return response.data;
    }

    async getRoomMembers(roomId: string) {
        const response = await this.client.get(`/ChatRoom/${roomId}/members`);
        return response.data;
    }

    // Live Session endpoints
    async getLiveSessions() {
        const response = await this.client.get('/LiveSession');
        return response.data;
    }

    async getLiveSession(id: string) {
        const response = await this.client.get(`/LiveSession/${id}`);
        return response.data;
    }

    // Content endpoints
    async getTrainingModules() {
        const response = await this.client.get('/Content/modules');
        return response.data;
    }

    async getContentSessions() {
        const response = await this.client.get('/Content/sessions');
        return response.data;
    }
}

export const apiService = new ApiService();
export { STORAGE_KEYS };
export default apiService;

