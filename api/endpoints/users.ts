import { apiClient } from '../client';
import type {
  APIUser,
  UserListResponse,
  UserFilters,
} from '../types';

export const userEndpoints = {
  // User Management
  getUsers: async (filters: UserFilters = {}): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<UserListResponse>(`/users?${params}`);
    return response.data;
  },

  getUser: async (id: string): Promise<APIUser> => {
    const response = await apiClient.get<APIUser>(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: Omit<APIUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<APIUser> => {
    const response = await apiClient.post<APIUser>('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<APIUser>): Promise<APIUser> => {
    const response = await apiClient.put<APIUser>(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // User Status
  activateUser: async (id: string): Promise<APIUser> => {
    const response = await apiClient.put<APIUser>(`/users/${id}/activate`, {});
    return response.data;
  },

  deactivateUser: async (id: string): Promise<APIUser> => {
    const response = await apiClient.put<APIUser>(`/users/${id}/deactivate`, {});
    return response.data;
  },

  // Bulk Operations
  bulkCreateUsers: async (users: Omit<APIUser, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<APIUser[]> => {
    const response = await apiClient.post<APIUser[]>('/users/bulk', { users });
    return response.data;
  },

  bulkUpdateUsers: async (updates: { id: string; data: Partial<APIUser> }[]): Promise<APIUser[]> => {
    const response = await apiClient.put<APIUser[]>('/users/bulk', { updates });
    return response.data;
  },

  bulkDeleteUsers: async (ids: string[]): Promise<void> => {
    await apiClient.delete('/users/bulk', { data: { ids } });
  },

  // User Import/Export
  exportUsers: async (format: 'csv' | 'excel', filters: UserFilters = {}): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    params.append('format', format);
    
    const response = await fetch(`/api/users/export?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },

  importUsers: async (file: File): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/users/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Import failed');
    }
    
    return response.json();
  },

  // Department Management
  getDepartments: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/users/departments');
    return response.data;
  },

  getDepartmentUsers: async (department: string): Promise<APIUser[]> => {
    const response = await apiClient.get<APIUser[]>(`/users/departments/${department}`);
    return response.data;
  },

  // User Roles
  getRoles: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/users/roles');
    return response.data;
  },

  updateUserRole: async (id: string, role: string): Promise<APIUser> => {
    const response = await apiClient.put<APIUser>(`/users/${id}/role`, { role });
    return response.data;
  },

  // User Permissions
  getUserPermissions: async (id: string): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`/users/${id}/permissions`);
    return response.data;
  },

  updateUserPermissions: async (id: string, permissions: string[]): Promise<void> => {
    await apiClient.put(`/users/${id}/permissions`, { permissions });
  },

  // User Activity
  getUserActivity: async (id: string, dateFrom?: string, dateTo?: string): Promise<{
    id: string;
    action: string;
    resource: string;
    timestamp: string;
    details: Record<string, any>;
  }[]> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const response = await apiClient.get<any[]>(`/users/${id}/activity?${params}`);
    return response.data;
  },

  // User Invitations
  inviteUser: async (email: string, role: string, department: string): Promise<void> => {
    await apiClient.post('/users/invite', {
      email,
      role,
      department,
    });
  },

  resendInvitation: async (userId: string): Promise<void> => {
    await apiClient.post(`/users/${userId}/resend-invitation`, {});
  },

  acceptInvitation: async (token: string, userData: {
    name: string;
    password: string;
    position: string;
  }): Promise<APIUser> => {
    const response = await apiClient.post<APIUser>('/users/accept-invitation', {
      token,
      ...userData,
    });
    return response.data;
  },
}; 