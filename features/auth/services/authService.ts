import { api } from '../../../api';
import { transformApiUserToUser } from '../../../api/transformers';
import type { LoginFormData, RegisterFormData, OnboardingData, InvitationData } from '../types';
import type { User } from '../../../shared/types';

export class AuthService {
  // Authentication
  async login(credentials: LoginFormData): Promise<{
    user: User;
    token: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    try {
      const response = await api.auth.login({
        email: credentials.email,
        password: credentials.password,
      });

      // Store tokens
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('tokenExpiry', response.expiresAt);

      // Set token in API client
      const { apiClient } = await import('../../../api');
      apiClient.setToken(response.token);

      return {
        user: transformApiUserToUser(response.user),
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async register(userData: RegisterFormData): Promise<User> {
    try {
      const apiUser = await api.auth.register({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        companyName: userData.companyName,
        role: userData.role,
        department: userData.department,
        position: userData.position,
      });

      return transformApiUserToUser(apiUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('onboardingData');

      // Clear token from API client
      const { apiClient } = await import('../../../api');
      apiClient.setToken(null);
    }
  }

  async refreshToken(): Promise<{
    token: string;
    refreshToken: string;
    expiresAt: string;
  }> {
    try {
      const response = await api.auth.refreshToken();

      // Update stored tokens
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('tokenExpiry', response.expiresAt);

      // Set new token in API client
      const { apiClient } = await import('../../../api');
      apiClient.setToken(response.token);

      return {
        token: response.token,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const apiUser = await api.auth.getCurrentUser();
      return transformApiUserToUser(apiUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get current user');
    }
  }

  // Password Management
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.auth.forgotPassword(email);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password reset request failed');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await api.auth.resetPassword(token, password);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password reset failed');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.auth.changePassword({
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Password change failed');
    }
  }

  // Profile Management
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const apiUser = await api.auth.updateProfile(userData);
      return transformApiUserToUser(apiUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Profile update failed');
    }
  }

  // Email Verification
  async verifyEmail(token: string): Promise<void> {
    try {
      await api.auth.verifyEmail(token);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Email verification failed');
    }
  }

  async resendVerification(): Promise<void> {
    try {
      await api.auth.resendVerification();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to resend verification');
    }
  }

  // Invitation Management
  async acceptInvitation(token: string, userData: {
    name: string;
    password: string;
    position: string;
  }): Promise<User> {
    try {
      const apiUser = await api.users.acceptInvitation(token, userData);
      return transformApiUserToUser(apiUser);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Invitation acceptance failed');
    }
  }

  // Onboarding Data Management
  saveOnboardingData(data: OnboardingData): void {
    localStorage.setItem('onboardingData', JSON.stringify(data));
  }

  getOnboardingData(): OnboardingData | null {
    const data = localStorage.getItem('onboardingData');
    return data ? JSON.parse(data) : null;
  }

  clearOnboardingData(): void {
    localStorage.removeItem('onboardingData');
  }

  // Token Management
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    
    return new Date(expiry) <= new Date();
  }

  // Auto-refresh token if needed
  async ensureValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    if (this.isTokenExpired()) {
      try {
        const refreshed = await this.refreshToken();
        return refreshed.token;
      } catch (error) {
        // If refresh fails, clear tokens and return null
        this.logout();
        return null;
      }
    }

    return token;
  }
}

// Export singleton instance
export const authService = new AuthService(); 