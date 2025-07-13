// Database types for Rafton SOP Management Platform
// Auto-generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: DatabaseCompany;
        Insert: DatabaseCompanyInsert;
        Update: DatabaseCompanyUpdate;
      };
      users: {
        Row: DatabaseUser;
        Insert: DatabaseUserInsert;
        Update: DatabaseUserUpdate;
      };
      sop_folders: {
        Row: DatabaseSopFolder;
        Insert: DatabaseSopFolderInsert;
        Update: DatabaseSopFolderUpdate;
      };
      sop_categories: {
        Row: DatabaseSopCategory;
        Insert: DatabaseSopCategoryInsert;
        Update: DatabaseSopCategoryUpdate;
      };
      teams: {
        Row: DatabaseTeam;
        Insert: DatabaseTeamInsert;
        Update: DatabaseTeamUpdate;
      };
      team_members: {
        Row: DatabaseTeamMember;
        Insert: DatabaseTeamMemberInsert;
        Update: DatabaseTeamMemberUpdate;
      };
      sops: {
        Row: DatabaseSop;
        Insert: DatabaseSopInsert;
        Update: DatabaseSopUpdate;
      };
      sop_versions: {
        Row: DatabaseSopVersion;
        Insert: DatabaseSopVersionInsert;
        Update: DatabaseSopVersionUpdate;
      };
      working_copies: {
        Row: DatabaseWorkingCopy;
        Insert: DatabaseWorkingCopyInsert;
        Update: DatabaseWorkingCopyUpdate;
      };
      sop_comments: {
        Row: DatabaseSopComment;
        Insert: DatabaseSopCommentInsert;
        Update: DatabaseSopCommentUpdate;
      };
      sop_assignments: {
        Row: DatabaseSopAssignment;
        Insert: DatabaseSopAssignmentInsert;
        Update: DatabaseSopAssignmentUpdate;
      };
      acknowledgments: {
        Row: DatabaseAcknowledgment;
        Insert: DatabaseAcknowledgmentInsert;
        Update: DatabaseAcknowledgmentUpdate;
      };
      sop_reviews: {
        Row: DatabaseSopReview;
        Insert: DatabaseSopReviewInsert;
        Update: DatabaseSopReviewUpdate;
      };
      reminders: {
        Row: DatabaseReminder;
        Insert: DatabaseReminderInsert;
        Update: DatabaseReminderUpdate;
      };
      notifications: {
        Row: DatabaseNotification;
        Insert: DatabaseNotificationInsert;
        Update: DatabaseNotificationUpdate;
      };
      audit_logs: {
        Row: DatabaseAuditLog;
        Insert: DatabaseAuditLogInsert;
        Update: DatabaseAuditLogUpdate;
      };
      compliance_reports: {
        Row: DatabaseComplianceReport;
        Insert: DatabaseComplianceReportInsert;
        Update: DatabaseComplianceReportUpdate;
      };
      file_attachments: {
        Row: DatabaseFileAttachment;
        Insert: DatabaseFileAttachmentInsert;
        Update: DatabaseFileAttachmentUpdate;
      };
      user_sessions: {
        Row: DatabaseUserSession;
        Insert: DatabaseUserSessionInsert;
        Update: DatabaseUserSessionUpdate;
      };
      error_logs: {
        Row: DatabaseErrorLog;
        Insert: DatabaseErrorLogInsert;
        Update: DatabaseErrorLogUpdate;
      };
      webhooks: {
        Row: DatabaseWebhook;
        Insert: DatabaseWebhookInsert;
        Update: DatabaseWebhookUpdate;
      };
      compliance_frameworks: {
        Row: DatabaseComplianceFramework;
        Insert: DatabaseComplianceFrameworkInsert;
        Update: DatabaseComplianceFrameworkUpdate;
      };
      sop_compliance_mappings: {
        Row: DatabaseSopComplianceMapping;
        Insert: DatabaseSopComplianceMappingInsert;
        Update: DatabaseSopComplianceMappingUpdate;
      };
      sop_templates: {
        Row: DatabaseSopTemplate;
        Insert: DatabaseSopTemplateInsert;
        Update: DatabaseSopTemplateUpdate;
      };
      document_blocks: {
        Row: DatabaseDocumentBlock;
        Insert: DatabaseDocumentBlockInsert;
        Update: DatabaseDocumentBlockUpdate;
      };
      document_collaborations: {
        Row: DatabaseDocumentCollaboration;
        Insert: DatabaseDocumentCollaborationInsert;
        Update: DatabaseDocumentCollaborationUpdate;
      };
      document_changes: {
        Row: DatabaseDocumentChange;
        Insert: DatabaseDocumentChangeInsert;
        Update: DatabaseDocumentChangeUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      is_user_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_user_auditor: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: {
      user_role: 'admin' | 'employee' | 'auditor';
      user_status: 'active' | 'inactive' | 'pending';
      company_size: 'small' | 'medium' | 'large' | 'enterprise';
      sop_status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
      priority_level: 'low' | 'medium' | 'high' | 'critical';
      team_member_role: 'member' | 'lead' | 'admin';
      assignment_status: 'pending' | 'acknowledged' | 'overdue';
      review_status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
      review_type: 'approval' | 'periodic' | 'audit';
      reminder_type: 'acknowledgment' | 'review' | 'expiration' | 'overdue';
      reminder_channel: 'email' | 'in-app' | 'slack' | 'teams';
      reminder_status: 'pending' | 'sent' | 'failed' | 'cancelled';
      notification_priority: 'low' | 'medium' | 'high' | 'urgent';
      report_status: 'pending' | 'generating' | 'completed' | 'failed';
      coverage_level: 'full' | 'partial' | 'related';
      difficulty_level: 'beginner' | 'intermediate' | 'advanced';
      collaboration_status: 'active' | 'idle' | 'disconnected';
      change_type: 'insert' | 'delete' | 'update' | 'format';
    };
  };
}

