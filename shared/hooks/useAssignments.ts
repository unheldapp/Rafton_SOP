import { useState, useEffect } from 'react';
import { AssignmentService, EmployeeAssignment } from '../services/assignmentService';

export interface UseAssignmentsResult {
  assignments: EmployeeAssignment[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    acknowledged: number;
    overdue: number;
  };
  refreshAssignments: () => Promise<void>;
  acknowledgeAssignment: (assignmentId: string, sopId: string, sopVersion: string, notes?: string) => Promise<void>;
  bulkAcknowledgeAssignments: (assignmentIds: string[], notes?: string) => Promise<void>;
}

export function useAssignments(userId: string): UseAssignmentsResult {
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    acknowledged: 0,
    overdue: 0
  });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useAssignments: Fetching assignments for user:', userId);
      
      const [assignmentsData, statsData] = await Promise.all([
        AssignmentService.getEmployeeAssignments(userId),
        AssignmentService.getEmployeeAssignmentStats(userId)
      ]);

      setAssignments(assignmentsData);
      setStats(statsData);
      
      console.log('useAssignments: Successfully loaded assignments:', assignmentsData);
      console.log('useAssignments: Stats:', statsData);
    } catch (err) {
      console.error('useAssignments: Error loading assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const refreshAssignments = async () => {
    await fetchAssignments();
  };

  const acknowledgeAssignment = async (assignmentId: string, sopId: string, sopVersion: string, notes?: string) => {
    try {
      console.log('useAssignments: Acknowledging assignment:', { assignmentId, sopId, sopVersion, notes });
      
      await AssignmentService.acknowledgeAssignment(assignmentId, userId, sopId, sopVersion, notes);
      
      // Update the local state optimistically
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          assignment.assignmentId === assignmentId 
            ? { 
                ...assignment, 
                status: 'acknowledged' as const,
                acknowledgedDate: new Date().toISOString(),
                notes: notes || assignment.notes
              }
            : assignment
        )
      );

      // Update stats
      setStats(prevStats => ({
        total: prevStats.total,
        pending: prevStats.pending - 1,
        acknowledged: prevStats.acknowledged + 1,
        overdue: prevStats.overdue
      }));

      console.log('useAssignments: Successfully acknowledged assignment');
    } catch (err) {
      console.error('useAssignments: Error acknowledging assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to acknowledge assignment');
      throw err;
    }
  };

  const bulkAcknowledgeAssignments = async (assignmentIds: string[], notes?: string) => {
    try {
      console.log('useAssignments: Bulk acknowledging assignments:', { assignmentIds, notes });
      
      // Find the assignments to acknowledge
      const assignmentsToAcknowledge = assignments.filter(a => 
        assignmentIds.includes(a.assignmentId) && a.status === 'pending'
      );

      if (assignmentsToAcknowledge.length === 0) {
        console.log('useAssignments: No valid assignments to acknowledge');
        return;
      }

      // Prepare bulk acknowledge data
      const bulkData = assignmentsToAcknowledge.map(assignment => ({
        assignmentId: assignment.assignmentId,
        userId: userId,
        sopId: assignment.sopId,
        sopVersion: assignment.version
      }));

      await AssignmentService.bulkAcknowledgeAssignments(bulkData, notes);
      
      // Update the local state optimistically
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          assignmentIds.includes(assignment.assignmentId)
            ? { 
                ...assignment, 
                status: 'acknowledged' as const,
                acknowledgedDate: new Date().toISOString(),
                notes: notes || assignment.notes
              }
            : assignment
        )
      );

      // Update stats
      const acknowledgedCount = assignmentsToAcknowledge.length;
      setStats(prevStats => ({
        total: prevStats.total,
        pending: prevStats.pending - acknowledgedCount,
        acknowledged: prevStats.acknowledged + acknowledgedCount,
        overdue: prevStats.overdue
      }));

      console.log('useAssignments: Successfully bulk acknowledged assignments');
    } catch (err) {
      console.error('useAssignments: Error bulk acknowledging assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to bulk acknowledge assignments');
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAssignments();
    }
  }, [userId]);

  return {
    assignments,
    loading,
    error,
    stats,
    refreshAssignments,
    acknowledgeAssignment,
    bulkAcknowledgeAssignments
  };
} 