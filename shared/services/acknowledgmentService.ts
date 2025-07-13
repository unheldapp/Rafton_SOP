import { supabase } from './supabase';
import {
  DatabaseSopAssignment,
  DatabaseSopAssignmentInsert,
  DatabaseSopAssignmentUpdate,
  DatabaseAcknowledgment,
  DatabaseAcknowledgmentInsert,
  DatabaseReminder,
  DatabaseReminderInsert,
  DatabaseNotification,
  DatabaseNotificationInsert
} from '../types/database';
import { SOP, User } from '../types';

export interface AcknowledgmentEntry {
  id: string;
  sopId: string;
  sopTitle: string;
  documentType: 'SOP' | 'Policy' | 'Procedure';
  assignedTo: string;
  assignedEmail: string;
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'acknowledged' | 'declined' | 'overdue' | 'expired';
  acknowledgedAt?: string;
  declineReason?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  version: string;
  reminders: number;
  lastReminderSent?: string;
  // Additional fields for database integration
  assignmentId: string;
  userId: string;
  sopVersionId?: string;
  acknowledgmentId?: string;
}

export interface AcknowledgmentStats {
  totalAssigned: number;
  acknowledged: number;
  pending: number;
  declined: number;
  overdue: number;
  expired: number;
}

export interface AcknowledgmentFilters {
  documentType?: string;
  documentName?: string;
  status?: string;
  assignedUser?: string;
  priority?: string;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface AcknowledgmentListResponse {
  entries: AcknowledgmentEntry[];
  stats: AcknowledgmentStats;
  total: number;
  page: number;
  limit: number;
}

export class AcknowledgmentService {
  /**
   * Get acknowledgment entries with filtering and pagination
   */
  static async getAcknowledgments(options: {
    page?: number;
    limit?: number;
    filters?: AcknowledgmentFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<AcknowledgmentListResponse> {
    try {
      const { page = 1, limit = 20, filters = {}, sortBy = 'created_at', sortOrder = 'desc' } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('sop_assignments')
        .select(`
          *,
          sop:sops!sop_id(id, title, department, version, document_type, status),
          user:users!user_id(id, first_name, last_name, email, department),
          assigned_by_user:users!assigned_by(id, first_name, last_name, email),
          acknowledgment:acknowledgments(id, acknowledged_at, notes, created_at),
          reminder_count:reminders(count)
        `)
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'overdue') {
          query = query.lt('due_date', new Date().toISOString()).neq('status', 'acknowledged');
        } else if (filters.status === 'expired') {
          // For expired, we need to check if due date is past and no acknowledgment
          query = query.lt('due_date', new Date().toISOString()).is('acknowledgment', null);
        } else if (filters.status === 'declined') {
          // For declined, we check if notes start with "DECLINED:"
          query = query.like('notes', 'DECLINED:%');
        } else {
          query = query.eq('status', filters.status);
        }
      }

      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.documentName && filters.documentName !== 'all') {
        query = query.eq('sop_id', filters.documentName);
      }

      if (filters.assignedUser && filters.assignedUser !== 'all') {
        query = query.eq('user_id', filters.assignedUser);
      }

      if (filters.dateFrom) {
        query = query.gte('due_date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('due_date', filters.dateTo);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data: assignments, error } = await query;

      if (error) {
        console.error('Error fetching acknowledgments:', error);
        throw error;
      }

      // Transform the data to match the expected format
      const entries: AcknowledgmentEntry[] = assignments?.map(assignment => {
        const sop = assignment.sop;
        const user = assignment.user;
        const acknowledgment = assignment.acknowledgment;

        // Determine status based on acknowledgment, due date, and notes
        let status: AcknowledgmentEntry['status'] = 'pending';
        let declineReason: string | undefined;
        
        if (acknowledgment && acknowledgment.length > 0) {
          status = 'acknowledged';
        } else if (assignment.notes && assignment.notes.startsWith('DECLINED:')) {
          status = 'declined';
          declineReason = assignment.notes.substring(9); // Remove "DECLINED:" prefix
        } else if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
          status = 'overdue';
        }

        return {
          id: assignment.id,
          assignmentId: assignment.id,
          sopId: sop.id,
          sopTitle: sop.title,
          documentType: this.mapSOPTypeToDocumentType(sop.document_type),
          assignedTo: `${user.first_name} ${user.last_name}`,
          assignedEmail: user.email,
          assignedDate: assignment.created_at,
          dueDate: assignment.due_date,
          status,
          acknowledgedAt: acknowledgment?.[0]?.acknowledged_at,
          declineReason,
          priority: assignment.priority,
          department: sop.department || user.department || 'N/A',
          version: sop.version || '1.0',
          reminders: assignment.reminder_count?.[0]?.count || 0,
          userId: user.id,
          acknowledgmentId: acknowledgment?.[0]?.id,
        };
      }) || [];

      // Calculate statistics
      const stats = this.calculateStats(entries);

      // Get total count for pagination
      const { count: total } = await supabase
        .from('sop_assignments')
        .select('*', { count: 'exact', head: true });

      return {
        entries: this.applyClientSideFilters(entries, filters),
        stats,
        total: total || 0,
        page,
        limit
      };

    } catch (error) {
      console.error('Error in getAcknowledgments:', error);
      throw error;
    }
  }

