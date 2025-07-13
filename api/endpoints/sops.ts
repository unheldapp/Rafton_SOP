import { apiClient } from '../client';
import type {
  APISOP,
  APIWorkingCopy,
  APITemplate,
  CreateSOPRequest,
  UpdateSOPRequest,
  SubmitReviewRequest,
  ReviewDecisionRequest,
  AssignSOPRequest,
  SOPListResponse,
  SOPFilters,
} from '../types';

export const sopEndpoints = {
  // SOP Management
  getSops: async (filters: SOPFilters = {}): Promise<SOPListResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const response = await apiClient.get<SOPListResponse>(`/sops?${params}`);
    return response.data;
  },

  getSop: async (id: string): Promise<APISOP> => {
    const response = await apiClient.get<APISOP>(`/sops/${id}`);
    return response.data;
  },

  createSop: async (sopData: CreateSOPRequest): Promise<APISOP> => {
    const response = await apiClient.post<APISOP>('/sops', sopData);
    return response.data;
  },

  updateSop: async (id: string, sopData: UpdateSOPRequest): Promise<APISOP> => {
    const response = await apiClient.put<APISOP>(`/sops/${id}`, sopData);
    return response.data;
  },

  deleteSop: async (id: string): Promise<void> => {
    await apiClient.delete(`/sops/${id}`);
  },

  // Version Control
  getSOPVersions: async (sopId: string): Promise<APISOP[]> => {
    const response = await apiClient.get<APISOP[]>(`/sops/${sopId}/versions`);
    return response.data;
  },

  // Working Copies
  getWorkingCopies: async (sopId?: string): Promise<APIWorkingCopy[]> => {
    const endpoint = sopId ? `/sops/${sopId}/working-copies` : '/working-copies';
    const response = await apiClient.get<APIWorkingCopy[]>(endpoint);
    return response.data;
  },

  getWorkingCopy: async (id: string): Promise<APIWorkingCopy> => {
    const response = await apiClient.get<APIWorkingCopy>(`/working-copies/${id}`);
    return response.data;
  },

  createWorkingCopy: async (sopId: string): Promise<APIWorkingCopy> => {
    const response = await apiClient.post<APIWorkingCopy>(`/sops/${sopId}/working-copy`, {});
    return response.data;
  },

  updateWorkingCopy: async (id: string, content: string): Promise<APIWorkingCopy> => {
    const response = await apiClient.put<APIWorkingCopy>(`/working-copies/${id}`, { content });
    return response.data;
  },

  submitForReview: async (reviewData: SubmitReviewRequest): Promise<APIWorkingCopy> => {
    const response = await apiClient.post<APIWorkingCopy>('/working-copies/submit-review', reviewData);
    return response.data;
  },

  reviewWorkingCopy: async (reviewData: ReviewDecisionRequest): Promise<APIWorkingCopy> => {
    const response = await apiClient.post<APIWorkingCopy>('/working-copies/review', reviewData);
    return response.data;
  },

  // Templates
  getTemplates: async (): Promise<APITemplate[]> => {
    const response = await apiClient.get<APITemplate[]>('/templates');
    return response.data;
  },

  getTemplate: async (id: string): Promise<APITemplate> => {
    const response = await apiClient.get<APITemplate>(`/templates/${id}`);
    return response.data;
  },

  createTemplate: async (templateData: Omit<APITemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<APITemplate> => {
    const response = await apiClient.post<APITemplate>('/templates', templateData);
    return response.data;
  },

  updateTemplate: async (id: string, templateData: Partial<APITemplate>): Promise<APITemplate> => {
    const response = await apiClient.put<APITemplate>(`/templates/${id}`, templateData);
    return response.data;
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },

  // SOP Assignment
  assignSOP: async (assignmentData: AssignSOPRequest): Promise<void> => {
    await apiClient.post('/sops/assign', assignmentData);
  },

  getUserSOPs: async (userId: string): Promise<APISOP[]> => {
    const response = await apiClient.get<APISOP[]>(`/users/${userId}/sops`);
    return response.data;
  },

  // SOP Categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/sops/categories');
    return response.data;
  },

  // SOP Export
  exportSOP: async (id: string, format: 'pdf' | 'docx' | 'html'): Promise<Blob> => {
    const response = await fetch(`/api/sops/${id}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },
}; 