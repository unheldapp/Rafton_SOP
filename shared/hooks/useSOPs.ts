import { useState, useEffect, useCallback } from 'react';
import { SOPService, SOPWithDetails, SOPListResponse, SOPFilters, CreateSOPData, FolderWithSOPCount } from '../services/sopService';
import { DatabaseSopAssignment, DatabaseFileAttachment } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

interface UseSOPsState {
  sops: SOPWithDetails[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

interface UseSOPsActions {
  fetchSOPs: (options?: {
    page?: number;
    limit?: number;
    filters?: SOPFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  createSOP: (data: CreateSOPData) => Promise<SOPWithDetails>;
  updateSOP: (id: string, data: Partial<CreateSOPData>) => Promise<SOPWithDetails>;
  deleteSOP: (id: string) => Promise<void>;
  publishSOP: (id: string) => Promise<SOPWithDetails>;
  uploadSOPFile: (file: File, sopId: string) => Promise<DatabaseFileAttachment>;
  refreshSOPs: () => Promise<void>;
}

export function useSOPs(): UseSOPsState & UseSOPsActions {
  const { currentUser } = useAuth();
  const [state, setState] = useState<UseSOPsState>({
    sops: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    limit: 20
  });

  const [lastFetchOptions, setLastFetchOptions] = useState<any>(null);
  const [isAssignmentInProgress, setIsAssignmentInProgress] = useState(false);

  const fetchSOPs = useCallback(async (options = {}) => {
    if (!currentUser) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastFetchOptions(options);

    try {
      const result = await SOPService.getSOPs(options);
      setState(prev => ({
        ...prev,
        sops: result.sops,
        total: result.total,
        page: result.page,
        limit: result.limit,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching SOPs:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch SOPs',
        loading: false
      }));
    }
  }, [currentUser]);

  const createSOP = useCallback(async (data: CreateSOPData): Promise<SOPWithDetails> => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const sop = await SOPService.createSOP(data, currentUser.id);
      
      // Refresh SOPs list
      await refreshSOPs();
      
      return sop;
    } catch (error) {
      console.error('Error creating SOP:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create SOP',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const updateSOP = useCallback(async (id: string, data: Partial<CreateSOPData>): Promise<SOPWithDetails> => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const sop = await SOPService.updateSOP(id, data, currentUser.id);
      
      // Update the SOP in the current list
      setState(prev => ({
        ...prev,
        sops: prev.sops.map(s => s.id === id ? sop : s),
        loading: false
      }));
      
      return sop;
    } catch (error) {
      console.error('Error updating SOP:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update SOP',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const deleteSOP = useCallback(async (id: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await SOPService.deleteSOP(id, currentUser.id);
      
      // Remove from current list
      setState(prev => ({
        ...prev,
        sops: prev.sops.filter(s => s.id !== id),
        total: prev.total - 1,
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting SOP:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete SOP',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const publishSOP = useCallback(async (id: string): Promise<SOPWithDetails> => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const sop = await SOPService.publishSOP(id, currentUser.id);
      
      // Update the SOP in the current list
      setState(prev => ({
        ...prev,
        sops: prev.sops.map(s => s.id === id ? sop : s),
        loading: false
      }));
      
      return sop;
    } catch (error) {
      console.error('Error publishing SOP:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to publish SOP',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const uploadSOPFile = useCallback(async (file: File, sopId: string): Promise<DatabaseFileAttachment> => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const attachment = await SOPService.uploadSOPFile(file, sopId, currentUser.id);
      return attachment;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }, [currentUser]);

  const refreshSOPs = useCallback(async () => {
    // Always use the lastFetchOptions to maintain current filters and context
    if (lastFetchOptions) {
      await fetchSOPs(lastFetchOptions);
    }
    // Don't refresh without proper context - this would break folder filtering
  }, [fetchSOPs, lastFetchOptions]);

  // Real-time subscriptions for SOPs
  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to SOP changes
    const subscription = supabase
      .channel('sops_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sops',
          filter: `company_id=eq.${currentUser.company?.id}`
        }, 
        (payload) => {
          // Only refresh if we have proper context AND no assignment is in progress
          if (lastFetchOptions && !isAssignmentInProgress) {
            console.log('SOPs real-time subscription: Refreshing with proper context');
            refreshSOPs();
          } else {
            console.log('SOPs real-time subscription: Skipping refresh (assignment in progress or no context)');
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, refreshSOPs, lastFetchOptions, isAssignmentInProgress]);

  // Initial fetch - disabled because it interferes with folder filtering
  // The SOPsPage component handles the initial fetch with proper folder context
  // useEffect(() => {
  //   if (currentUser) {
  //     fetchSOPs();
  //   }
  // }, [currentUser, fetchSOPs]);

  // Expose assignment control to other hooks
  const setAssignmentInProgress = useCallback((inProgress: boolean) => {
    setIsAssignmentInProgress(inProgress);
  }, []);

  return {
    sops: state.sops,
    loading: state.loading,
    error: state.error,
    total: state.total,
    currentPage: state.page,
    
    // Core SOP operations
    fetchSOPs,
    createSOP,
    updateSOP,
    deleteSOP,
    publishSOP,
    
    // File operations
    uploadSOPFile,
    
    // Assignment operations
    assignSOPToUsers: () => Promise.resolve(),
    getSOPAssignments: () => Promise.resolve([]),
    
    // Collaboration features
    getCollaborators: SOPService.getCollaborators,
    addCollaborator: SOPService.addCollaborator,
    
    // Comments system
    getComments: SOPService.getComments,
    addComment: SOPService.addComment,
    resolveComment: SOPService.resolveComment,
    
    // Version control
    getVersionHistory: SOPService.getVersionHistory,
    createVersion: SOPService.createVersion,
    
    // Real-time features
    subscribeToSOPChanges: SOPService.subscribeToSOPChanges,
    updateCollaborationStatus: SOPService.updateCollaborationStatus,
    
    // Assignment control
    setAssignmentInProgress,
    
    // Utility functions
    refetch: fetchSOPs,
    setCurrentPage: (page: number) => setState(prev => ({ ...prev, page })),
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}

// Hook for managing SOP folders
interface UseFoldersState {
  folders: FolderWithSOPCount[];
  loading: boolean;
  error: string | null;
}

interface UseFoldersActions {
  fetchFolders: (parentId?: string | null) => Promise<void>;
  createFolder: (data: {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
  }) => Promise<void>;
  updateFolder: (id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  refreshFolders: () => Promise<void>;
}

export function useFolders(): UseFoldersState & UseFoldersActions {
  const { currentUser } = useAuth();
  const [state, setState] = useState<UseFoldersState>({
    folders: [],
    loading: true,
    error: null
  });

  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  const fetchFolders = useCallback(async (parentId: string | null = null) => {
    if (!currentUser) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    setCurrentParentId(parentId);

    try {
      const folders = await SOPService.getFolders(parentId);
      setState(prev => ({
        ...prev,
        folders,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching folders:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch folders',
        loading: false
      }));
    }
  }, [currentUser]);

  const createFolder = useCallback(async (data: {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
  }) => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await SOPService.createFolder(data, currentUser.id);
      await refreshFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create folder',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const updateFolder = useCallback(async (id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await SOPService.updateFolder(id, data, currentUser.id);
      await refreshFolders();
    } catch (error) {
      console.error('Error updating folder:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update folder',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const deleteFolder = useCallback(async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await SOPService.deleteFolder(id, currentUser.id);
      await refreshFolders();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete folder',
        loading: false
      }));
      throw error;
    }
  }, [currentUser]);

  const refreshFolders = useCallback(async () => {
    await fetchFolders(currentParentId);
  }, [fetchFolders, currentParentId]);

  useEffect(() => {
    if (currentUser) {
      fetchFolders();
    }
  }, [currentUser, fetchFolders]);

  return {
    ...state,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshFolders
  };
}

// Hook for managing SOP assignments
interface UseAssignmentsState {
  assignments: any[];
  loading: boolean;
  error: string | null;
}

interface UseAssignmentsActions {
  fetchAssignments: (sopId: string) => Promise<void>;
  assignSOPToUsers: (sopId: string, userIds: string[], options?: {
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
  }) => Promise<void>;
  refreshAssignments: (sopId: string) => Promise<void>;
}

export function useAssignments(): UseAssignmentsState & UseAssignmentsActions {
  const { currentUser } = useAuth();
  const { setAssignmentInProgress } = useSOPs();
  const [state, setState] = useState<UseAssignmentsState>({
    assignments: [],
    loading: false,
    error: null
  });

  const fetchAssignments = useCallback(async (sopId: string) => {
    if (!currentUser) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const assignments = await SOPService.getSOPAssignments(sopId);
      setState(prev => ({
        ...prev,
        assignments,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch assignments',
        loading: false
      }));
    }
  }, [currentUser]);

  const assignSOPToUsers = useCallback(async (sopId: string, userIds: string[], options = {}) => {
    if (!currentUser) throw new Error('User not authenticated');

    console.log('useAssignments: Starting assignment process');
    console.log('useAssignments: SOP ID:', sopId);
    console.log('useAssignments: User IDs:', userIds);
    console.log('useAssignments: Current user ID:', currentUser.id);
    console.log('useAssignments: Options:', options);

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    // Temporarily disable real-time subscription to prevent folder filtering interference
    setAssignmentInProgress(true);

    try {
      console.log('useAssignments: Calling SOPService.assignSOPToUsers');
      await SOPService.assignSOPToUsers(sopId, userIds, currentUser.id, options);
      console.log('useAssignments: Assignment service call successful');
      
      console.log('useAssignments: Fetching updated assignments');
      await fetchAssignments(sopId);
      console.log('useAssignments: Assignment process completed successfully');
    } catch (error) {
      console.error('useAssignments: Error assigning SOP:', error);
      console.error('useAssignments: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to assign SOP',
        loading: false
      }));
      throw error;
    } finally {
      // Re-enable real-time subscription after a short delay
      setTimeout(() => {
        setAssignmentInProgress(false);
        console.log('useAssignments: Real-time subscription re-enabled');
      }, 1000);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [currentUser, fetchAssignments, setAssignmentInProgress]);

  const refreshAssignments = useCallback(async (sopId: string) => {
    await fetchAssignments(sopId);
  }, [fetchAssignments]);

  return {
    ...state,
    fetchAssignments,
    assignSOPToUsers,
    refreshAssignments
  };
}

// Hook for a single SOP with detailed information
export function useSOPDetail(sopId: string | null) {
  const { currentUser } = useAuth();
  const [state, setState] = useState<{
    sop: SOPWithDetails | null;
    loading: boolean;
    error: string | null;
  }>({
    sop: null,
    loading: false,
    error: null
  });

  const fetchSOP = useCallback(async () => {
    if (!sopId || !currentUser) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const sop = await SOPService.getSOPById(sopId);
      setState(prev => ({
        ...prev,
        sop,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching SOP details:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch SOP details',
        loading: false
      }));
    }
  }, [sopId, currentUser]);

  useEffect(() => {
    if (sopId && currentUser) {
      fetchSOP();
    }
  }, [sopId, currentUser, fetchSOP]);

  return {
    ...state,
    refetch: fetchSOP
  };
} 