  /**
   * Create a new acknowledgment
   */
  static async createAcknowledgment(data: {
    assignmentId: string;
    userId: string;
    sopId: string;
    sopVersion: string;
    notes?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<DatabaseAcknowledgment> {
    try {
      const { data: acknowledgment, error } = await supabase
        .from('acknowledgments')
        .insert({
          assignment_id: data.assignmentId,
          user_id: data.userId,
          sop_id: data.sopId,
          sop_version: data.sopVersion,
          notes: data.notes,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          acknowledged_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating acknowledgment:', error);
        throw error;
      }

      // Update assignment status
      await supabase
        .from('sop_assignments')
        .update({ status: 'acknowledged' })
        .eq('id', data.assignmentId);

      // Create notification
      await this.createNotification({
        user_id: data.userId,
        type: 'acknowledgment_completed',
        title: 'SOP Acknowledged',
        message: 'You have successfully acknowledged an SOP.',
        data: { acknowledgmentId: acknowledgment.id, sopId: data.sopId }
      });

      return acknowledgment;
    } catch (error) {
      console.error('Error in createAcknowledgment:', error);
      throw error;
    }
  }

  /**
   * Decline an acknowledgment with reason
   */
  static async declineAcknowledgment(data: {
    assignmentId: string;
    userId: string;
    sopId: string;
    reason: string;
  }): Promise<void> {
    try {
      // Update assignment with decline reason but keep status as pending
      // We'll track the decline in the notes field and handle it in the logic
      const { error } = await supabase
        .from('sop_assignments')
        .update({ 
          notes: `DECLINED: ${data.reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.assignmentId);

      if (error) {
        console.error('Error declining acknowledgment:', error);
        throw error;
      }

      // Create notification
      await this.createNotification({
        user_id: data.userId,
        type: 'acknowledgment_declined',
        title: 'SOP Acknowledgment Declined',
        message: 'You have declined an SOP acknowledgment.',
        data: { assignmentId: data.assignmentId, sopId: data.sopId, reason: data.reason }
      });

    } catch (error) {
      console.error('Error in declineAcknowledgment:', error);
      throw error;
    }
  }

  /**
   * Send reminder for acknowledgment
   */
  static async sendReminder(assignmentId: string, userId: string): Promise<void> {
    try {
      // Create reminder entry
      const { error } = await supabase
        .from('reminders')
        .insert({
          assignment_id: assignmentId,
          user_id: userId,
          type: 'acknowledgment',
          message: 'Please acknowledge your assigned SOP.',
          channel: 'email',
          scheduled_at: new Date().toISOString(),
          sent_at: new Date().toISOString(),
          status: 'sent'
        });

      if (error) {
        console.error('Error sending reminder:', error);
        throw error;
      }

      // Create notification
      await this.createNotification({
        user_id: userId,
        type: 'acknowledgment_reminder',
        title: 'SOP Acknowledgment Reminder',
        message: 'You have a pending SOP acknowledgment.',
        data: { assignmentId }
      });

    } catch (error) {
      console.error('Error in sendReminder:', error);
      throw error;
    }
  }

  /**
   * Bulk send reminders
   */
  static async sendBulkReminders(assignmentIds: string[]): Promise<void> {
    try {
      const promises = assignmentIds.map(async (assignmentId) => {
        // Get assignment details
        const { data: assignment } = await supabase
          .from('sop_assignments')
          .select('user_id')
          .eq('id', assignmentId)
          .single();

        if (assignment) {
          return this.sendReminder(assignmentId, assignment.user_id);
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error in sendBulkReminders:', error);
      throw error;
    }
  }

  /**
   * Get acknowledgment statistics
   */
  static async getAcknowledgmentStats(): Promise<AcknowledgmentStats> {
    try {
      const { data: assignments } = await supabase
        .from('sop_assignments')
        .select(`
          *,
          acknowledgment:acknowledgments(id, acknowledged_at)
        `);

      if (!assignments) return this.getEmptyStats();

      const entries: AcknowledgmentEntry[] = assignments.map(assignment => {
        let status: AcknowledgmentEntry['status'] = 'pending';
        
        if (assignment.acknowledgment && assignment.acknowledgment.length > 0) {
          status = 'acknowledged';
        } else if (assignment.notes && assignment.notes.startsWith('DECLINED:')) {
          status = 'declined';
        } else if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
          status = 'overdue';
        }

        return {
          status,
          dueDate: assignment.due_date
        } as AcknowledgmentEntry;
      });

      return this.calculateStats(entries);
    } catch (error) {
      console.error('Error in getAcknowledgmentStats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Get unique documents for filtering
   */
  static async getUniqueDocuments(): Promise<Array<{ id: string; title: string }>> {
    try {
      const { data: sops } = await supabase
        .from('sops')
        .select('id, title')
        .is('deleted_at', null);

      return sops || [];
    } catch (error) {
      console.error('Error getting unique documents:', error);
      return [];
    }
  }

  /**
   * Get unique users for filtering
   */
  static async getUniqueUsers(): Promise<Array<{ id: string; name: string; email: string }>> {
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .is('deleted_at', null);

      return users?.map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email
      })) || [];
    } catch (error) {
      console.error('Error getting unique users:', error);
      return [];
    }
  }

  // Private helper methods
  private static mapSOPTypeToDocumentType(type: string): 'SOP' | 'Policy' | 'Procedure' {
    switch (type?.toLowerCase()) {
      case 'policy':
        return 'Policy';
      case 'procedure':
        return 'Procedure';
      default:
        return 'SOP';
    }
  }

  private static calculateStats(entries: AcknowledgmentEntry[]): AcknowledgmentStats {
    const stats: AcknowledgmentStats = {
      totalAssigned: entries.length,
      acknowledged: 0,
      pending: 0,
      declined: 0,
      overdue: 0,
      expired: 0
    };

    entries.forEach(entry => {
      switch (entry.status) {
        case 'acknowledged':
          stats.acknowledged++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'declined':
          stats.declined++;
          break;
        case 'overdue':
          stats.overdue++;
          break;
        case 'expired':
          stats.expired++;
          break;
      }
    });

    return stats;
  }

  private static getEmptyStats(): AcknowledgmentStats {
    return {
      totalAssigned: 0,
      acknowledged: 0,
      pending: 0,
      declined: 0,
      overdue: 0,
      expired: 0
    };
  }

  private static applyClientSideFilters(entries: AcknowledgmentEntry[], filters: AcknowledgmentFilters): AcknowledgmentEntry[] {
    let filtered = [...entries];

    // Apply document type filter
    if (filters.documentType && filters.documentType !== 'all') {
      filtered = filtered.filter(entry => entry.documentType === filters.documentType);
    }

    // Apply department filter
    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(entry => entry.department === filters.department);
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.sopTitle.toLowerCase().includes(searchTerm) ||
        entry.assignedTo.toLowerCase().includes(searchTerm) ||
        entry.assignedEmail.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  private static async createNotification(data: DatabaseNotificationInsert): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(data);

      if (error) {
        console.error('Error creating notification:', error);
      }
    } catch (error) {
      console.error('Error in createNotification:', error);
    }
  }
} 