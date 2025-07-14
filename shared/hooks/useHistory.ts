import { useState, useEffect, useCallback, useMemo } from 'react';
import { HistoryService, AcknowledgmentRecord, HistoryStats, HistoryFilters } from '../services/historyService';

interface UseHistoryState {
  records: AcknowledgmentRecord[];
  filteredRecords: AcknowledgmentRecord[];
  stats: HistoryStats;
  departments: string[];
  loading: boolean;
  error: string | null;
  filters: HistoryFilters;
}

interface UseHistoryActions {
  setFilters: (filters: HistoryFilters) => void;
  clearFilters: () => void;
  refreshHistory: () => Promise<void>;
  generateReceipt: (record: AcknowledgmentRecord, userEmail: string) => string;
  downloadReceipt: (record: AcknowledgmentRecord, userEmail: string) => void;
}

export function useHistory(userId: string | null): UseHistoryState & UseHistoryActions {
  const [records, setRecords] = useState<AcknowledgmentRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    total: 0,
    acknowledged: 0,
    expired: 0,
    superseded: 0
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<HistoryFilters>({
    searchTerm: '',
    dateRange: 'all',
    documentType: 'all',
    department: 'all',
    status: 'all'
  });

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching history for user:', userId);
      console.log('Current filters:', filters);

      // Fetch records, stats, and departments in parallel
      const [recordsData, statsData, departmentsData] = await Promise.all([
        HistoryService.getEmployeeHistory(userId, filters),
        HistoryService.getEmployeeHistoryStats(userId),
        HistoryService.getHistoryDepartments(userId)
      ]);

      console.log('History data fetched:', {
        records: recordsData.length,
        stats: statsData,
        departments: departmentsData
      });

      setRecords(recordsData);
      setStats(statsData);
      setDepartments(departmentsData);

    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter records based on current filters
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.documentTitle.toLowerCase().includes(searchLower) ||
        record.department.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '6months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(record =>
        new Date(record.acknowledgedDate) >= filterDate
      );
    }

    // Document type filter
    if (filters.documentType && filters.documentType !== 'all') {
      filtered = filtered.filter(record => record.documentType === filters.documentType);
    }

    // Department filter
    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(record => record.department === filters.department);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    // Sort by acknowledged date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.acknowledgedDate).getTime() - new Date(a.acknowledgedDate).getTime()
    );
  }, [records, filters]);

  // Update filters
  const setFilters = useCallback((newFilters: HistoryFilters) => {
    console.log('Setting filters:', newFilters);
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    console.log('Clearing filters');
    setFiltersState({
      searchTerm: '',
      dateRange: 'all',
      documentType: 'all',
      department: 'all',
      status: 'all'
    });
  }, []);

  // Refresh history data
  const refreshHistory = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  // Generate receipt content
  const generateReceipt = useCallback((record: AcknowledgmentRecord, userEmail: string): string => {
    return HistoryService.generateReceiptContent(record, userEmail);
  }, []);

  // Download receipt
  const downloadReceipt = useCallback((record: AcknowledgmentRecord, userEmail: string) => {
    try {
      const receiptContent = generateReceipt(record, userEmail);
      
      const blob = new Blob([receiptContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acknowledgment-receipt-${record.receiptId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Receipt downloaded for:', record.receiptId);
    } catch (err) {
      console.error('Error downloading receipt:', err);
    }
  }, [generateReceipt]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.searchTerm ||
      filters.dateRange !== 'all' ||
      filters.documentType !== 'all' ||
      filters.department !== 'all' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    // State
    records,
    filteredRecords,
    stats,
    departments,
    loading,
    error,
    filters,
    hasActiveFilters,
    
    // Actions
    setFilters,
    clearFilters,
    refreshHistory,
    generateReceipt,
    downloadReceipt
  };
} 