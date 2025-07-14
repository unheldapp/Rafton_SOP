import { supabase } from './supabase';
import { DatabaseSop, DatabaseUser } from '../types/database';

export interface EmployeeDocument {
  id: string;
  title: string;
  description: string | null;
  content: string;
  version: string;
  department: string | null;
  type: 'SOP' | 'Policy' | 'Training' | 'Procedure' | 'Manual' | 'Guideline';
  lastUpdated: string;
  publishedAt: string | null;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  tags: string[];
  status: 'published' | 'archived';
  category: string;
  fileSize?: string;
  downloadUrl?: string;
  viewCount: number;
  downloadCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expiresAt: string | null;
  nextReviewDate: string | null;
}

export interface DocumentStats {
  total: number;
  byDepartment: Record<string, number>;
  byType: Record<string, number>;
  recent: number;
  expiringSoon: number;
}

export class DocumentService {
  /**
   * Get all published documents accessible to employees
   */
  static async getPublishedDocuments(companyId: string): Promise<EmployeeDocument[]> {
    try {
      console.log('DocumentService.getPublishedDocuments: Fetching documents for company:', companyId);

      const { data: documents, error } = await supabase
        .from('sops')
        .select(`
          id,
          title,
          description,
          content,
          version,
          department,
          document_type,
          tags,
          status,
          priority,
          view_count,
          download_count,
          expires_at,
          next_review_date,
          published_at,
          updated_at,
          document_url,
          file_size,
          author:users!author_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'published')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('DocumentService.getPublishedDocuments: Database error:', error);
        throw error;
      }

      if (!documents) {
        console.log('DocumentService.getPublishedDocuments: No documents found');
        return [];
      }

      console.log('DocumentService.getPublishedDocuments: Raw documents:', documents);

      // Transform the data to match the expected interface
      const transformedDocuments: EmployeeDocument[] = documents.map(doc => {
        const author = doc.author as any;

        // Map document_type to our type enum
        const getDocumentType = (docType: string | null): 'SOP' | 'Policy' | 'Training' | 'Procedure' | 'Manual' | 'Guideline' => {
          if (!docType) return 'SOP';
          switch (docType.toLowerCase()) {
            case 'policy': return 'Policy';
            case 'training': return 'Training';
            case 'procedure': return 'Procedure';
            case 'manual': return 'Manual';
            case 'guideline': return 'Guideline';
            default: return 'SOP';
          }
        };

        // Generate category based on department and type
        const getCategory = (department: string | null, type: string): string => {
          if (department && type) {
            return `${department} ${type}s`;
          }
          return type || 'General';
        };

        // Format file size
        const formatFileSize = (size: number | null): string | undefined => {
          if (!size) return undefined;
          if (size < 1024) return `${size} B`;
          if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
          return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        };

        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          content: doc.content,
          version: doc.version,
          department: doc.department,
          type: getDocumentType(doc.document_type),
          lastUpdated: doc.updated_at,
          publishedAt: doc.published_at,
          author: {
            id: author?.id || '',
            firstName: author?.first_name || '',
            lastName: author?.last_name || '',
            email: author?.email || ''
          },
          tags: doc.tags || [],
          status: doc.status as 'published' | 'archived',
          category: getCategory(doc.department, getDocumentType(doc.document_type)),
          fileSize: formatFileSize(doc.file_size),
          downloadUrl: doc.document_url,
          viewCount: doc.view_count || 0,
          downloadCount: doc.download_count || 0,
          priority: doc.priority as 'low' | 'medium' | 'high' | 'critical',
          expiresAt: doc.expires_at,
          nextReviewDate: doc.next_review_date
        };
      });

      console.log('DocumentService.getPublishedDocuments: Transformed documents:', transformedDocuments);
      return transformedDocuments;
    } catch (error) {
      console.error('DocumentService.getPublishedDocuments: Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Get document statistics for the company
   */
  static async getDocumentStats(companyId: string): Promise<DocumentStats> {
    try {
      console.log('DocumentService.getDocumentStats: Fetching stats for company:', companyId);

      const { data: documents, error } = await supabase
        .from('sops')
        .select(`
          id,
          department,
          document_type,
          updated_at,
          expires_at,
          next_review_date
        `)
        .eq('company_id', companyId)
        .eq('status', 'published');

      if (error) {
        console.error('DocumentService.getDocumentStats: Database error:', error);
        throw error;
      }

      if (!documents) {
        return {
          total: 0,
          byDepartment: {},
          byType: {},
          recent: 0,
          expiringSoon: 0
        };
      }

      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const stats: DocumentStats = {
        total: documents.length,
        byDepartment: {},
        byType: {},
        recent: 0,
        expiringSoon: 0
      };

      documents.forEach(doc => {
        // Count by department
        const dept = doc.department || 'General';
        stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;

        // Count by type
        const type = doc.document_type || 'SOP';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Count recent documents (updated in last 30 days)
        if (doc.updated_at && new Date(doc.updated_at) >= thirtyDaysAgo) {
          stats.recent++;
        }

        // Count expiring soon (next review or expiration in next 30 days)
        const expiresAt = doc.expires_at ? new Date(doc.expires_at) : null;
        const nextReviewDate = doc.next_review_date ? new Date(doc.next_review_date) : null;
        
        if ((expiresAt && expiresAt <= thirtyDaysFromNow) || 
            (nextReviewDate && nextReviewDate <= thirtyDaysFromNow)) {
          stats.expiringSoon++;
        }
      });

      console.log('DocumentService.getDocumentStats: Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('DocumentService.getDocumentStats: Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Increment view count for a document
   */
  static async incrementViewCount(documentId: string): Promise<void> {
    try {
      console.log('DocumentService.incrementViewCount: Incrementing view count for document:', documentId);

      const { error } = await supabase
        .from('sops')
        .update({
          view_count: supabase.raw('view_count + 1')
        })
        .eq('id', documentId);

      if (error) {
        console.error('DocumentService.incrementViewCount: Database error:', error);
        throw error;
      }

      console.log('DocumentService.incrementViewCount: Successfully incremented view count');
    } catch (error) {
      console.error('DocumentService.incrementViewCount: Error incrementing view count:', error);
      throw error;
    }
  }

  /**
   * Increment download count for a document
   */
  static async incrementDownloadCount(documentId: string): Promise<void> {
    try {
      console.log('DocumentService.incrementDownloadCount: Incrementing download count for document:', documentId);

      const { error } = await supabase
        .from('sops')
        .update({
          download_count: supabase.raw('download_count + 1')
        })
        .eq('id', documentId);

      if (error) {
        console.error('DocumentService.incrementDownloadCount: Database error:', error);
        throw error;
      }

      console.log('DocumentService.incrementDownloadCount: Successfully incremented download count');
    } catch (error) {
      console.error('DocumentService.incrementDownloadCount: Error incrementing download count:', error);
      throw error;
    }
  }

  /**
   * Search documents by query
   */
  static async searchDocuments(companyId: string, query: string): Promise<EmployeeDocument[]> {
    try {
      console.log('DocumentService.searchDocuments: Searching documents for query:', query);

      const { data: documents, error } = await supabase
        .from('sops')
        .select(`
          id,
          title,
          description,
          content,
          version,
          department,
          document_type,
          tags,
          status,
          priority,
          view_count,
          download_count,
          expires_at,
          next_review_date,
          published_at,
          updated_at,
          document_url,
          file_size,
          author:users!author_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('company_id', companyId)
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('DocumentService.searchDocuments: Database error:', error);
        throw error;
      }

      if (!documents) {
        return [];
      }

      // Transform the data (reuse the transformation logic from getPublishedDocuments)
      const transformedDocuments: EmployeeDocument[] = documents.map(doc => {
        const author = doc.author as any;

        const getDocumentType = (docType: string | null): 'SOP' | 'Policy' | 'Training' | 'Procedure' | 'Manual' | 'Guideline' => {
          if (!docType) return 'SOP';
          switch (docType.toLowerCase()) {
            case 'policy': return 'Policy';
            case 'training': return 'Training';
            case 'procedure': return 'Procedure';
            case 'manual': return 'Manual';
            case 'guideline': return 'Guideline';
            default: return 'SOP';
          }
        };

        const getCategory = (department: string | null, type: string): string => {
          if (department && type) {
            return `${department} ${type}s`;
          }
          return type || 'General';
        };

        const formatFileSize = (size: number | null): string | undefined => {
          if (!size) return undefined;
          if (size < 1024) return `${size} B`;
          if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
          return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        };

        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          content: doc.content,
          version: doc.version,
          department: doc.department,
          type: getDocumentType(doc.document_type),
          lastUpdated: doc.updated_at,
          publishedAt: doc.published_at,
          author: {
            id: author?.id || '',
            firstName: author?.first_name || '',
            lastName: author?.last_name || '',
            email: author?.email || ''
          },
          tags: doc.tags || [],
          status: doc.status as 'published' | 'archived',
          category: getCategory(doc.department, getDocumentType(doc.document_type)),
          fileSize: formatFileSize(doc.file_size),
          downloadUrl: doc.document_url,
          viewCount: doc.view_count || 0,
          downloadCount: doc.download_count || 0,
          priority: doc.priority as 'low' | 'medium' | 'high' | 'critical',
          expiresAt: doc.expires_at,
          nextReviewDate: doc.next_review_date
        };
      });

      console.log('DocumentService.searchDocuments: Found documents:', transformedDocuments);
      return transformedDocuments;
    } catch (error) {
      console.error('DocumentService.searchDocuments: Error searching documents:', error);
      throw error;
    }
  }
} 