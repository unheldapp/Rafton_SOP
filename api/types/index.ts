// API Request/Response types - These represent the backend API contracts
export interface APIUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'auditor';
  department: string;
  position: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APISOP {
  id: string;
  title: string;
  description: string;
  content: string;
  version: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  category: string;
  department: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  effectiveDate?: string;
  expiryDate?: string;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface APIWorkingCopy {
  id: string;
  sopId: string;
  title: string;
  description: string;
  content: string;
  version: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  editorId: string;
  reviewerId?: string;
  createdAt: string;
  updatedAt: string;
  changes: string[];
  reviewNotes?: string;
}

export interface APITemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface APIComplianceRecord {
  id: string;
  userId: string;
  sopId: string;
  status: 'pending' | 'acknowledged' | 'overdue' | 'completed';
  acknowledgedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// API Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName: string;
  role: 'admin' | 'employee' | 'auditor';
  department: string;
  position: string;
}

export interface CreateSOPRequest {
  title: string;
  description: string;
  content: string;
  category: string;
  department: string;
  effectiveDate?: string;
  expiryDate?: string;
  tags: string[];
  templateId?: string;
}

export interface UpdateSOPRequest {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  department?: string;
  effectiveDate?: string;
  expiryDate?: string;
  tags?: string[];
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
}

export interface SubmitReviewRequest {
  sopId: string;
  changes: string[];
  reviewNotes?: string;
}

export interface ReviewDecisionRequest {
  workingCopyId: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface AssignSOPRequest {
  sopId: string;
  userIds: string[];
  dueDate?: string;
}

// API Response types
export interface LoginResponse {
  user: APIUser;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface SOPListResponse {
  sops: APISOP[];
  total: number;
  page: number;
  limit: number;
}

export interface UserListResponse {
  users: APIUser[];
  total: number;
  page: number;
  limit: number;
}

export interface ComplianceStatsResponse {
  totalSOPs: number;
  acknowledgedSOPs: number;
  pendingSOPs: number;
  overdueSOPs: number;
  complianceRate: number;
}

export interface AuditLogsResponse {
  logs: APIAuditLog[];
  total: number;
  page: number;
  limit: number;
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SOPFilters extends PaginationParams {
  status?: string;
  category?: string;
  department?: string;
  search?: string;
  tags?: string[];
}

export interface UserFilters extends PaginationParams {
  role?: string;
  department?: string;
  search?: string;
  isActive?: boolean;
}

export interface AuditLogFilters extends PaginationParams {
  userId?: string;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
} 