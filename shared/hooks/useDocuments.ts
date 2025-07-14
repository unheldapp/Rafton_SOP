import { useState, useEffect } from 'react';
import { DocumentService, EmployeeDocument, DocumentStats } from '../services/documentService';

export interface UseDocumentsResult {
  documents: EmployeeDocument[];
  loading: boolean;
  error: string | null;
  stats: DocumentStats;
  refreshDocuments: () => Promise<void>;
  searchDocuments: (query: string) => Promise<EmployeeDocument[]>;
  incrementViewCount: (documentId: string) => Promise<void>;
  incrementDownloadCount: (documentId: string) => Promise<void>;
}

export function useDocuments(companyId: string): UseDocumentsResult {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    byDepartment: {},
    byType: {},
    recent: 0,
    expiringSoon: 0
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useDocuments: Fetching documents for company:', companyId);
      
      const [documentsData, statsData] = await Promise.all([
        DocumentService.getPublishedDocuments(companyId),
        DocumentService.getDocumentStats(companyId)
      ]);

      setDocuments(documentsData);
      setStats(statsData);
      
      console.log('useDocuments: Successfully loaded documents:', documentsData);
      console.log('useDocuments: Stats:', statsData);
    } catch (err) {
      console.error('useDocuments: Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const refreshDocuments = async () => {
    await fetchDocuments();
  };

  const searchDocuments = async (query: string): Promise<EmployeeDocument[]> => {
    try {
      console.log('useDocuments: Searching documents with query:', query);
      
      if (!query.trim()) {
        return documents;
      }

      const searchResults = await DocumentService.searchDocuments(companyId, query);
      console.log('useDocuments: Search results:', searchResults);
      
      return searchResults;
    } catch (err) {
      console.error('useDocuments: Error searching documents:', err);
      throw err;
    }
  };

  const incrementViewCount = async (documentId: string) => {
    try {
      console.log('useDocuments: Incrementing view count for document:', documentId);
      
      await DocumentService.incrementViewCount(documentId);
      
      // Update local state optimistically
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => 
          doc.id === documentId 
            ? { ...doc, viewCount: doc.viewCount + 1 }
            : doc
        )
      );

      console.log('useDocuments: Successfully incremented view count');
    } catch (err) {
      console.error('useDocuments: Error incrementing view count:', err);
      throw err;
    }
  };

  const incrementDownloadCount = async (documentId: string) => {
    try {
      console.log('useDocuments: Incrementing download count for document:', documentId);
      
      await DocumentService.incrementDownloadCount(documentId);
      
      // Update local state optimistically
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => 
          doc.id === documentId 
            ? { ...doc, downloadCount: doc.downloadCount + 1 }
            : doc
        )
      );

      console.log('useDocuments: Successfully incremented download count');
    } catch (err) {
      console.error('useDocuments: Error incrementing download count:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchDocuments();
    } else {
      // If no companyId, set loading to false to prevent perpetual loading
      console.log('useDocuments: No companyId provided, setting loading to false');
      setLoading(false);
    }
  }, [companyId]);

  return {
    documents,
    loading,
    error,
    stats,
    refreshDocuments,
    searchDocuments,
    incrementViewCount,
    incrementDownloadCount
  };
} 