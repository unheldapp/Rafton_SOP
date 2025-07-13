import { Database } from './database';

// Re-export database types for convenience
export type { Database, DatabaseUser, DatabaseCompany, DatabaseSop } from './database';

// User role type (aligned with database enum)
export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type CompanySize = Database['public']['Enums']['company_size'];
export type SOPStatus = Database['public']['Enums']['sop_status'];
export type PriorityLevel = Database['public']['Enums']['priority_level'];

// Company interface (aligned with database)
export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string | null;
  size: CompanySize | null;
  logoUrl: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// User interface (aligned with database)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string | null;
  position: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  preferences: Record<string, any>;
  lastLogin: string | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  company: Company | null;
  createdAt?: string;
  updatedAt?: string;
}

// SOP interface (aligned with database)
export interface SOP {
  id: string;
  title: string;
  description: string | null;
  content: string;
  version: string;
  status: SOPStatus;
  priority: PriorityLevel;
  department: string | null;
  tags: string[] | null;
  documentUrl: string | null;
  documentType: string | null;
  fileSize: number | null;
  authorId: string | null;
  reviewerId: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  reviewFrequency: number | null;
  nextReviewDate: string | null;
  viewCount: number;
  downloadCount: number;
  commentsEnabled: boolean;
  locked: boolean;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Computed properties for backward compatibility
  acknowledgedPercent?: number;
  lastUpdated?: string;
  author?: string;
  assignedTo?: string[];
}

// Template interface (aligned with database)
export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  content: string;
  variables: any[] | null;
  complianceFrameworks: string[] | null;
  difficultyLevel: Database['public']['Enums']['difficulty_level'];
  estimatedTimeMinutes: number | null;
  usageCount: number;
  rating: number;
  tags: string[] | null;
  previewImageUrl: string | null;
  isFeatured: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Backward compatibility
  title?: string;
  department?: string;
}

// Working copy interface (aligned with database)
export interface WorkingCopy {
  id: string;
  sopId: string | null;
  userId: string | null;
  title: string | null;
  content: string | null;
  description: string | null;
  changes: Record<string, any>;
  isSubmitted: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Backward compatibility
  originalSOPId?: string;
  author?: string;
  createdDate?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewer?: string;
  reviewComments?: string;
}

// Auth related types
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User | null;
  requiresVerification?: boolean;
}

export interface SignupData {
  companyName: string;
  industryType: string;
  orgEmailDomain: string;
  fullName: string;
  workEmail: string;
  password: string;
}

export interface OnboardingData {
  organization: {
    logo: File | null;
    industry: string;
    organizationSize: CompanySize;
    country: string;
    timezone: string;
  };
  departments: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  teamMembers: Array<{
    email: string;
    role: 'employee' | 'auditor' | 'admin';
  }>;
  firstDocument: {
    file: File | null;
    title: string;
    type: 'SOP' | 'Policy' | 'Guideline';
    department: string;
    assignToUsers: string[];
  };
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  signupData: Partial<SignupData> | null;
  isLoading: boolean;
}

// Page navigation types
export type Page = 
  | 'login' 
  | 'signup' 
  | 'onboarding' 
  | 'dashboard' 
  | 'sops' 
  | 'template-selector' 
  | 'editor' 
  | 'version-control' 
  | 'review' 
  | 'sop-review' 
  | 'submit-review' 
  | 'acknowledgments' 
  | 'reports' 
  | 'settings' 
  | 'assigned' 
  | 'documents' 
  | 'history' 
  | 'notifications' 
  | 'help' 
  | 'compliance-overview' 
  | 'document-compliance' 
  | 'user-compliance' 
  | 'audit-logs' 
  | 'export-reports';

// Legacy interfaces for backward compatibility
export interface PendingReviewData {
  sop: SOP;
  changes: { 
    title: string; 
    content: string; 
    department: string; 
  };
}

export interface AppState {
  currentPage: Page;
  selectedSOP: SOP | null;
  selectedTemplate: Template | null;
  selectedWorkingCopy: WorkingCopy | null;
  isSidebarCollapsed: boolean;
  isNewReviewRequest: boolean;
  pendingReviewData: PendingReviewData | null;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  priority: Database['public']['Enums']['notification_priority'];
  expiresAt: string | null;
  createdAt: string;
}

// Assignment types
export interface Assignment {
  id: string;
  sopId: string;
  userId: string;
  assignedBy: string;
  dueDate: string | null;
  priority: PriorityLevel;
  status: Database['public']['Enums']['assignment_status'];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// Acknowledgment types
export interface Acknowledgment {
  id: string;
  assignmentId: string;
  userId: string;
  sopId: string;
  sopVersion: string;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  acknowledgedAt: string;
  createdAt: string;
}

// Comment types
export interface Comment {
  id: string;
  sopId: string;
  userId: string;
  parentId: string | null;
  content: string;
  mentions: string[] | null;
  attachments: any[] | null;
  reactions: Record<string, any>;
  isResolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  sopId: string;
  reviewerId: string;
  status: Database['public']['Enums']['review_status'];
  comments: string | null;
  reviewType: Database['public']['Enums']['review_type'];
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  companyId: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}

// Compliance types
export interface ComplianceFramework {
  id: string;
  name: string;
  description: string | null;
  version: string | null;
  category: string | null;
  authority: string | null;
  url: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceMapping {
  id: string;
  sopId: string;
  frameworkId: string;
  clauseReference: string;
  clauseTitle: string | null;
  coverageLevel: Database['public']['Enums']['coverage_level'];
  evidenceNotes: string | null;
  lastAssessed: string | null;
  assessedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// File attachment types
export interface FileAttachment {
  id: string;
  companyId: string;
  uploadedBy: string;
  resourceType: string;
  resourceId: string | null;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  metadata: Record<string, any>;
  createdAt: string;
}