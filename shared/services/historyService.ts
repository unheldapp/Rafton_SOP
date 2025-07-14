import { supabase } from './supabase';

export interface AcknowledgmentRecord {
  id: string;
  documentId: string;
  documentTitle: string;
  department: string;
  acknowledgedDate: string;
  version: string;
  status: 'acknowledged' | 'expired' | 'superseded';
  documentType: 'sop' | 'policy' | 'training' | 'procedure';
  content: string;
  currentVersion?: string;
  supersededDate?: string;
  expiryDate?: string;
  acknowledgedBy: string;
  receiptId: string;
}

export interface HistoryStats {
  total: number;
  acknowledged: number;
  expired: number;
  superseded: number;
}

export interface HistoryFilters {
  searchTerm?: string;
  dateRange?: 'all' | '30days' | '6months' | '1year';
  documentType?: 'all' | 'sop' | 'policy' | 'training' | 'procedure';
  department?: string;
  status?: 'all' | 'acknowledged' | 'expired' | 'superseded';
}

export class HistoryService {
  /**
   * Get acknowledgment history for an employee
   */
  static async getEmployeeHistory(userId: string, filters: HistoryFilters = {}): Promise<AcknowledgmentRecord[]> {
    try {
      console.log('Fetching acknowledgment history for user:', userId);
      
      // Base query to get acknowledgments with document details
      let query = supabase
        .from('acknowledgments')
        .select(`
          id,
          acknowledged_at,
          user_id,
          assignment_id,
          sop_version,
          notes,
          sop_assignments!inner (
            id,
            sop_id,
            created_at,
            sops!inner (
              id,
              title,
              content,
              version,
              document_type,
              department,
              status,
              created_at,
              updated_at
            )
          ),
          users!inner (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('user_id', userId);

      // Apply date filter if specified
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
        
        query = query.gte('acknowledged_at', filterDate.toISOString());
      }

      // Apply document type filter
      if (filters.documentType && filters.documentType !== 'all') {
        query = query.eq('sop_assignments.sops.document_type', filters.documentType);
      }

      // Apply department filter
      if (filters.department && filters.department !== 'all') {
        query = query.eq('sop_assignments.sops.department', filters.department);
      }

      const { data: acknowledgments, error } = await query.order('acknowledged_at', { ascending: false });

      if (error) {
        console.error('Error fetching acknowledgment history:', error);
        throw error;
      }

      if (!acknowledgments || acknowledgments.length === 0) {
        console.log('No acknowledgment history found for user:', userId);
        return [];
      }

      console.log('Raw acknowledgments:', acknowledgments);

      // Transform the data and determine status
      const historyRecords = await Promise.all(
        acknowledgments.map(async (ack: any) => {
          const sop = ack.sop_assignments.sops;
          const user = ack.users;
          
          // Determine the current status of this acknowledgment
          const status = await this.determineAcknowledgmentStatus(ack.id, sop.id, ack.acknowledged_at);
          
          // Get current version info if superseded
          let currentVersion = sop.version;
          let supersededDate = null;
          
          if (status === 'superseded') {
            const currentVersionInfo = await this.getCurrentVersionInfo(sop.id);
            currentVersion = currentVersionInfo.version;
            supersededDate = currentVersionInfo.updated_at;
          }

          const record: AcknowledgmentRecord = {
            id: ack.id,
            documentId: sop.id,
            documentTitle: sop.title,
            department: sop.department,
            acknowledgedDate: ack.acknowledged_at,
            version: ack.sop_version || sop.version, // Use the version from acknowledgment if available
            status,
            documentType: sop.document_type || 'sop',
            content: sop.content || '',
            currentVersion: status === 'superseded' ? currentVersion : undefined,
            supersededDate: supersededDate,
            expiryDate: this.calculateExpiryDate(ack.acknowledged_at, sop.document_type),
            acknowledgedBy: `${user.first_name} ${user.last_name}`,
            receiptId: `ACK-${ack.id.slice(-8).toUpperCase()}` // Generate receipt ID from acknowledgment ID
          };

          return record;
        })
      );

      // Apply search filter if specified
      let filteredRecords = historyRecords;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredRecords = historyRecords.filter(record =>
          record.documentTitle.toLowerCase().includes(searchLower) ||
          record.department.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter if specified
      if (filters.status && filters.status !== 'all') {
        filteredRecords = filteredRecords.filter(record => record.status === filters.status);
      }

      console.log('Processed history records:', filteredRecords);
      return filteredRecords;

    } catch (error) {
      console.error('Error in getEmployeeHistory:', error);
      throw error;
    }
  }

  /**
   * Get statistics for employee acknowledgment history
   */
  static async getEmployeeHistoryStats(userId: string): Promise<HistoryStats> {
    try {
      const records = await this.getEmployeeHistory(userId);
      
      const stats = {
        total: records.length,
        acknowledged: records.filter(r => r.status === 'acknowledged').length,
        expired: records.filter(r => r.status === 'expired').length,
        superseded: records.filter(r => r.status === 'superseded').length
      };

      return stats;
    } catch (error) {
      console.error('Error getting history stats:', error);
      throw error;
    }
  }

  /**
   * Get unique departments from acknowledgment history
   */
  static async getHistoryDepartments(userId: string): Promise<string[]> {
    try {
      const { data: departments, error } = await supabase
        .from('acknowledgments')
        .select(`
          sop_assignments!inner (
            sops!inner (
              department
            )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      if (!departments) return [];

      const uniqueDepartments = [...new Set(
        departments.map((ack: any) => ack.sop_assignments.sops.department)
      )];

      return uniqueDepartments.filter(Boolean);
    } catch (error) {
      console.error('Error getting history departments:', error);
      return [];
    }
  }

  /**
   * Determine the current status of an acknowledgment
   */
  private static async determineAcknowledgmentStatus(
    acknowledgmentId: string,
    sopId: string,
    acknowledgedAt: string
  ): Promise<'acknowledged' | 'expired' | 'superseded'> {
    try {
      // Check if there's a newer version of the SOP
      const { data: newerVersions, error: versionError } = await supabase
        .from('sops')
        .select('id, version, updated_at')
        .eq('id', sopId)
        .gt('updated_at', acknowledgedAt)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (versionError) {
        console.error('Error checking SOP versions:', versionError);
        return 'acknowledged';
      }

      // If there's a newer version, this acknowledgment is superseded
      if (newerVersions && newerVersions.length > 0) {
        return 'superseded';
      }

      // Check if the acknowledgment has expired based on document type
      const expiryDate = this.calculateExpiryDate(acknowledgedAt, 'sop'); // Default to sop for now
      if (expiryDate && new Date(expiryDate) < new Date()) {
        return 'expired';
      }

      return 'acknowledged';
    } catch (error) {
      console.error('Error determining acknowledgment status:', error);
      return 'acknowledged';
    }
  }

  /**
   * Get current version info for a SOP
   */
  private static async getCurrentVersionInfo(sopId: string): Promise<{ version: string; updated_at: string }> {
    try {
      const { data: currentSop, error } = await supabase
        .from('sops')
        .select('version, updated_at')
        .eq('id', sopId)
        .single();

      if (error || !currentSop) {
        console.error('Error fetching current SOP version:', error);
        return { version: '1.0', updated_at: new Date().toISOString() };
      }

      return {
        version: currentSop.version,
        updated_at: currentSop.updated_at
      };
    } catch (error) {
      console.error('Error getting current version info:', error);
      return { version: '1.0', updated_at: new Date().toISOString() };
    }
  }

  /**
   * Calculate expiry date based on document type and acknowledgment date
   */
  private static calculateExpiryDate(acknowledgedAt: string, documentType: string): string | null {
    // Define expiry periods for different document types
    const expiryPeriods = {
      training: 365, // 1 year
      policy: 1095, // 3 years
      sop: 730, // 2 years
      procedure: 730 // 2 years
    };

    const days = expiryPeriods[documentType as keyof typeof expiryPeriods] || 730;
    const acknowledgedDate = new Date(acknowledgedAt);
    const expiryDate = new Date(acknowledgedDate.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return expiryDate.toISOString();
  }

  /**
   * Download acknowledgment receipt
   */
  static generateReceiptContent(record: AcknowledgmentRecord, userEmail: string): string {
    const receipt = {
      receiptId: record.receiptId,
      documentTitle: record.documentTitle,
      documentVersion: record.version,
      department: record.department,
      documentType: record.documentType,
      acknowledgedBy: record.acknowledgedBy,
      acknowledgedDate: new Date(record.acknowledgedDate).toLocaleString(),
      status: record.status,
      userEmail: userEmail,
      generatedAt: new Date().toLocaleString()
    };

    return JSON.stringify(receipt, null, 2);
  }
} 