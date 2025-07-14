import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  WorkingCopyService, 
  WorkingCopy, 
  WorkingCopyReview,
  CreateWorkingCopyData,
  UpdateWorkingCopyData,
  SubmitForReviewData
} from '../services/workingCopyService';

export interface UseWorkingCopiesReturn {
  workingCopies: WorkingCopy[];
  pendingReviews: WorkingCopy[];
  currentWorkingCopy: WorkingCopy | null;
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createWorkingCopy: (data: CreateWorkingCopyData) => Promise<WorkingCopy>;
  updateWorkingCopy: (id: string, data: UpdateWorkingCopyData) => Promise<WorkingCopy>;
  deleteWorkingCopy: (id: string) => Promise<void>;
  
  // Fetching operations
  fetchUserWorkingCopies: () => Promise<void>;
  fetchWorkingCopyById: (id: string) => Promise<WorkingCopy | null>;
  fetchSOPWorkingCopies: (sopId: string) => Promise<WorkingCopy[]>;
  fetchPendingReviews: () => Promise<void>;
  
  // Review operations
  submitForReview: (id: string, data: SubmitForReviewData) => Promise<WorkingCopy>;
  reviewWorkingCopy: (workingCopyId: string, reviewId: string, status: 'approved' | 'rejected' | 'changes_requested', comments?: string) => Promise<WorkingCopyReview>;
  mergeWorkingCopy: (id: string) => Promise<void>;
  
  // Utility functions
  clearError: () => void;
  setCurrentWorkingCopy: (workingCopy: WorkingCopy | null) => void;
}

export function useWorkingCopies(): UseWorkingCopiesReturn {
  const [workingCopies, setWorkingCopies] = useState<WorkingCopy[]>([]);
  const [pendingReviews, setPendingReviews] = useState<WorkingCopy[]>([]);
  const [currentWorkingCopy, setCurrentWorkingCopy] = useState<WorkingCopy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: any, defaultMessage: string) => {
    console.error('Working copy error:', error);
    const message = error?.message || defaultMessage;
    setError(message);
    toast.error(message);
  }, []);

  const createWorkingCopy = useCallback(async (data: CreateWorkingCopyData): Promise<WorkingCopy> => {
    setLoading(true);
    setError(null);
    
    try {
      const workingCopy = await WorkingCopyService.createWorkingCopy(data);
      setWorkingCopies(prev => [workingCopy, ...prev]);
      toast.success('Working copy created successfully');
      return workingCopy;
    } catch (err) {
      handleError(err, 'Failed to create working copy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateWorkingCopy = useCallback(async (id: string, data: UpdateWorkingCopyData): Promise<WorkingCopy> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedWorkingCopy = await WorkingCopyService.updateWorkingCopy(id, data);
      
      // Update in the list
      setWorkingCopies(prev => 
        prev.map(wc => wc.id === id ? updatedWorkingCopy : wc)
      );
      
      // Update current working copy if it's the same
      if (currentWorkingCopy?.id === id) {
        setCurrentWorkingCopy(updatedWorkingCopy);
      }
      
      return updatedWorkingCopy;
    } catch (err) {
      handleError(err, 'Failed to update working copy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, currentWorkingCopy]);

  const deleteWorkingCopy = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await WorkingCopyService.deleteWorkingCopy(id);
      
      // Remove from the list
      setWorkingCopies(prev => prev.filter(wc => wc.id !== id));
      
      // Clear current working copy if it's the same
      if (currentWorkingCopy?.id === id) {
        setCurrentWorkingCopy(null);
      }
      
      toast.success('Working copy deleted successfully');
    } catch (err) {
      handleError(err, 'Failed to delete working copy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, currentWorkingCopy]);

  const fetchUserWorkingCopies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const copies = await WorkingCopyService.getUserWorkingCopies();
      setWorkingCopies(copies);
    } catch (err) {
      handleError(err, 'Failed to fetch working copies');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchWorkingCopyById = useCallback(async (id: string): Promise<WorkingCopy | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const workingCopy = await WorkingCopyService.getWorkingCopyById(id);
      setCurrentWorkingCopy(workingCopy);
      return workingCopy;
    } catch (err) {
      handleError(err, 'Failed to fetch working copy');
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchSOPWorkingCopies = useCallback(async (sopId: string): Promise<WorkingCopy[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const copies = await WorkingCopyService.getSOPWorkingCopies(sopId);
      return copies;
    } catch (err) {
      handleError(err, 'Failed to fetch SOP working copies');
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchPendingReviews = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const reviews = await WorkingCopyService.getPendingWorkingCopies();
      setPendingReviews(reviews);
    } catch (err) {
      handleError(err, 'Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const submitForReview = useCallback(async (id: string, data: SubmitForReviewData): Promise<WorkingCopy> => {
    setLoading(true);
    setError(null);
    
    try {
      const submittedCopy = await WorkingCopyService.submitForReview(id, data);
      
      // Update in the list
      setWorkingCopies(prev => 
        prev.map(wc => wc.id === id ? submittedCopy : wc)
      );
      
      // Update current working copy if it's the same
      if (currentWorkingCopy?.id === id) {
        setCurrentWorkingCopy(submittedCopy);
      }
      
      toast.success('Working copy submitted for review');
      return submittedCopy;
    } catch (err) {
      handleError(err, 'Failed to submit for review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, currentWorkingCopy]);

  const reviewWorkingCopy = useCallback(async (
    workingCopyId: string, 
    reviewId: string, 
    status: 'approved' | 'rejected' | 'changes_requested', 
    comments?: string
  ): Promise<WorkingCopyReview> => {
    setLoading(true);
    setError(null);
    
    try {
      const review = await WorkingCopyService.reviewWorkingCopy(workingCopyId, reviewId, status, comments);
      
      // Update pending reviews
      setPendingReviews(prev => 
        prev.map(pr => {
          if (pr.id === workingCopyId) {
            return {
              ...pr,
              reviews: pr.reviews?.map(r => r.id === reviewId ? review : r) || [review]
            };
          }
          return pr;
        })
      );
      
      const statusMessage = status === 'approved' ? 'approved' : 
                           status === 'rejected' ? 'rejected' : 
                           'marked for changes';
      
      toast.success(`Working copy ${statusMessage} successfully`);
      return review;
    } catch (err) {
      handleError(err, 'Failed to review working copy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const mergeWorkingCopy = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await WorkingCopyService.mergeWorkingCopy(id);
      
      // Remove from pending reviews
      setPendingReviews(prev => prev.filter(pr => pr.id !== id));
      
      // Remove from user's working copies
      setWorkingCopies(prev => prev.filter(wc => wc.id !== id));
      
      toast.success('Working copy merged successfully');
    } catch (err) {
      handleError(err, 'Failed to merge working copy');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    workingCopies,
    pendingReviews,
    currentWorkingCopy,
    loading,
    error,
    
    // CRUD operations
    createWorkingCopy,
    updateWorkingCopy,
    deleteWorkingCopy,
    
    // Fetching operations
    fetchUserWorkingCopies,
    fetchWorkingCopyById,
    fetchSOPWorkingCopies,
    fetchPendingReviews,
    
    // Review operations
    submitForReview,
    reviewWorkingCopy,
    mergeWorkingCopy,
    
    // Utility functions
    clearError,
    setCurrentWorkingCopy
  };
} 