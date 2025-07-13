import { apiClient } from '../client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  APIUser,
} from '../types';

export const authEndpoints = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<APIUser> => {
    const response = await apiClient.post<APIUser>('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', {});
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {});
    return response.data;
  },

  getCurrentUser: async (): Promise<APIUser> => {
    const response = await apiClient.get<APIUser>('/auth/me');
    return response.data;
  },

  updateProfile: async (userData: Partial<APIUser>): Promise<APIUser> => {
    const response = await apiClient.put<APIUser>('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.put('/auth/password', passwords);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  // Email verification
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
  },

  resendVerification: async (): Promise<void> => {
    await apiClient.post('/auth/resend-verification', {});
  },
}; 