import { apiClient } from '../client';
import type {
  APIComplianceRecord,
  APIAuditLog,
  ComplianceStatsResponse,
  AuditLogsResponse,
  AuditLogFilters,
} from '../types';

export const complianceEndpoints = {
  // Compliance Records
  getComplianceRecords: async (userId?: string): Promise<APIComplianceRecord[]> => {
    const endpoint = userId ? `/compliance/users/${userId}` : '/compliance';
    const response = await apiClient.get<APIComplianceRecord[]>(endpoint);
    return response.data;
  },

  getComplianceRecord: async (id: string): Promise<APIComplianceRecord> => {
    const response = await apiClient.get<APIComplianceRecord>(`/compliance/${id}`);
    return response.data;
  },

  acknowledgeCompliance: async (sopId: string): Promise<APIComplianceRecord> => {
    const response = await apiClient.post<APIComplianceRecord>('/compliance/acknowledge', {
      sopId,
    });
    return response.data;
  },

  // Compliance Statistics
  getComplianceStats: async (userId?: string): Promise<ComplianceStatsResponse> => {
    const endpoint = userId ? `/compliance/stats?userId=${userId}` : '/compliance/stats';
    const response = await apiClient.get<ComplianceStatsResponse>(endpoint);
    return response.data;
  },

  getDepartmentComplianceStats: async (department: string): Promise<ComplianceStatsResponse> => {
    const response = await apiClient.get<ComplianceStatsResponse>(`/compliance/stats/department/${department}`);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (filters: AuditLogFilters = {}): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<AuditLogsResponse>(`/audit-logs?${params}`);
    return response.data;
  },

  getAuditLog: async (id: string): Promise<APIAuditLog> => {
    const response = await apiClient.get<APIAuditLog>(`/audit-logs/${id}`);
    return response.data;
  },

  // Compliance Reports
  generateComplianceReport: async (filters: {
    userId?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'pdf' | 'excel' | 'csv';
  }): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`/api/compliance/report?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Report generation failed');
    }
    
    return response.blob();
  },

  generateAuditReport: async (filters: {
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'pdf' | 'excel' | 'csv';
  }): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    const response = await fetch(`/api/audit/report?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Report generation failed');
    }
    
    return response.blob();
  },

  // Compliance Notifications
  getComplianceNotifications: async (userId?: string): Promise<{
    id: string;
    type: 'overdue' | 'reminder' | 'new_assignment';
    message: string;
    sopId: string;
    createdAt: string;
    isRead: boolean;
  }[]> => {
    const endpoint = userId ? `/compliance/notifications?userId=${userId}` : '/compliance/notifications';
    const response = await apiClient.get<any[]>(endpoint);
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/compliance/notifications/${notificationId}/read`, {});
  },

  // Compliance Overrides (Admin only)
  overrideCompliance: async (recordId: string, reason: string): Promise<APIComplianceRecord> => {
    const response = await apiClient.post<APIComplianceRecord>(`/compliance/${recordId}/override`, {
      reason,
    });
    return response.data;
  },

  // Compliance Reminders
  sendComplianceReminder: async (userId: string, sopId: string): Promise<void> => {
    await apiClient.post('/compliance/reminder', {
      userId,
      sopId,
    });
  },
}; 