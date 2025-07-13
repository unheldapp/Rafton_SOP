// Data transformers to convert between API types and UI types
import type { APIUser, APISOP, APIWorkingCopy, APITemplate, APIComplianceRecord } from '../types';
import type { User, SOP, WorkingCopy, Template, ComplianceRecord } from '../../types';

// User transformers
export const transformApiUserToUser = (apiUser: APIUser): User => ({
  id: apiUser.id,
  email: apiUser.email,
  name: apiUser.name,
  role: apiUser.role,
  department: apiUser.department,
  position: apiUser.position,
  avatar: apiUser.avatar,
  isActive: apiUser.isActive,
  createdAt: apiUser.createdAt,
  updatedAt: apiUser.updatedAt,
});

export const transformUserToApiUser = (user: User): APIUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  department: user.department,
  position: user.position,
  avatar: user.avatar,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// SOP transformers
export const transformApiSopToSop = (apiSop: APISOP): SOP => ({
  id: apiSop.id,
  title: apiSop.title,
  description: apiSop.description,
  content: apiSop.content,
  version: apiSop.version,
  status: apiSop.status,
  category: apiSop.category,
  department: apiSop.department,
  authorId: apiSop.authorId,
  createdAt: apiSop.createdAt,
  updatedAt: apiSop.updatedAt,
  effectiveDate: apiSop.effectiveDate,
  expiryDate: apiSop.expiryDate,
  tags: apiSop.tags,
  metadata: apiSop.metadata,
});

export const transformSopToApiSop = (sop: SOP): APISOP => ({
  id: sop.id,
  title: sop.title,
  description: sop.description,
  content: sop.content,
  version: sop.version,
  status: sop.status,
  category: sop.category,
  department: sop.department,
  authorId: sop.authorId,
  createdAt: sop.createdAt,
  updatedAt: sop.updatedAt,
  effectiveDate: sop.effectiveDate,
  expiryDate: sop.expiryDate,
  tags: sop.tags,
  metadata: sop.metadata,
});

// Working Copy transformers
export const transformApiWorkingCopyToWorkingCopy = (apiWorkingCopy: APIWorkingCopy): WorkingCopy => ({
  id: apiWorkingCopy.id,
  sopId: apiWorkingCopy.sopId,
  title: apiWorkingCopy.title,
  description: apiWorkingCopy.description,
  content: apiWorkingCopy.content,
  version: apiWorkingCopy.version,
  status: apiWorkingCopy.status,
  editorId: apiWorkingCopy.editorId,
  reviewerId: apiWorkingCopy.reviewerId,
  createdAt: apiWorkingCopy.createdAt,
  updatedAt: apiWorkingCopy.updatedAt,
  changes: apiWorkingCopy.changes,
  reviewNotes: apiWorkingCopy.reviewNotes,
});

export const transformWorkingCopyToApiWorkingCopy = (workingCopy: WorkingCopy): APIWorkingCopy => ({
  id: workingCopy.id,
  sopId: workingCopy.sopId,
  title: workingCopy.title,
  description: workingCopy.description,
  content: workingCopy.content,
  version: workingCopy.version,
  status: workingCopy.status,
  editorId: workingCopy.editorId,
  reviewerId: workingCopy.reviewerId,
  createdAt: workingCopy.createdAt,
  updatedAt: workingCopy.updatedAt,
  changes: workingCopy.changes,
  reviewNotes: workingCopy.reviewNotes,
});

// Template transformers
export const transformApiTemplateToTemplate = (apiTemplate: APITemplate): Template => ({
  id: apiTemplate.id,
  name: apiTemplate.name,
  description: apiTemplate.description,
  content: apiTemplate.content,
  category: apiTemplate.category,
  isActive: apiTemplate.isActive,
  createdAt: apiTemplate.createdAt,
  updatedAt: apiTemplate.updatedAt,
});

export const transformTemplateToApiTemplate = (template: Template): APITemplate => ({
  id: template.id,
  name: template.name,
  description: template.description,
  content: template.content,
  category: template.category,
  isActive: template.isActive,
  createdAt: template.createdAt,
  updatedAt: template.updatedAt,
});

// Compliance Record transformers
export const transformApiComplianceRecordToComplianceRecord = (apiRecord: APIComplianceRecord): ComplianceRecord => ({
  id: apiRecord.id,
  userId: apiRecord.userId,
  sopId: apiRecord.sopId,
  status: apiRecord.status,
  acknowledgedAt: apiRecord.acknowledgedAt,
  dueDate: apiRecord.dueDate,
  createdAt: apiRecord.createdAt,
  updatedAt: apiRecord.updatedAt,
});

export const transformComplianceRecordToApiComplianceRecord = (record: ComplianceRecord): APIComplianceRecord => ({
  id: record.id,
  userId: record.userId,
  sopId: record.sopId,
  status: record.status,
  acknowledgedAt: record.acknowledgedAt,
  dueDate: record.dueDate,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

// Batch transformers
export const transformApiUsersToUsers = (apiUsers: APIUser[]): User[] => 
  apiUsers.map(transformApiUserToUser);

export const transformApiSopsToSops = (apiSops: APISOP[]): SOP[] => 
  apiSops.map(transformApiSopToSop);

export const transformApiWorkingCopiesToWorkingCopies = (apiWorkingCopies: APIWorkingCopy[]): WorkingCopy[] => 
  apiWorkingCopies.map(transformApiWorkingCopyToWorkingCopy);

export const transformApiTemplatesToTemplates = (apiTemplates: APITemplate[]): Template[] => 
  apiTemplates.map(transformApiTemplateToTemplate);

export const transformApiComplianceRecordsToComplianceRecords = (apiRecords: APIComplianceRecord[]): ComplianceRecord[] => 
  apiRecords.map(transformApiComplianceRecordToComplianceRecord);

// Helper functions for date formatting
export const formatApiDate = (date: string): Date => new Date(date);
export const formatDateForApi = (date: Date): string => date.toISOString();

// Helper functions for status mapping
export const mapApiStatusToUIStatus = (status: string): string => {
  // Map API status values to UI-friendly labels
  const statusMap: Record<string, string> = {
    'pending_review': 'Pending Review',
    'in_progress': 'In Progress',
    'draft': 'Draft',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'archived': 'Archived',
    'acknowledged': 'Acknowledged',
    'overdue': 'Overdue',
  };
  
  return statusMap[status] || status;
};

export const mapUIStatusToApiStatus = (status: string): string => {
  // Map UI status labels back to API values
  const statusMap: Record<string, string> = {
    'Pending Review': 'pending_review',
    'In Progress': 'in_progress',
    'Draft': 'draft',
    'Approved': 'approved',
    'Rejected': 'rejected',
    'Archived': 'archived',
    'Acknowledged': 'acknowledged',
    'Overdue': 'overdue',
  };
  
  return statusMap[status] || status.toLowerCase().replace(' ', '_');
}; 