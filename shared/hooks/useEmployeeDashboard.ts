import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { AssignmentService, EmployeeAssignment } from '../services/assignmentService';
import { NotificationService } from '../services/notificationService';
import { HistoryService } from '../services/historyService';

export interface EmployeeDashboardStats {
  pendingAssignments: number;
  acknowledgedThisMonth: number;
  overdueAssignments: number;
  totalAssignments: number;
  complianceRate: number;
  unreadNotifications: number;
}

export interface RecentActivity {
  id: string;
  type: 'acknowledged' | 'reminder' | 'assigned' | 'notification';
  message: string;
  date: string;
  documentTitle?: string;
  sopId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface EmployeeDashboardData {
  stats: EmployeeDashboardStats;
  pendingAssignments: EmployeeAssignment[];
  recentActivity: RecentActivity[];
  notifications: any[];
}

export interface UseEmployeeDashboardReturn {
  data: EmployeeDashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  acknowledgeAssignment: (assignmentId: string, sopId: string, sopVersion: string, notes?: string) => Promise<void>;
}

export function useEmployeeDashboard(): UseEmployeeDashboardReturn {
  const { currentUser } = useAuth();
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useEmployeeDashboard: Fetching dashboard data for user:', currentUser.id);

      // Fetch all required data in parallel
      const [
        assignments,
        assignmentStats,
        notifications,
        recentHistory
      ] = await Promise.all([
        AssignmentService.getEmployeeAssignments(currentUser.id),
        AssignmentService.getEmployeeAssignmentStats(currentUser.id),
        NotificationService.getUserNotifications(currentUser.id, { limit: 20 }),
        HistoryService.getEmployeeHistory(currentUser.id, { limit: 10 })
      ]);

      // Calculate acknowledged this month using history data
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const acknowledgedThisMonth = recentHistory.filter(record => 
        new Date(record.acknowledgedDate) >= startOfMonth
      ).length;

      // Calculate compliance rate
      const totalAssignments = assignmentStats.total;
      const complianceRate = totalAssignments > 0 
        ? ((assignmentStats.acknowledged / totalAssignments) * 100) 
        : 100;

      // Count unread notifications
      const unreadNotifications = notifications.filter(n => !n.isRead).length;

      // Format recent activity
      const recentActivity: RecentActivity[] = [];

      // Add recent acknowledgments from history
      recentHistory.slice(0, 5).forEach(record => {
        recentActivity.push({
          id: `ack-${record.id}`,
          type: 'acknowledged',
          message: `You acknowledged "${record.documentTitle}" successfully`,
          date: record.acknowledgedDate,
          documentTitle: record.documentTitle,
          sopId: record.documentId
        });
      });

      // Add recent assignments
      assignments.slice(0, 3).forEach(assignment => {
        if (assignment.status === 'pending') {
          recentActivity.push({
            id: `assign-${assignment.id}`,
            type: 'assigned',
            message: `New document assigned: "${assignment.sopTitle}"`,
            date: assignment.createdAt,
            documentTitle: assignment.sopTitle,
            sopId: assignment.sopId,
            priority: assignment.priority
          });
        }
      });

      // Add recent notifications
      notifications.slice(0, 3).forEach(notification => {
        recentActivity.push({
          id: `notif-${notification.id}`,
          type: 'notification',
          message: notification.message,
          date: notification.date,
          priority: notification.priority
        });
      });

      // Sort recent activity by date (most recent first)
      recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const dashboardData: EmployeeDashboardData = {
        stats: {
          pendingAssignments: assignmentStats.pending,
          acknowledgedThisMonth,
          overdueAssignments: assignmentStats.overdue,
          totalAssignments: assignmentStats.total,
          complianceRate,
          unreadNotifications
        },
        pendingAssignments: assignments.filter(a => a.status === 'pending'),
        recentActivity: recentActivity.slice(0, 10),
        notifications: notifications.slice(0, 5)
      };

      setData(dashboardData);
      console.log('useEmployeeDashboard: Successfully loaded dashboard data:', dashboardData);
    } catch (err) {
      console.error('useEmployeeDashboard: Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const acknowledgeAssignment = async (assignmentId: string, sopId: string, sopVersion: string, notes?: string) => {
    try {
      console.log('useEmployeeDashboard: Acknowledging assignment:', assignmentId);
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }
      
      await AssignmentService.acknowledgeAssignment(assignmentId, currentUser.id, sopId, sopVersion, notes);
      
      // Refresh dashboard data after acknowledgment
      await fetchDashboardData();
      
      console.log('useEmployeeDashboard: Assignment acknowledged successfully');
    } catch (err) {
      console.error('useEmployeeDashboard: Error acknowledging assignment:', err);
      throw err;
    }
  };

  const refreshData = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    refreshData,
    acknowledgeAssignment
  };
} 