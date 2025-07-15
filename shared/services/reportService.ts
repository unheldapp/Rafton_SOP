import { supabase } from './supabase';

export type ReportType = 'acknowledgment' | 'sop-review' | 'user-activity' | 'compliance-summary' | 'audit-trail';

export interface ReportFilters {
  dateRange: string;
  status: string;
  department: string;
  priority: string;
  documentType: string;
  user: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  itemsPerPage: number;
  search?: string;
}

export interface AcknowledgmentReportData {
  id: string;
  document: string;
  assignedTo: string;
  status: 'pending' | 'acknowledged' | 'overdue' | 'declined';
  dueDate: string;
  acknowledgedOn: string;
  version: string;
  department: string;
  priority: string;
  assignedBy: string;
  notes?: string;
}

export interface SOPReviewReportData {
  id: string;
  title: string;
  currentVersion: string;
  lastReviewed: string;
  nextReview: string;
  reviewStatus: 'current' | 'due-soon' | 'overdue';
  assignedReviewer: string;
  department: string;
  priority: string;
  reviewType: string;
}

export interface UserActivityReportData {
  id: string;
  user: string;
  email: string;
  lastLogin: string;
  acknowledgedCount: number;
  pendingCount: number;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  totalAssignments: number;
}

export interface ComplianceSummaryData {
  id: string;
  department: string;
  totalDocs: number;
  acknowledged: number;
  pending: number;
  overdue: number;
  complianceRate: number;
  avgResponseTime: string;
  totalUsers: number;
  activeUsers: number;
}

export interface AuditTrailData {
  id: string;
  event: string;
  user: string;
  timestamp: string;
  entity: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  resourceType: string;
  resourceId?: string;
}

export interface ReportStats {
  total: number;
  [key: string]: number | string;
}

class ReportService {
  private getDateRangeFilter(dateRange: string) {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'last-7-days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last-30-days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last-90-days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'last-year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  }

  private getStatusFilter(status: string) {
    if (status === 'all') return undefined;
    return status;
  }

