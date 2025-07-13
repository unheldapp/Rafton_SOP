// SOP feature types
export interface SOPFormData {
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

export interface SOPFilters {
  status?: string;
  category?: string;
  department?: string;
  search?: string;
  tags?: string[];
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface WorkingCopyFormData {
  title: string;
  description: string;
  content: string;
  changes: string[];
  reviewNotes?: string;
}

export interface ReviewSubmissionData {
  workingCopyId: string;
  decision: 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface TemplateFormData {
  name: string;
  description: string;
  content: string;
  category: string;
}

export interface SOPAssignmentData {
  sopId: string;
  userIds: string[];
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface SOPVersionData {
  id: string;
  version: number;
  title: string;
  description: string;
  createdAt: string;
  authorId: string;
  changes: string[];
  isActive: boolean;
}

export interface SOPMetadata {
  views: number;
  downloads: number;
  lastAccessed?: string;
  averageReadTime?: number;
  acknowledgmentRate?: number;
}

export interface SOPCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  sopCount: number;
}

export interface SOPTag {
  id: string;
  name: string;
  color: string;
  sopCount: number;
}

export interface FolderData {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  sopIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SOPExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'markdown';
  includeMetadata: boolean;
  includeVersionHistory: boolean;
  includeComments: boolean;
  watermark?: string;
}

export interface SOPImportOptions {
  file: File;
  category: string;
  department: string;
  tags: string[];
  templateId?: string;
  overwriteExisting: boolean;
}

export interface SOPBulkAction {
  action: 'assign' | 'archive' | 'delete' | 'move' | 'tag';
  sopIds: string[];
  data?: any;
}

export interface SOPSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  relevanceScore: number;
  highlights: {
    title?: string;
    description?: string;
    content?: string;
  };
}

export interface SOPCommentData {
  id: string;
  sopId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  mentions: string[];
}

export interface SOPActivity {
  id: string;
  sopId: string;
  userId: string;
  action: 'created' | 'updated' | 'reviewed' | 'approved' | 'rejected' | 'archived' | 'viewed';
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SOPWorkflow {
  id: string;
  name: string;
  description: string;
  steps: {
    id: string;
    name: string;
    type: 'review' | 'approval' | 'notification';
    assigneeRole: string;
    requiredApprovals: number;
    autoComplete: boolean;
    timeLimit?: number;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SOPState {
  sops: any[];
  workingCopies: any[];
  templates: any[];
  categories: SOPCategory[];
  tags: SOPTag[];
  folders: FolderData[];
  selectedSop: any | null;
  selectedWorkingCopy: any | null;
  filters: SOPFilters;
  loading: boolean;
  error: string | null;
  searchResults: SOPSearchResult[];
  searchQuery: string;
} 