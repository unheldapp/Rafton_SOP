import { useState, useEffect, useCallback } from 'react';
import { reportService, ReportType, ReportFilters, PaginationParams } from '../services/reportService';
import { useAuth } from '../context/AuthContext';

export interface UseReportsReturn {
  data: any[];
  total: number;
  stats: any;
  loading: boolean;
  error: string | null;
  filters: ReportFilters;
  pagination: PaginationParams;
  setFilters: (filters: ReportFilters) => void;
  setPagination: (pagination: PaginationParams) => void;
  refreshData: () => Promise<void>;
  exportReport: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
}

export function useReports(reportType: ReportType): UseReportsReturn {
  const { currentUser } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'last-30-days',
    status: 'all',
    department: 'all',
    priority: 'all',
    documentType: 'all',
    user: 'all'
  });

  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    itemsPerPage: 10,
    search: ''
  });

  const fetchData = useCallback(async () => {
    if (!currentUser?.company_id) {
      console.log('useReports: No company_id found, skipping fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log(`useReports: Fetching ${reportType} report for company:`, currentUser.company_id);
    console.log('useReports: Filters:', filters);
    console.log('useReports: Pagination:', pagination);
    
    try {
      let result;
      switch (reportType) {
        case 'acknowledgment':
          console.log('useReports: Calling getAcknowledgmentReport...');
          result = await reportService.getAcknowledgmentReport(
            currentUser.company_id,
            filters,
            pagination
          );
          break;
        case 'sop-review':
          console.log('useReports: Calling getSOPReviewReport...');
          result = await reportService.getSOPReviewReport(
            currentUser.company_id,
            filters,
            pagination
          );
          break;
        case 'user-activity':
          console.log('useReports: Calling getUserActivityReport...');
          result = await reportService.getUserActivityReport(
            currentUser.company_id,
            filters,
            pagination
          );
          break;
        case 'compliance-summary':
          console.log('useReports: Calling getComplianceSummaryReport...');
          result = await reportService.getComplianceSummaryReport(
            currentUser.company_id,
            filters,
            pagination
          );
          break;
        case 'audit-trail':
          console.log('useReports: Calling getAuditTrailReport...');
          result = await reportService.getAuditTrailReport(
            currentUser.company_id,
            filters,
            pagination
          );
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      console.log(`useReports: ${reportType} result:`, result);
      setData(result.data);
      setTotal(result.total);
      setStats(result.stats);
    } catch (err) {
      console.error('useReports: Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.company_id, reportType, filters, pagination]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const exportReport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (!currentUser?.company_id) return;
    
    try {
      setLoading(true);
      const blob = await reportService.exportReport(
        reportType,
        currentUser.company_id,
        filters,
        format
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.company_id, reportType, filters]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Custom setter for filters that resets pagination
  const setFiltersAndResetPagination = useCallback((newFilters: ReportFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Custom setter for pagination that handles search
  const setPaginationAndSearch = useCallback((newPagination: PaginationParams) => {
    setPagination(prev => {
      // Reset page when search changes
      if (prev.search !== newPagination.search) {
        return { ...newPagination, page: 1 };
      }
      return newPagination;
    });
  }, []);

  return {
    data,
    total,
    stats,
    loading,
    error,
    filters,
    pagination,
    setFilters: setFiltersAndResetPagination,
    setPagination: setPaginationAndSearch,
    refreshData,
    exportReport
  };
} 