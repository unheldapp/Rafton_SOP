import { supabase } from './supabase';
import {
  DatabaseSopAssignment,
  DatabaseAcknowledgment,
  DatabaseSop,
  DatabaseUser
} from '../types/database';

export interface EmployeeAssignment {
  id: string;
  sopId: string;
  title: string;
  description: string | null;
  content: string;
  version: string;
  assignedOn: string;
  dueDate: string | null;
  status: 'pending' | 'acknowledged' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  department: string | null;
  type: 'SOP' | 'Policy' | 'Training' | 'Procedure';
  tags: string[];
  acknowledgedDate?: string;
  notes: string | null;
  assignmentId: string;
}

export class AssignmentService {
  /**
   * Get all assignments for a specific employee
   */
  static async getEmployeeAssignments(userId: string): Promise<EmployeeAssignment[]> {
    try {
      console.log('AssignmentService.getEmployeeAssignments: Fetching assignments for user:', userId);

      const { data: assignments, error } = await supabase
        .from('sop_assignments')
        .select(`
          id,
          sop_id,
          due_date,
          priority,
          status,
          notes,
          created_at,
          updated_at,
          sop:sops!sop_id(
            id,
            title,
            description,
            content,
            version,
            department,
            tags,
            status,
            document_type,
            created_at
          ),
          assigned_by_user:users!assigned_by(
            id,
            first_name,
            last_name,
            email
          ),
          acknowledgments(
            id,
            acknowledged_at,
            notes
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('AssignmentService.getEmployeeAssignments: Database error:', error);
        throw error;
      }

      if (!assignments) {
        console.log('AssignmentService.getEmployeeAssignments: No assignments found');
        return [];
      }

      console.log('AssignmentService.getEmployeeAssignments: Raw assignments:', assignments);

      // Transform the data to match the expected interface
      const transformedAssignments: EmployeeAssignment[] = assignments.map(assignment => {
        const sop = assignment.sop as any;
        const assignedByUser = assignment.assigned_by_user as any;
        const acknowledgment = assignment.acknowledgments?.[0] as any;

        // Determine status based on due date and acknowledgment
        let status: 'pending' | 'acknowledged' | 'overdue' = 'pending';
        if (acknowledgment) {
          status = 'acknowledged';
        } else if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
          status = 'overdue';
        }

        // Map document_type to our type enum
        const getDocumentType = (docType: string | null): 'SOP' | 'Policy' | 'Training' | 'Procedure' => {
          if (!docType) return 'SOP';
          switch (docType.toLowerCase()) {
            case 'policy': return 'Policy';
            case 'training': return 'Training';
            case 'procedure': return 'Procedure';
            default: return 'SOP';
          }
        };

        return {
          id: assignment.id,
          sopId: sop.id,
          title: sop.title,
          description: sop.description,
          content: sop.content,
          version: sop.version,
          assignedOn: assignment.created_at,
          dueDate: assignment.due_date,
          status,
          priority: assignment.priority as 'low' | 'medium' | 'high' | 'critical',
          assignedBy: {
            id: assignedByUser?.id || '',
            firstName: assignedByUser?.first_name || '',
            lastName: assignedByUser?.last_name || '',
            email: assignedByUser?.email || ''
          },
          department: sop.department,
          type: getDocumentType(sop.document_type),
          tags: sop.tags || [],
          acknowledgedDate: acknowledgment?.acknowledged_at,
          notes: assignment.notes,
          assignmentId: assignment.id
        };
      });

      console.log('AssignmentService.getEmployeeAssignments: Transformed assignments:', transformedAssignments);
      return transformedAssignments;
    } catch (error) {
      console.error('AssignmentService.getEmployeeAssignments: Error fetching assignments:', error);
      throw error;
    }
  }

  /**
   * Acknowledge a specific assignment
   */
  static async acknowledgeAssignment(
    assignmentId: string,
    userId: string,
    sopId: string,
    sopVersion: string,
    notes?: string
  ): Promise<void> {
    try {
      console.log('AssignmentService.acknowledgeAssignment: Acknowledging assignment:', {
        assignmentId,
        userId,
        sopId,
        sopVersion,
        notes
      });

      // First, create the acknowledgment record
      const { error: ackError } = await supabase
        .from('acknowledgments')
        .insert({
          assignment_id: assignmentId,
          user_id: userId,
          sop_id: sopId,
          sop_version: sopVersion,
          notes: notes || null,
          acknowledged_at: new Date().toISOString()
        });

      if (ackError) {
        console.error('AssignmentService.acknowledgeAssignment: Error creating acknowledgment:', ackError);
        throw ackError;
      }

      // Then update the assignment status
      const { error: updateError } = await supabase
        .from('sop_assignments')
        .update({
          status: 'acknowledged',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (updateError) {
        console.error('AssignmentService.acknowledgeAssignment: Error updating assignment:', updateError);
        throw updateError;
      }

      console.log('AssignmentService.acknowledgeAssignment: Successfully acknowledged assignment');
    } catch (error) {
      console.error('AssignmentService.acknowledgeAssignment: Error acknowledging assignment:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics for an employee
   */
  static async getEmployeeAssignmentStats(userId: string): Promise<{
    total: number;
    pending: number;
    acknowledged: number;
    overdue: number;
  }> {
    try {
      console.log('AssignmentService.getEmployeeAssignmentStats: Fetching stats for user:', userId);

      const { data: assignments, error } = await supabase
        .from('sop_assignments')
        .select(`
          id,
          due_date,
          status,
          acknowledgments(id, acknowledged_at)
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('AssignmentService.getEmployeeAssignmentStats: Database error:', error);
        throw error;
      }

      if (!assignments) {
        return { total: 0, pending: 0, acknowledged: 0, overdue: 0 };
      }

      const now = new Date();
      const stats = assignments.reduce((acc, assignment) => {
        const hasAcknowledgment = assignment.acknowledgments && assignment.acknowledgments.length > 0;
        const isOverdue = assignment.due_date && new Date(assignment.due_date) < now;

        acc.total++;
        
        if (hasAcknowledgment) {
          acc.acknowledged++;
        } else if (isOverdue) {
          acc.overdue++;
        } else {
          acc.pending++;
        }

        return acc;
      }, { total: 0, pending: 0, acknowledged: 0, overdue: 0 });

      console.log('AssignmentService.getEmployeeAssignmentStats: Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('AssignmentService.getEmployeeAssignmentStats: Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Bulk acknowledge multiple assignments
   */
  static async bulkAcknowledgeAssignments(
    assignments: { assignmentId: string; userId: string; sopId: string; sopVersion: string }[],
    notes?: string
  ): Promise<void> {
    try {
      console.log('AssignmentService.bulkAcknowledgeAssignments: Bulk acknowledging assignments:', assignments);

      // Create acknowledgment records
      const acknowledgmentData = assignments.map(assignment => ({
        assignment_id: assignment.assignmentId,
        user_id: assignment.userId,
        sop_id: assignment.sopId,
        sop_version: assignment.sopVersion,
        notes: notes || null,
        acknowledged_at: new Date().toISOString()
      }));

      const { error: ackError } = await supabase
        .from('acknowledgments')
        .insert(acknowledgmentData);

      if (ackError) {
        console.error('AssignmentService.bulkAcknowledgeAssignments: Error creating acknowledgments:', ackError);
        throw ackError;
      }

      // Update assignment statuses
      const assignmentIds = assignments.map(a => a.assignmentId);
      const { error: updateError } = await supabase
        .from('sop_assignments')
        .update({
          status: 'acknowledged',
          updated_at: new Date().toISOString()
        })
        .in('id', assignmentIds);

      if (updateError) {
        console.error('AssignmentService.bulkAcknowledgeAssignments: Error updating assignments:', updateError);
        throw updateError;
      }

      console.log('AssignmentService.bulkAcknowledgeAssignments: Successfully bulk acknowledged assignments');
    } catch (error) {
      console.error('AssignmentService.bulkAcknowledgeAssignments: Error bulk acknowledging assignments:', error);
      throw error;
    }
  }
} 