// Company Types
export interface DatabaseCompany {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: Database['public']['Enums']['company_size'] | null;
  logo_url: string | null;
  settings: Record<string, any>;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DatabaseCompanyInsert {
  id?: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  size?: Database['public']['Enums']['company_size'] | null;
  logo_url?: string | null;
  settings?: Record<string, any>;
  subscription_plan?: string;
  subscription_status?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DatabaseCompanyUpdate {
  id?: string;
  name?: string;
  domain?: string | null;
  industry?: string | null;
  size?: Database['public']['Enums']['company_size'] | null;
  logo_url?: string | null;
  settings?: Record<string, any>;
  subscription_plan?: string;
  subscription_status?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// User Types
export interface DatabaseUser {
  id: string;
  company_id: string | null;
  email: string;
  password_hash: string | null;
  first_name: string;
  last_name: string;
  role: Database['public']['Enums']['user_role'];
  department: string | null;
  position: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: Database['public']['Enums']['user_status'];
  preferences: Record<string, any>;
  last_login: string | null;
  email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DatabaseUserInsert {
  id?: string;
  company_id?: string | null;
  email: string;
  password_hash?: string | null;
  first_name: string;
  last_name: string;
  role: Database['public']['Enums']['user_role'];
  department?: string | null;
  position?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  status?: Database['public']['Enums']['user_status'];
  preferences?: Record<string, any>;
  last_login?: string | null;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DatabaseUserUpdate {
  id?: string;
  company_id?: string | null;
  email?: string;
  password_hash?: string | null;
  first_name?: string;
  last_name?: string;
  role?: Database['public']['Enums']['user_role'];
  department?: string | null;
  position?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  status?: Database['public']['Enums']['user_status'];
  preferences?: Record<string, any>;
  last_login?: string | null;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// SOP Folder Types
export interface DatabaseSopFolder {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  path: string | null;
  depth: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSopFolderInsert {
  id?: string;
  company_id?: string | null;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order?: number;
  path?: string | null;
  depth?: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSopFolderUpdate {
  id?: string;
  company_id?: string | null;
  name?: string;
  description?: string | null;
  parent_id?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order?: number;
  path?: string | null;
  depth?: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// SOP Category Types
export interface DatabaseSopCategory {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSopCategoryInsert {
  id?: string;
  company_id?: string | null;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSopCategoryUpdate {
  id?: string;
  company_id?: string | null;
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Team Types
export interface DatabaseTeam {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTeamInsert {
  id?: string;
  company_id?: string | null;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseTeamUpdate {
  id?: string;
  company_id?: string | null;
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Team Member Types
export interface DatabaseTeamMember {
  id: string;
  team_id: string | null;
  user_id: string | null;
  role: Database['public']['Enums']['team_member_role'];
  joined_at: string;
  added_by: string | null;
}

export interface DatabaseTeamMemberInsert {
  id?: string;
  team_id?: string | null;
  user_id?: string | null;
  role?: Database['public']['Enums']['team_member_role'];
  joined_at?: string;
  added_by?: string | null;
}

export interface DatabaseTeamMemberUpdate {
  id?: string;
  team_id?: string | null;
  user_id?: string | null;
  role?: Database['public']['Enums']['team_member_role'];
  joined_at?: string;
  added_by?: string | null;
}

// SOP Types
export interface DatabaseSop {
  id: string;
  company_id: string | null;
  folder_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  content: string;
  version: string;
  status: Database['public']['Enums']['sop_status'];
  priority: Database['public']['Enums']['priority_level'];
  department: string | null;
  tags: string[] | null;
  document_url: string | null;
  document_type: string | null;
  file_size: number | null;
  author_id: string | null;
  reviewer_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
  expires_at: string | null;
  review_frequency: number | null;
  next_review_date: string | null;
  view_count: number;
  download_count: number;
  comments_enabled: boolean;
  locked: boolean;
  ai_generated: boolean;
  integration_status: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DatabaseSopInsert {
  id?: string;
  company_id?: string | null;
  folder_id?: string | null;
  category_id?: string | null;
  title: string;
  description?: string | null;
  content: string;
  version?: string;
  status?: Database['public']['Enums']['sop_status'];
  priority?: Database['public']['Enums']['priority_level'];
  department?: string | null;
  tags?: string[] | null;
  document_url?: string | null;
  document_type?: string | null;
  file_size?: number | null;
  author_id?: string | null;
  reviewer_id?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  expires_at?: string | null;
  review_frequency?: number | null;
  next_review_date?: string | null;
  view_count?: number;
  download_count?: number;
  comments_enabled?: boolean;
  locked?: boolean;
  ai_generated?: boolean;
  integration_status?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DatabaseSopUpdate {
  id?: string;
  company_id?: string | null;
  folder_id?: string | null;
  category_id?: string | null;
  title?: string;
  description?: string | null;
  content?: string;
  version?: string;
  status?: Database['public']['Enums']['sop_status'];
  priority?: Database['public']['Enums']['priority_level'];
  department?: string | null;
  tags?: string[] | null;
  document_url?: string | null;
  document_type?: string | null;
  file_size?: number | null;
  author_id?: string | null;
  reviewer_id?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  expires_at?: string | null;
  review_frequency?: number | null;
  next_review_date?: string | null;
  view_count?: number;
  download_count?: number;
  comments_enabled?: boolean;
  locked?: boolean;
  ai_generated?: boolean;
  integration_status?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// SOP Version Types
export interface DatabaseSopVersion {
  id: string;
  sop_id: string | null;
  version: string;
  title: string;
  content: string;
  description: string | null;
  document_url: string | null;
  change_summary: string | null;
  author_id: string | null;
  created_at: string;
}

export interface DatabaseSopVersionInsert {
  id?: string;
  sop_id?: string | null;
  version: string;
  title: string;
  content: string;
  description?: string | null;
  document_url?: string | null;
  change_summary?: string | null;
  author_id?: string | null;
  created_at?: string;
}

export interface DatabaseSopVersionUpdate {
  id?: string;
  sop_id?: string | null;
  version?: string;
  title?: string;
  content?: string;
  description?: string | null;
  document_url?: string | null;
  change_summary?: string | null;
  author_id?: string | null;
  created_at?: string;
}

// Working Copy Types
export interface DatabaseWorkingCopy {
  id: string;
  sop_id: string | null;
  user_id: string | null;
  title: string | null;
  content: string | null;
  description: string | null;
  changes: Record<string, any>;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWorkingCopyInsert {
  id?: string;
  sop_id?: string | null;
  user_id?: string | null;
  title?: string | null;
  content?: string | null;
  description?: string | null;
  changes?: Record<string, any>;
  is_submitted?: boolean;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseWorkingCopyUpdate {
  id?: string;
  sop_id?: string | null;
  user_id?: string | null;
  title?: string | null;
  content?: string | null;
  description?: string | null;
  changes?: Record<string, any>;
  is_submitted?: boolean;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// SOP Comment Types
export interface DatabaseSopComment {
  id: string;
  sop_id: string | null;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  mentions: string[] | null;
  attachments: any[] | null;
  reactions: Record<string, any>;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DatabaseSopCommentInsert {
  id?: string;
  sop_id?: string | null;
  user_id?: string | null;
  parent_id?: string | null;
  content: string;
  mentions?: string[] | null;
  attachments?: any[] | null;
  reactions?: Record<string, any>;
  is_resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DatabaseSopCommentUpdate {
  id?: string;
  sop_id?: string | null;
  user_id?: string | null;
  parent_id?: string | null;
  content?: string;
  mentions?: string[] | null;
  attachments?: any[] | null;
  reactions?: Record<string, any>;
  is_resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// SOP Assignment Types
export interface DatabaseSopAssignment {
  id: string;
  company_id: string | null;
  sop_id: string | null;
  user_id: string | null;
  assigned_by: string | null;
  due_date: string | null;
  priority: Database['public']['Enums']['priority_level'];
  status: Database['public']['Enums']['assignment_status'];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSopAssignmentInsert {
  id?: string;
  company_id?: string | null;
  sop_id?: string | null;
  user_id?: string | null;
  assigned_by?: string | null;
  due_date?: string | null;
  priority?: Database['public']['Enums']['priority_level'];
  status?: Database['public']['Enums']['assignment_status'];
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSopAssignmentUpdate {
  id?: string;
  company_id?: string | null;
  sop_id?: string | null;
  user_id?: string | null;
  assigned_by?: string | null;
  due_date?: string | null;
  priority?: Database['public']['Enums']['priority_level'];
  status?: Database['public']['Enums']['assignment_status'];
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Acknowledgment Types
export interface DatabaseAcknowledgment {
  id: string;
  assignment_id: string | null;
  user_id: string | null;
  sop_id: string | null;
  sop_version: string;
  ip_address: string | null;
  user_agent: string | null;
  notes: string | null;
  acknowledged_at: string;
  created_at: string;
}

export interface DatabaseAcknowledgmentInsert {
  id?: string;
  assignment_id?: string | null;
  user_id?: string | null;
  sop_id?: string | null;
  sop_version: string;
  ip_address?: string | null;
  user_agent?: string | null;
  notes?: string | null;
  acknowledged_at?: string;
  created_at?: string;
}

export interface DatabaseAcknowledgmentUpdate {
  id?: string;
  assignment_id?: string | null;
  user_id?: string | null;
  sop_id?: string | null;
  sop_version?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  notes?: string | null;
  acknowledged_at?: string;
  created_at?: string;
}

// SOP Review Types
export interface DatabaseSopReview {
  id: string;
  sop_id: string | null;
  reviewer_id: string | null;
  status: Database['public']['Enums']['review_status'];
  comments: string | null;
  review_type: Database['public']['Enums']['review_type'];
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSopReviewInsert {
  id?: string;
  sop_id?: string | null;
  reviewer_id?: string | null;
  status?: Database['public']['Enums']['review_status'];
  comments?: string | null;
  review_type?: Database['public']['Enums']['review_type'];
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSopReviewUpdate {
  id?: string;
  sop_id?: string | null;
  reviewer_id?: string | null;
  status?: Database['public']['Enums']['review_status'];
  comments?: string | null;
  review_type?: Database['public']['Enums']['review_type'];
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Reminder Types
export interface DatabaseReminder {
  id: string;
  assignment_id: string | null;
  review_id: string | null;
  user_id: string | null;
  escalation_user_id: string | null;
  type: Database['public']['Enums']['reminder_type'];
  message: string;
  channel: Database['public']['Enums']['reminder_channel'];
  scheduled_at: string;
  sent_at: string | null;
  status: Database['public']['Enums']['reminder_status'];
  retry_count: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DatabaseReminderInsert {
  id?: string;
  assignment_id?: string | null;
  review_id?: string | null;
  user_id?: string | null;
  escalation_user_id?: string | null;
  type: Database['public']['Enums']['reminder_type'];
  message: string;
  channel?: Database['public']['Enums']['reminder_channel'];
  scheduled_at: string;
  sent_at?: string | null;
  status?: Database['public']['Enums']['reminder_status'];
  retry_count?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface DatabaseReminderUpdate {
  id?: string;
  assignment_id?: string | null;
  review_id?: string | null;
  user_id?: string | null;
  escalation_user_id?: string | null;
  type?: Database['public']['Enums']['reminder_type'];
  message?: string;
  channel?: Database['public']['Enums']['reminder_channel'];
  scheduled_at?: string;
  sent_at?: string | null;
  status?: Database['public']['Enums']['reminder_status'];
  retry_count?: number;
  metadata?: Record<string, any>;
  created_at?: string;
}

// Notification Types
export interface DatabaseNotification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  priority: Database['public']['Enums']['notification_priority'];
  expires_at: string | null;
  created_at: string;
}

export interface DatabaseNotificationInsert {
  id?: string;
  user_id?: string | null;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read?: boolean;
  priority?: Database['public']['Enums']['notification_priority'];
  expires_at?: string | null;
  created_at?: string;
}

export interface DatabaseNotificationUpdate {
  id?: string;
  user_id?: string | null;
  type?: string;
  title?: string;
  message?: string;
  data?: Record<string, any>;
  read?: boolean;
  priority?: Database['public']['Enums']['notification_priority'];
  expires_at?: string | null;
  created_at?: string;
}

// Audit Log Types
export interface DatabaseAuditLog {
  id: string;
  company_id: string | null;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  retention_expires_at: string | null;
  created_at: string;
}

export interface DatabaseAuditLogInsert {
  id?: string;
  company_id?: string | null;
  user_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
  retention_expires_at?: string | null;
  created_at?: string;
}

export interface DatabaseAuditLogUpdate {
  id?: string;
  company_id?: string | null;
  user_id?: string | null;
  action?: string;
  resource_type?: string;
  resource_id?: string | null;
  old_values?: Record<string, any> | null;
  new_values?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
  retention_expires_at?: string | null;
  created_at?: string;
}

// Compliance Report Types
export interface DatabaseComplianceReport {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  report_type: string;
  filters: Record<string, any>;
  data: Record<string, any>;
  status: Database['public']['Enums']['report_status'];
  generated_by: string | null;
  scheduled_at: string | null;
  generated_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface DatabaseComplianceReportInsert {
  id?: string;
  company_id?: string | null;
  name: string;
  description?: string | null;
  report_type: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  status?: Database['public']['Enums']['report_status'];
  generated_by?: string | null;
  scheduled_at?: string | null;
  generated_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
}

export interface DatabaseComplianceReportUpdate {
  id?: string;
  company_id?: string | null;
  name?: string;
  description?: string | null;
  report_type?: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  status?: Database['public']['Enums']['report_status'];
  generated_by?: string | null;
  scheduled_at?: string | null;
  generated_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
}

// File Attachment Types
export interface DatabaseFileAttachment {
  id: string;
  company_id: string | null;
  uploaded_by: string | null;
  resource_type: string;
  resource_id: string | null;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  thumbnail_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DatabaseFileAttachmentInsert {
  id?: string;
  company_id?: string | null;
  uploaded_by?: string | null;
  resource_type: string;
  resource_id?: string | null;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  thumbnail_url?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface DatabaseFileAttachmentUpdate {
  id?: string;
  company_id?: string | null;
  uploaded_by?: string | null;
  resource_type?: string;
  resource_id?: string | null;
  filename?: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  file_url?: string;
  thumbnail_url?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
}

// User Session Types
export interface DatabaseUserSession {
  id: string;
  user_id: string | null;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: Record<string, any>;
  last_activity: string;
  expires_at: string;
  created_at: string;
}

export interface DatabaseUserSessionInsert {
  id?: string;
  user_id?: string | null;
  session_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device_info?: Record<string, any>;
  last_activity?: string;
  expires_at: string;
  created_at?: string;
}

export interface DatabaseUserSessionUpdate {
  id?: string;
  user_id?: string | null;
  session_token?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  device_info?: Record<string, any>;
  last_activity?: string;
  expires_at?: string;
  created_at?: string;
}

// Error Log Types
export interface DatabaseErrorLog {
  id: string;
  company_id: string | null;
  user_id: string | null;
  error_type: string;
  error_code: string | null;
  message: string;
  stack_trace: string | null;
  request_data: Record<string, any> | null;
  user_agent: string | null;
  ip_address: string | null;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface DatabaseErrorLogInsert {
  id?: string;
  company_id?: string | null;
  user_id?: string | null;
  error_type: string;
  error_code?: string | null;
  message: string;
  stack_trace?: string | null;
  request_data?: Record<string, any> | null;
  user_agent?: string | null;
  ip_address?: string | null;
  resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at?: string;
}

export interface DatabaseErrorLogUpdate {
  id?: string;
  company_id?: string | null;
  user_id?: string | null;
  error_type?: string;
  error_code?: string | null;
  message?: string;
  stack_trace?: string | null;
  request_data?: Record<string, any> | null;
  user_agent?: string | null;
  ip_address?: string | null;
  resolved?: boolean;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at?: string;
}

// Webhook Types
export interface DatabaseWebhook {
  id: string;
  company_id: string | null;
  name: string;
  url: string;
  secret: string | null;
  events: string[];
  active: boolean;
  retry_count: number;
  timeout_seconds: number;
  last_triggered: string | null;
  last_success: string | null;
  failure_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseWebhookInsert {
  id?: string;
  company_id?: string | null;
  name: string;
  url: string;
  secret?: string | null;
  events: string[];
  active?: boolean;
  retry_count?: number;
  timeout_seconds?: number;
  last_triggered?: string | null;
  last_success?: string | null;
  failure_count?: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseWebhookUpdate {
  id?: string;
  company_id?: string | null;
  name?: string;
  url?: string;
  secret?: string | null;
  events?: string[];
  active?: boolean;
  retry_count?: number;
  timeout_seconds?: number;
  last_triggered?: string | null;
  last_success?: string | null;
  failure_count?: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Compliance Framework Types
export interface DatabaseComplianceFramework {
  id: string;
  name: string;
  description: string | null;
  version: string | null;
  category: string | null;
  authority: string | null;
  url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseComplianceFrameworkInsert {
  id?: string;
  name: string;
  description?: string | null;
  version?: string | null;
  category?: string | null;
  authority?: string | null;
  url?: string | null;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseComplianceFrameworkUpdate {
  id?: string;
  name?: string;
  description?: string | null;
  version?: string | null;
  category?: string | null;
  authority?: string | null;
  url?: string | null;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// SOP Compliance Mapping Types
export interface DatabaseSopComplianceMapping {
  id: string;
  sop_id: string | null;
  framework_id: string | null;
  clause_reference: string;
  clause_title: string | null;
  coverage_level: Database['public']['Enums']['coverage_level'];
  evidence_notes: string | null;
  last_assessed: string | null;
  assessed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSopComplianceMappingInsert {
  id?: string;
  sop_id?: string | null;
  framework_id?: string | null;
  clause_reference: string;
  clause_title?: string | null;
  coverage_level?: Database['public']['Enums']['coverage_level'];
  evidence_notes?: string | null;
  last_assessed?: string | null;
  assessed_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSopComplianceMappingUpdate {
  id?: string;
  sop_id?: string | null;
  framework_id?: string | null;
  clause_reference?: string;
  clause_title?: string | null;
  coverage_level?: Database['public']['Enums']['coverage_level'];
  evidence_notes?: string | null;
  last_assessed?: string | null;
  assessed_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// SOP Template Types
export interface DatabaseSopTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  content: string;
  variables: any[] | null;
  compliance_frameworks: string[] | null;
  difficulty_level: Database['public']['Enums']['difficulty_level'];
  estimated_time_minutes: number | null;
  usage_count: number;
  rating: number;
  tags: string[] | null;
  preview_image_url: string | null;
  created_by: string | null;
  is_featured: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSopTemplateInsert {
  id?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  industry?: string | null;
  content: string;
  variables?: any[] | null;
  compliance_frameworks?: string[] | null;
  difficulty_level?: Database['public']['Enums']['difficulty_level'];
  estimated_time_minutes?: number | null;
  usage_count?: number;
  rating?: number;
  tags?: string[] | null;
  preview_image_url?: string | null;
  created_by?: string | null;
  is_featured?: boolean;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseSopTemplateUpdate {
  id?: string;
  name?: string;
  description?: string | null;
  category?: string | null;
  industry?: string | null;
  content?: string;
  variables?: any[] | null;
  compliance_frameworks?: string[] | null;
  difficulty_level?: Database['public']['Enums']['difficulty_level'];
  estimated_time_minutes?: number | null;
  usage_count?: number;
  rating?: number;
  tags?: string[] | null;
  preview_image_url?: string | null;
  created_by?: string | null;
  is_featured?: boolean;
  is_premium?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Document Block Types
export interface DatabaseDocumentBlock {
  id: string;
  sop_id: string | null;
  working_copy_id: string | null;
  block_type: string;
  content: Record<string, any>;
  position: number;
  parent_block_id: string | null;
  styles: Record<string, any>;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDocumentBlockInsert {
  id?: string;
  sop_id?: string | null;
  working_copy_id?: string | null;
  block_type: string;
  content: Record<string, any>;
  position: number;
  parent_block_id?: string | null;
  styles?: Record<string, any>;
  metadata?: Record<string, any>;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseDocumentBlockUpdate {
  id?: string;
  sop_id?: string | null;
  working_copy_id?: string | null;
  block_type?: string;
  content?: Record<string, any>;
  position?: number;
  parent_block_id?: string | null;
  styles?: Record<string, any>;
  metadata?: Record<string, any>;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Document Collaboration Types
export interface DatabaseDocumentCollaboration {
  id: string;
  sop_id: string | null;
  working_copy_id: string | null;
  user_id: string | null;
  session_id: string;
  cursor_position: Record<string, any> | null;
  active_block_id: string | null;
  status: Database['public']['Enums']['collaboration_status'];
  last_activity: string;
  joined_at: string;
}

export interface DatabaseDocumentCollaborationInsert {
  id?: string;
  sop_id?: string | null;
  working_copy_id?: string | null;
  user_id?: string | null;
  session_id: string;
  cursor_position?: Record<string, any> | null;
  active_block_id?: string | null;
  status?: Database['public']['Enums']['collaboration_status'];
  last_activity?: string;
  joined_at?: string;
}

export interface DatabaseDocumentCollaborationUpdate {
  id?: string;
  sop_id?: string | null;
  working_copy_id?: string | null;
  user_id?: string | null;
  session_id?: string;
  cursor_position?: Record<string, any> | null;
  active_block_id?: string | null;
  status?: Database['public']['Enums']['collaboration_status'];
  last_activity?: string;
  joined_at?: string;
}

// Document Change Types
export interface DatabaseDocumentChange {
  id: string;
  sop_id: string | null;
  working_copy_id: string | null;
  block_id: string | null;
  user_id: string | null;
  change_type: Database['public']['Enums']['change_type'];
  operation: Record<string, any>;
  content_before: Record<string, any> | null;
  content_after: Record<string, any> | null;
  position_before: number | null;
  position_after: number | null;
  applied: boolean;
  conflict_resolved: boolean;
  created_at: string;
}

export interface DatabaseDocumentChangeInsert {
  id?: string;
  sop_id?: string | null;
  working_copy_id?: string | null;
  block_id?: string | null;
  user_id?: string | null;
  change_type: Database['public']['Enums']['change_type'];
  operation: Record<string, any>;
  content_before?: Record<string, any> | null;
  content_after?: Record<string, any> | null;
  position_before?: number | null;
  position_after?: number | null;
  applied?: boolean;
  conflict_resolved?: boolean;
  created_at?: string;
}

export interface DatabaseDocumentChangeUpdate {
  id?: string;
  sop_id?: string | null;
  working_copy_id?: string | null;
  block_id?: string | null;
  user_id?: string | null;
  change_type?: Database['public']['Enums']['change_type'];
  operation?: Record<string, any>;
  content_before?: Record<string, any> | null;
  content_after?: Record<string, any> | null;
  position_before?: number | null;
  position_after?: number | null;
  applied?: boolean;
  conflict_resolved?: boolean;
  created_at?: string;
}

// Utility types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]; 