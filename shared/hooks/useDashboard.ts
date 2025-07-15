import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { SOPService } from '../services/sopService';
import { AcknowledgmentService } from '../services/acknowledgmentService';
import { SettingsService } from '../services/settingsService';
import { ReportService } from '../services/reportService';

export interface DashboardStats {
  // SOP Statistics
  totalSOPs: number;
  publishedSOPs: number;
  draftSOPs: number;
  pendingReviewSOPs: number;
  sopsExpiringSoon: number;
  
  // Acknowledgment Statistics
  totalAcknowledgments: number;
  pendingAcknowledgments: number;
  acknowledgedCount: number;
  overdueAcknowledgments: number;
  
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  
  // Compliance Rate
  overallComplianceRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentSOPs: any[];
  upcomingDeadlines: any[];
  acknowledgmentTrend: any[];
  complianceByDepartment: any[];
  auditLogEvents: any[];
  sopReviewPipeline: any[];
}

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const settingsService = new SettingsService();
const reportService = new ReportService();

export function useDashboard(): UseDashboardReturn {
  const { currentUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.company?.id) {
      console.log('useDashboard: No company ID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('useDashboard: Fetching dashboard data for company:', currentUser.company.id);

      // Fetch all data in parallel for better performance
      const [
        sopsResponse,
        acknowledgmentStats,
        companyUsers,
        recentAuditLogs,
        complianceReport
      ] = await Promise.all([
        // Get SOPs data
        SOPService.getSOPs({
          page: 1,
          limit: 100, // Get more to calculate stats
          sortBy: 'updated_at',
          sortOrder: 'desc'
        }),
        
        // Get acknowledgment statistics
        AcknowledgmentService.getAcknowledgmentStats(),
        
        // Get company users
        settingsService.getCompanyUsers(currentUser.company.id),
        
        // Get recent audit logs
        settingsService.getAuditLogs(currentUser.company.id, {
          page: 1,
          limit: 10
        }),
        
        // Get compliance summary
        reportService.getComplianceSummaryReport(
          currentUser.company.id,
          { dateRange: 'last-30-days', status: 'all', department: 'all', priority: 'all' },
          { page: 1, itemsPerPage: 20, search: '' }
        )
      ]);

      console.log('useDashboard: Raw data fetched:', {
        sopsCount: sopsResponse.sops.length,
        acknowledgmentStats,
        usersCount: companyUsers.length,
        auditLogsCount: recentAuditLogs.length,
        complianceDataCount: complianceReport.data.length
      });

      // Process SOPs data
      const allSOPs = sopsResponse.sops;
      const publishedSOPs = allSOPs.filter(sop => sop.status === 'published');
      const draftSOPs = allSOPs.filter(sop => sop.status === 'draft');
      const pendingReviewSOPs = allSOPs.filter(sop => sop.status === 'pending-review');
      
      // Calculate SOPs expiring soon (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const sopsExpiringSoon = publishedSOPs.filter(sop => {
        if (!sop.next_review_date) return false;
        const reviewDate = new Date(sop.next_review_date);
        return reviewDate <= thirtyDaysFromNow && reviewDate >= new Date();
      }).length;

      // Get recent SOPs (last 10 updated)
      const recentSOPs = allSOPs.slice(0, 10);

      // Process acknowledgment data
      const totalAcknowledgments = acknowledgmentStats.total;
      const pendingAcknowledgments = acknowledgmentStats.pending;
      const acknowledgedCount = acknowledgmentStats.acknowledged;
      const overdueAcknowledgments = acknowledgmentStats.overdue;

      // Calculate compliance rate
      const overallComplianceRate = totalAcknowledgments > 0 
        ? Math.round((acknowledgedCount / totalAcknowledgments) * 100)
        : 0;

      // Process users data
      const activeUsers = companyUsers.filter(user => user.status === 'active').length;

      // Get real acknowledgment trend data (last 6 months)
      const acknowledgmentTrend = await AcknowledgmentService.getAcknowledgmentTrend(6);

      // Process compliance by department from compliance report
      const complianceByDepartment = complianceReport.data.map(dept => ({
        name: dept.department,
        value: dept.complianceRate,
        count: dept.totalDocs
      }));

      // Process audit log events
      const auditLogEvents = recentAuditLogs.map(log => ({
        event: log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        user: `${log.user?.first_name || ''} ${log.user?.last_name || ''}`.trim() || 'Unknown User',
        date: new Date(log.created_at).toLocaleString(),
        entity: log.resource_type || 'Unknown'
      }));

      // Create SOP review pipeline
      const sopReviewPipeline = [
        { status: 'Expiring Soon', count: sopsExpiringSoon },
        { status: 'Under Review', count: pendingReviewSOPs.length },
        { status: 'Overdue', count: overdueAcknowledgments }
      ];

      // Get upcoming acknowledgment deadlines from acknowledgment service
      const upcomingAcknowledgments = await AcknowledgmentService.getAcknowledgments({
        page: 1,
        limit: 10,
        filters: { status: 'pending' },
        sortBy: 'due_date',
        sortOrder: 'asc'
      });

      const upcomingDeadlines = upcomingAcknowledgments.entries.slice(0, 5).map(entry => ({
        document: entry.sopTitle,
        assignedTo: entry.assignedTo,
        dueDate: entry.dueDate,
        status: entry.status
      }));

      const dashboardData: DashboardData = {
        stats: {
          totalSOPs: allSOPs.length,
          publishedSOPs: publishedSOPs.length,
          draftSOPs: draftSOPs.length,
          pendingReviewSOPs: pendingReviewSOPs.length,
          sopsExpiringSoon,
          totalAcknowledgments,
          pendingAcknowledgments,
          acknowledgedCount,
          overdueAcknowledgments,
          totalUsers: companyUsers.length,
          activeUsers,
          overallComplianceRate
        },
        recentSOPs,
        upcomingDeadlines,
        acknowledgmentTrend,
        complianceByDepartment,
        auditLogEvents,
        sopReviewPipeline
      };

      console.log('useDashboard: Final dashboard data:', dashboardData);
      setData(dashboardData);

    } catch (err) {
      console.error('useDashboard: Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.company?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refreshData: fetchDashboardData
  };
} 