  async getAcknowledgmentReport(
    companyId: string,
    filters: ReportFilters,
    pagination: PaginationParams
  ): Promise<{ data: AcknowledgmentReportData[]; total: number; stats: ReportStats }> {
    try {
      console.log('ReportService: Simple acknowledgment report for company:', companyId);
      
      // Step 1: Get assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('sop_assignments')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        console.error('ReportService: Assignments error:', assignmentsError);
        throw assignmentsError;
      }

      if (!assignments || assignments.length === 0) {
        return { data: [], total: 0, stats: { total: 0, acknowledged: 0, pending: 0, overdue: 0, declined: 0 } };
      }

      console.log('ReportService: Got assignments:', assignments.length);
      console.log('ReportService: Sample assignment:', assignments[0]);

      // Step 2: Get related data
      const allSopIds = assignments.map(a => a.sop_id).filter(id => id);
      const allUserIds = assignments.map(a => a.user_id).filter(id => id);
      const allAssignedByIds = assignments.map(a => a.assigned_by).filter(id => id);
      const allAssignmentIds = assignments.map(a => a.id).filter(id => id);

      console.log('ReportService: IDs to fetch:', { 
        sops: allSopIds.length, 
        users: allUserIds.length, 
        assignedBy: allAssignedByIds.length,
        assignments: allAssignmentIds.length 
      });

      // Fetch all data
      const [sopsResult, usersResult, assignedByResult, acknowledgementsResult] = await Promise.all([
        allSopIds.length > 0 ? supabase.from('sops').select('*').in('id', allSopIds) : { data: [], error: null },
        allUserIds.length > 0 ? supabase.from('users').select('*').in('id', allUserIds) : { data: [], error: null },
        allAssignedByIds.length > 0 ? supabase.from('users').select('*').in('id', allAssignedByIds) : { data: [], error: null },
        allAssignmentIds.length > 0 ? supabase.from('acknowledgments').select('*').in('assignment_id', allAssignmentIds) : { data: [], error: null }
      ]);

      if (sopsResult.error) throw sopsResult.error;
      if (usersResult.error) throw usersResult.error;
      if (assignedByResult.error) throw assignedByResult.error;
      if (acknowledgementsResult.error) throw acknowledgementsResult.error;

      const sops = sopsResult.data || [];
      const users = usersResult.data || [];
      const assignedByUsers = assignedByResult.data || [];
      const acknowledgments = acknowledgementsResult.data || [];

      console.log('ReportService: Fetched data:', { 
        sops: sops.length, 
        users: users.length, 
        assignedBy: assignedByUsers.length,
        acknowledgments: acknowledgments.length 
      });

      // Create lookup maps
      const sopMap = new Map();
      const userMap = new Map();
      const acknowledgmentMap = new Map();

      sops.forEach(sop => sopMap.set(sop.id, sop));
      users.forEach(user => userMap.set(user.id, user));
      assignedByUsers.forEach(user => userMap.set(user.id, user));
      acknowledgments.forEach(ack => acknowledgmentMap.set(ack.assignment_id, ack));

      // Process data
      const reportData = assignments.map((assignment) => {
        const sop = sopMap.get(assignment.sop_id);
        const user = userMap.get(assignment.user_id);
        const assignedByUser = userMap.get(assignment.assigned_by);
        const acknowledgment = acknowledgmentMap.get(assignment.id);

        return {
          id: assignment.id,
          document: sop ? sop.title : 'Unknown Document',
          assignedTo: user ? `${user.first_name} ${user.last_name}`.trim() : 'Unknown User',
          status: acknowledgment ? 'acknowledged' : assignment.status,
          dueDate: assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : '—',
          acknowledgedOn: acknowledgment ? new Date(acknowledgment.acknowledged_at).toLocaleDateString() : '—',
          version: sop ? sop.version : 'v1.0',
          department: sop ? sop.department : (user ? user.department : 'Unknown'),
          priority: assignment.priority || 'medium',
          assignedBy: assignedByUser ? `${assignedByUser.first_name} ${assignedByUser.last_name}`.trim() : 'Unknown',
          notes: assignment.notes || undefined
        };
      });

      // Calculate stats
      const stats = {
        total: assignments.length,
        acknowledged: reportData.filter(item => item.acknowledgedOn !== '—').length,
        pending: reportData.filter(item => item.acknowledgedOn === '—' && item.status === 'pending').length,
        overdue: reportData.filter(item => item.acknowledgedOn === '—' && item.status === 'overdue').length,
        declined: reportData.filter(item => item.status === 'declined').length
      };

      console.log('ReportService: Final stats:', stats);
      console.log('ReportService: Sample data:', reportData[0]);

      return {
        data: reportData,
        total: assignments.length,
        stats
      };
    } catch (error) {
      console.error('ReportService: Error in getAcknowledgmentReport:', error);
      throw error;
    }
  }

  async getSOPReviewReport(
    companyId: string,
    filters: ReportFilters,
    pagination: PaginationParams
  ): Promise<{ data: SOPReviewReportData[]; total: number; stats: ReportStats }> {
    try {
      console.log('ReportService: Fetching SOP review report for company:', companyId);
      const { startDate, endDate } = this.getDateRangeFilter(filters.dateRange);
      
      // Query sop_reviews table with joins to get comprehensive review data
      let query = supabase
        .from('sop_reviews')
        .select(`
          id,
          status,
          comments,
          review_type,
          due_date,
          completed_at,
          created_at,
          updated_at,
          sop:sops!inner (
            id,
            title,
            version,
            department,
            priority,
            company_id,
            next_review_date,
            updated_at
          ),
          reviewer:users!reviewer_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('sop.company_id', companyId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.department !== 'all') {
        query = query.eq('sop.department', filters.department);
      }

      // Get total count
      const { count } = await query.select('*', { count: 'exact', head: true });
      
      // Apply pagination and search
      if (pagination.search) {
        query = query.or(`sop.title.ilike.%${pagination.search}%,reviewer.first_name.ilike.%${pagination.search}%,reviewer.last_name.ilike.%${pagination.search}%`);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(
          (pagination.page - 1) * pagination.itemsPerPage,
          pagination.page * pagination.itemsPerPage - 1
        );

      if (error) {
        console.error('Error fetching SOP review report:', error);
        throw error;
      }

      console.log('ReportService: Raw SOP review data:', data);

      const now = new Date();
      const reportData: SOPReviewReportData[] = (data || []).map(item => {
        // Determine review status based on due date and completion
        let reviewStatus: 'current' | 'due-soon' | 'overdue' = 'current';
        
        if (item.status === 'pending') {
          if (item.due_date) {
            const dueDate = new Date(item.due_date);
            const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 0) {
              reviewStatus = 'overdue';
            } else if (daysDiff <= 7) {
              reviewStatus = 'due-soon';
            }
          }
        }

        return {
          id: item.id,
          title: item.sop?.title || 'Unknown',
          currentVersion: item.sop?.version || 'v1.0',
          lastReviewed: item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'In Progress',
          nextReview: item.sop?.next_review_date ? new Date(item.sop.next_review_date).toLocaleDateString() : 'Not scheduled',
          reviewStatus,
          assignedReviewer: `${item.reviewer?.first_name || ''} ${item.reviewer?.last_name || ''}`.trim() || 'No reviewer',
          department: item.sop?.department || 'Unknown',
          priority: item.sop?.priority || 'medium',
          reviewType: item.review_type || 'approval'
        };
      });

      // Calculate stats
      const stats: ReportStats = {
        total: count || 0,
        pending: reportData.filter(item => item.lastReviewed === 'In Progress').length,
        approved: data?.filter(item => item.status === 'approved').length || 0,
        rejected: data?.filter(item => item.status === 'rejected').length || 0,
        overdue: reportData.filter(item => item.reviewStatus === 'overdue').length
      };

      console.log('ReportService: SOP review report stats:', stats);
      return { data: reportData, total: count || 0, stats };
    } catch (error) {
      console.error('Error fetching SOP review report:', error);
      throw error;
    }
  }

  async getUserActivityReport(
    companyId: string,
    filters: ReportFilters,
    pagination: PaginationParams
  ): Promise<{ data: UserActivityReportData[]; total: number; stats: ReportStats }> {
    try {
      console.log('ReportService: Fetching user activity report for company:', companyId);
      const { startDate, endDate } = this.getDateRangeFilter(filters.dateRange);
      
      // Get users with their assignment and acknowledgment counts in a single optimized query
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          department,
          role,
          status,
          last_login,
          created_at,
          assignments:sop_assignments (
            id,
            status,
            created_at
          ),
          acknowledgments (
            id,
            acknowledged_at
          )
        `)
        .eq('company_id', companyId)
        .is('deleted_at', null);

      // Apply filters
      if (filters.department !== 'all') {
        query = query.eq('department', filters.department);
      }

      // Get total count
      const { count } = await query.select('*', { count: 'exact', head: true });
      
      // Apply pagination and search
      if (pagination.search) {
        query = query.or(`first_name.ilike.%${pagination.search}%,last_name.ilike.%${pagination.search}%,email.ilike.%${pagination.search}%`);
      }
      
      const { data: users, error } = await query
        .order('last_login', { ascending: false, nullsLast: true })
        .range(
          (pagination.page - 1) * pagination.itemsPerPage,
          pagination.page * pagination.itemsPerPage - 1
        );

      if (error) {
        console.error('Error fetching user activity report:', error);
        throw error;
      }

      console.log('ReportService: Raw user activity data:', users);

      // Process data to calculate activity metrics
      const reportData: UserActivityReportData[] = (users || []).map(user => {
        const assignments = user.assignments || [];
        const acknowledgments = user.acknowledgments || [];
        
        // Filter activities within date range
        const recentAssignments = assignments.filter(a => {
          const assignmentDate = new Date(a.created_at);
          return assignmentDate >= new Date(startDate) && assignmentDate <= new Date(endDate);
        });
        
        const recentAcknowledgments = acknowledgments.filter(a => {
          const ackDate = new Date(a.acknowledged_at);
          return ackDate >= new Date(startDate) && ackDate <= new Date(endDate);
        });

        return {
          id: user.id,
          user: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
          email: user.email,
          lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
          acknowledgedCount: recentAcknowledgments.length,
          pendingCount: recentAssignments.filter(a => a.status === 'pending').length,
          department: user.department || 'Unknown',
          role: user.role,
          status: user.status as 'active' | 'inactive',
          joinedAt: new Date(user.created_at).toLocaleDateString(),
          totalAssignments: recentAssignments.length
        };
      });

      // Calculate stats
      const totalAcknowledged = reportData.reduce((sum, item) => sum + item.acknowledgedCount, 0);
      const totalPending = reportData.reduce((sum, item) => sum + item.pendingCount, 0);
      const activeUsers = reportData.filter(item => item.status === 'active').length;
      
      const stats: ReportStats = {
        total: count || 0,
        active: activeUsers,
        inactive: reportData.filter(item => item.status === 'inactive').length,
        avgAcknowledged: reportData.length > 0 ? Math.round(totalAcknowledged / reportData.length) : 0,
        totalPending: totalPending,
        totalAcknowledged: totalAcknowledged
      };

      console.log('ReportService: User activity report stats:', stats);
      return { data: reportData, total: count || 0, stats };
    } catch (error) {
      console.error('Error fetching user activity report:', error);
      throw error;
    }
  }

  async getComplianceSummaryReport(
    companyId: string,
    filters: ReportFilters,
    pagination: PaginationParams
  ): Promise<{ data: ComplianceSummaryData[]; total: number; stats: ReportStats }> {
    try {
      console.log('ReportService: Fetching compliance summary report for company:', companyId);
      const { startDate, endDate } = this.getDateRangeFilter(filters.dateRange);
      
      // Get department-wise compliance data by joining through SOPs with date filtering
      let query = supabase
        .from('sop_assignments')
        .select(`
          status,
          created_at,
          due_date,
          sops!inner (
            department,
            company_id
          ),
          user:users!user_id (
            id,
            department,
            status
          ),
          acknowledgments (
            id,
            acknowledged_at
          )
        `)
        .eq('sops.company_id', companyId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Apply department filter
      if (filters.department !== 'all') {
        query = query.eq('sops.department', filters.department);
      }

      const { data: departmentData, error } = await query;

      if (error) {
        console.error('Error fetching compliance summary report:', error);
        throw error;
      }

      console.log('ReportService: Raw compliance data:', departmentData);

      // Group by department
      const departmentMap = new Map<string, {
        totalDocs: number;
        acknowledged: number;
        pending: number;
        overdue: number;
        users: Set<string>;
        activeUsers: Set<string>;
        responseTimes: number[];
      }>();

      (departmentData || []).forEach(item => {
        const dept = item.sops?.department || item.user?.department || 'Unknown';
        
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, {
            totalDocs: 0,
            acknowledged: 0,
            pending: 0,
            overdue: 0,
            users: new Set(),
            activeUsers: new Set(),
            responseTimes: []
          });
        }
        
        const deptData = departmentMap.get(dept)!;
        deptData.totalDocs++;
        
        // Check if assignment has acknowledgment
        const hasAcknowledgment = item.acknowledgments && item.acknowledgments.length > 0;
        
        if (hasAcknowledgment) {
          deptData.acknowledged++;
          
          // Calculate actual response time if we have acknowledgment data
          const acknowledgedAt = new Date(item.acknowledgments[0].acknowledged_at);
          const createdAt = new Date(item.created_at);
          const responseTime = (acknowledgedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          deptData.responseTimes.push(responseTime);
        } else {
          // Check if overdue
          if (item.due_date && new Date(item.due_date) < new Date()) {
            deptData.overdue++;
          } else {
            deptData.pending++;
          }
        }
        
        if (item.user?.id) {
          deptData.users.add(item.user.id);
          if (item.user.status === 'active') {
            deptData.activeUsers.add(item.user.id);
          }
        }
      });

      const reportData: ComplianceSummaryData[] = Array.from(departmentMap.entries()).map(([dept, data], index) => {
        const complianceRate = data.totalDocs > 0 ? Math.round((data.acknowledged / data.totalDocs) * 100) : 0;
        const avgResponseTime = data.responseTimes.length > 0 
          ? (data.responseTimes.reduce((sum, time) => sum + time, 0) / data.responseTimes.length).toFixed(1)
          : '0';

        return {
          id: `dept-${index}`,
          department: dept,
          totalDocs: data.totalDocs,
          acknowledged: data.acknowledged,
          pending: data.pending,
          overdue: data.overdue,
          complianceRate,
          avgResponseTime: `${avgResponseTime} days`,
          totalUsers: data.users.size,
          activeUsers: data.activeUsers.size
        };
      });

      // Apply search filter
      const filteredData = pagination.search
        ? reportData.filter(item => 
            item.department.toLowerCase().includes(pagination.search!.toLowerCase())
          )
        : reportData;

      // Apply pagination
      const start = (pagination.page - 1) * pagination.itemsPerPage;
      const end = start + pagination.itemsPerPage;
      const paginatedData = filteredData.slice(start, end);

      // Calculate stats
      const totalDocs = reportData.reduce((sum, item) => sum + item.totalDocs, 0);
      const totalAcknowledged = reportData.reduce((sum, item) => sum + item.acknowledged, 0);
      const avgCompliance = reportData.length > 0 
        ? Math.round(reportData.reduce((sum, item) => sum + item.complianceRate, 0) / reportData.length)
        : 0;

      const stats: ReportStats = {
        total: filteredData.length,
        avgCompliance,
        totalDocs,
        totalAcknowledged
      };

      console.log('ReportService: Compliance summary report stats:', stats);
      return { data: paginatedData, total: filteredData.length, stats };
    } catch (error) {
      console.error('Error fetching compliance summary report:', error);
      throw error;
    }
  }

  async getAuditTrailReport(
    companyId: string,
    filters: ReportFilters,
    pagination: PaginationParams
  ): Promise<{ data: AuditTrailData[]; total: number; stats: ReportStats }> {
    try {
      console.log('ReportService: Fetching audit trail report for company:', companyId);
      const { startDate, endDate } = this.getDateRangeFilter(filters.dateRange);
      
      let query = supabase
        .from('audit_logs')
        .select(`
          id,
          action,
          resource_type,
          resource_id,
          old_values,
          new_values,
          ip_address,
          user_agent,
          metadata,
          created_at,
          user_id,
          users!user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('company_id', companyId)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Get total count
      const { count } = await query.select('*', { count: 'exact', head: true });
      
      // Apply pagination and search
      if (pagination.search) {
        query = query.or(`action.ilike.%${pagination.search}%,resource_type.ilike.%${pagination.search}%,users.first_name.ilike.%${pagination.search}%,users.last_name.ilike.%${pagination.search}%`);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(
          (pagination.page - 1) * pagination.itemsPerPage,
          pagination.page * pagination.itemsPerPage - 1
        );

      if (error) {
        console.error('Error fetching audit trail report:', error);
        throw error;
      }

      console.log('ReportService: Raw audit trail data:', data);

      const reportData: AuditTrailData[] = (data || []).map(item => ({
        id: item.id,
        event: item.action || 'Unknown Action',
        user: `${item.users?.first_name || ''} ${item.users?.last_name || ''}`.trim() || 'System',
        timestamp: new Date(item.created_at).toLocaleString(),
        entity: item.resource_type || 'Unknown',
        details: this.formatAuditDetails(item.action, item.old_values, item.new_values, item.metadata),
        ipAddress: item.ip_address || 'Unknown',
        userAgent: item.user_agent || undefined,
        resourceType: item.resource_type || 'Unknown',
        resourceId: item.resource_id || undefined
      }));

      // Calculate stats
      const today = new Date().toDateString();
      const uniqueUsers = new Set(reportData.map(item => item.user));
      const uniqueEvents = new Set(reportData.map(item => item.event));

      const stats: ReportStats = {
        total: count || 0,
        today: reportData.filter(item => new Date(item.timestamp).toDateString() === today).length,
        users: uniqueUsers.size,
        events: uniqueEvents.size
      };

      console.log('ReportService: Audit trail report stats:', stats);
      return { data: reportData, total: count || 0, stats };
    } catch (error) {
      console.error('Error fetching audit trail report:', error);
      throw error;
    }
  }

  private formatAuditDetails(action: string, oldValues: any, newValues: any, metadata: any): string {
    try {
      if (metadata && typeof metadata === 'object' && metadata.description) {
        return metadata.description;
      }
      
      if (action && newValues) {
        const changes = Object.keys(newValues).filter(key => 
          !oldValues || oldValues[key] !== newValues[key]
        );
        
        if (changes.length > 0) {
          return `Changed: ${changes.join(', ')}`;
        }
      }
      
      return action || 'System action performed';
    } catch (error) {
      return 'System action performed';
    }
  }

  async exportReport(
    reportType: ReportType,
    companyId: string,
    filters: ReportFilters,
    format: 'csv' | 'excel' | 'pdf'
  ): Promise<Blob> {
    try {
      // Get all data for export (no pagination)
      const allDataPagination = { page: 1, itemsPerPage: 10000 };
      
      let reportData: any;
      switch (reportType) {
        case 'acknowledgment':
          reportData = await this.getAcknowledgmentReport(companyId, filters, allDataPagination);
          break;
        case 'sop-review':
          reportData = await this.getSOPReviewReport(companyId, filters, allDataPagination);
          break;
        case 'user-activity':
          reportData = await this.getUserActivityReport(companyId, filters, allDataPagination);
          break;
        case 'compliance-summary':
          reportData = await this.getComplianceSummaryReport(companyId, filters, allDataPagination);
          break;
        case 'audit-trail':
          reportData = await this.getAuditTrailReport(companyId, filters, allDataPagination);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Convert to CSV (basic implementation)
      if (format === 'csv') {
        const csvContent = this.convertToCSV(reportData.data);
        return new Blob([csvContent], { type: 'text/csv' });
      }
      
      // For Excel and PDF, you would need additional libraries
      // This is a placeholder implementation
      throw new Error(`Export format ${format} not implemented yet`);
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }
}

export { ReportService };
export const reportService = new ReportService(); 