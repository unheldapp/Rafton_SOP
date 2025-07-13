import { supabase } from './supabase';
import { 
  DatabaseSop, 
  DatabaseSopInsert, 
  DatabaseSopUpdate,
  DatabaseSopFolder,
  DatabaseSopFolderInsert,
  DatabaseSopFolderUpdate,
  DatabaseSopAssignment,
  DatabaseSopAssignmentInsert,
  DatabaseSopCategory,
  DatabaseSopCategoryInsert,
  DatabaseFileAttachment,
  DatabaseFileAttachmentInsert
} from '../types/database';
import { SOP, User } from '../types';

export interface SOPWithDetails extends DatabaseSop {
  author?: User;
  reviewer?: User;
  approver?: User;
  folder?: DatabaseSopFolder;
  category?: DatabaseSopCategory;
  assignmentCount?: number;
  acknowledgedCount?: number;
}

export interface SOPListResponse {
  sops: SOPWithDetails[];
  total: number;
  page: number;
  limit: number;
}

export interface SOPFilters {
  status?: string[];
  priority?: string[];
  department?: string[];
  folderId?: string;
  categoryId?: string;
  authorId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateSOPData {
  title: string;
  description?: string;
  content: string;
  folderId?: string;
  categoryId?: string;
  department?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  reviewFrequency?: number;
  expiresAt?: string;
  assignees?: string[];
}

export interface FolderWithSOPCount extends DatabaseSopFolder {
  sopCount?: number;
  children?: FolderWithSOPCount[];
}

export class SOPService {
  // ============ SOP MANAGEMENT ============

  /**
   * Get SOPs with pagination, filtering, and related data
   */
  static async getSOPs(options: {
    page?: number;
    limit?: number;
    filters?: SOPFilters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<SOPListResponse> {
    try {
      const { page = 1, limit = 20, filters = {}, sortBy = 'updated_at', sortOrder = 'desc' } = options;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('sops')
        .select(`
          *,
          author:users!author_id (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .is('deleted_at', null)
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters.department?.length) {
        query = query.in('department', filters.department);
      }
      if (filters.folderId) {
        if (filters.folderId === 'null') {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', filters.folderId);
        }
      }
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters.authorId) {
        query = query.eq('author_id', filters.authorId);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data: sops, error, count } = await query;

      if (error) {
        console.error('Error fetching SOPs:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      // Get total count for pagination with same filters
      let countQuery = supabase
        .from('sops')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      // Apply the same filters to count query
      if (filters.status?.length) {
        countQuery = countQuery.in('status', filters.status);
      }
      if (filters.priority?.length) {
        countQuery = countQuery.in('priority', filters.priority);
      }
      if (filters.department?.length) {
        countQuery = countQuery.in('department', filters.department);
      }
      if (filters.folderId) {
        if (filters.folderId === 'null') {
          countQuery = countQuery.is('folder_id', null);
        } else {
          countQuery = countQuery.eq('folder_id', filters.folderId);
        }
      }
      if (filters.categoryId) {
        countQuery = countQuery.eq('category_id', filters.categoryId);
      }
      if (filters.authorId) {
        countQuery = countQuery.eq('author_id', filters.authorId);
      }
      if (filters.search) {
        countQuery = countQuery.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        countQuery = countQuery.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        countQuery = countQuery.lte('created_at', filters.dateTo);
      }

      const { count: totalCount, error: countError } = await countQuery;

      if (countError) {
        console.error('Error getting SOP count:', countError);
      }

      // Get assignment and acknowledgment counts for each SOP
      const sopsWithCounts = await Promise.all(
        (sops || []).map(async (sop) => {
          const [assignmentCount, acknowledgedCount] = await Promise.all([
            this.getSOPAssignmentCount(sop.id),
            this.getSOPAcknowledgedCount(sop.id)
          ]);

          return {
            ...sop,
            assignmentCount,
            acknowledgedCount
          };
        })
      );

      return {
        sops: sopsWithCounts,
        total: totalCount || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching SOPs:', error);
      throw error;
    }
  }

  /**
   * Get a single SOP by ID with all related data
   */
  static async getSOPById(id: string): Promise<SOPWithDetails | null> {
    try {
      const { data: sop, error } = await supabase
        .from('sops')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching SOP by ID:', error);
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        throw error;
      }

      return sop as SOPWithDetails;
    } catch (error) {
      console.error('Error in getSOPById:', error);
      throw error;
    }
  }

  /**
   * Get working copies (draft SOPs) for a user or specific SOP
   */
  static async getWorkingCopies(sopId?: string): Promise<SOPWithDetails[]> {
    try {
      let query = supabase
        .from('sops')
        .select(`
          *,
          author:users!author_id(id, first_name, last_name, email, avatar_url),
          reviewer:users!reviewer_id(id, first_name, last_name, email, avatar_url),
          approver:users!approved_by(id, first_name, last_name, email, avatar_url),
          folder:sop_folders!folder_id(id, name, color, icon),
          category:sop_categories!category_id(id, name, color, icon)
        `)
        .eq('status', 'draft')
        .is('deleted_at', null);

      if (sopId) {
        query = query.eq('id', sopId);
      }

      const { data: workingCopies, error } = await query;

      if (error) throw error;

      return workingCopies || [];
    } catch (error) {
      console.error('Error fetching working copies:', error);
      throw error;
    }
  }

  /**
   * Create a new SOP
   */
  static async createSOP(data: CreateSOPData, authorId: string): Promise<SOPWithDetails> {
    try {
      // Get current user's company_id
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', authorId)
        .single();

      if (userError) throw userError;

      const sopData: DatabaseSopInsert = {
        title: data.title,
        description: data.description,
        content: data.content,
        folder_id: data.folderId,
        category_id: data.categoryId,
        department: data.department,
        priority: data.priority || 'medium',
        tags: data.tags,
        review_frequency: data.reviewFrequency,
        expires_at: data.expiresAt,
        company_id: currentUser.company_id,
        author_id: authorId,
        status: 'draft',
        version: '1.0',
        view_count: 0,
        download_count: 0,
        comments_enabled: true,
        locked: false,
        ai_generated: false
      };

      const { data: sop, error } = await supabase
        .from('sops')
        .insert([sopData])
        .select(`
          *,
          author:users!author_id(id, first_name, last_name, email, avatar_url),
          folder:sop_folders!folder_id(id, name, color, icon),
          category:sop_categories!category_id(id, name, color, icon)
        `)
        .single();

      if (error) throw error;

      // Create assignments if specified
      if (data.assignees?.length) {
        await this.assignSOPToUsers(sop.id, data.assignees, authorId);
      }

      // Log audit event
      await this.logAuditEvent('sop_created', 'sop', sop.id, null, sop, authorId);

      return sop;
    } catch (error) {
      console.error('Error creating SOP:', error);
      throw error;
    }
  }

  /**
   * Update an existing SOP
   */
  static async updateSOP(id: string, data: Partial<CreateSOPData>, userId: string): Promise<SOPWithDetails> {
    try {
      const updateData: DatabaseSopUpdate = {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content && { content: data.content }),
        ...(data.folderId !== undefined && { folder_id: data.folderId }),
        ...(data.categoryId !== undefined && { category_id: data.categoryId }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.priority && { priority: data.priority }),
        ...(data.tags !== undefined && { tags: data.tags }),
        ...(data.reviewFrequency !== undefined && { review_frequency: data.reviewFrequency }),
        ...(data.expiresAt !== undefined && { expires_at: data.expiresAt }),
        updated_at: new Date().toISOString()
      };

      const { data: sop, error } = await supabase
        .from('sops')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          author:users!author_id(id, first_name, last_name, email, avatar_url),
          folder:sop_folders!folder_id(id, name, color, icon),
          category:sop_categories!category_id(id, name, color, icon)
        `)
        .single();

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('sop_updated', 'sop', id, null, updateData, userId);

      return sop;
    } catch (error) {
      console.error('Error updating SOP:', error);
      throw error;
    }
  }

  /**
   * Delete a SOP (soft delete)
   */
  static async deleteSOP(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sops')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('sop_deleted', 'sop', id, null, { deleted: true }, userId);
    } catch (error) {
      console.error('Error deleting SOP:', error);
      throw error;
    }
  }

  /**
   * Publish a SOP
   */
  static async publishSOP(id: string, userId: string): Promise<SOPWithDetails> {
    try {
      const publishData: DatabaseSopUpdate = {
        status: 'published',
        published_at: new Date().toISOString(),
        approved_by: userId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: sop, error } = await supabase
        .from('sops')
        .update(publishData)
        .eq('id', id)
        .select(`
          *,
          author:users!author_id(id, first_name, last_name, email, avatar_url),
          folder:sop_folders!folder_id(id, name, color, icon),
          category:sop_categories!category_id(id, name, color, icon)
        `)
        .single();

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('sop_published', 'sop', id, null, publishData, userId);

      return sop;
    } catch (error) {
      console.error('Error publishing SOP:', error);
      throw error;
    }
  }

  // ============ FOLDER MANAGEMENT ============

  /**
   * Get folder hierarchy with SOP counts
   */
  static async getFolders(parentId: string | null = null): Promise<FolderWithSOPCount[]> {
    try {
      let query = supabase
        .from('sop_folders')
        .select('*')
        .order('sort_order');

      if (parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }

      const { data: folders, error } = await query;

      if (error) throw error;

      const foldersWithCounts = await Promise.all(
        (folders || []).map(async (folder) => {
          const [sopCount, children] = await Promise.all([
            this.getFolderSOPCount(folder.id),
            this.getFolders(folder.id)
          ]);

          return {
            ...folder,
            sopCount,
            children
          };
        })
      );

      return foldersWithCounts;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  }

  /**
   * Create a new folder
   */
  static async createFolder(data: {
    name: string;
    description?: string;
    parentId?: string;
    color?: string;
    icon?: string;
  }, userId: string): Promise<DatabaseSopFolder> {
    try {
      // Get current user's company_id
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const folderData: DatabaseSopFolderInsert = {
        name: data.name,
        description: data.description,
        parent_id: data.parentId,
        color: data.color,
        icon: data.icon,
        sort_order: 0,
        depth: data.parentId ? await this.getFolderDepth(data.parentId) + 1 : 0,
        company_id: currentUser.company_id,
        created_by: userId
      };

      const { data: folder, error } = await supabase
        .from('sop_folders')
        .insert([folderData])
        .select()
        .single();

      if (error) throw error;

      // Update path
      await this.updateFolderPath(folder.id);

      // Log audit event
      await this.logAuditEvent('folder_created', 'sop_folder', folder.id, null, folder, userId);

      return folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Update folder
   */
  static async updateFolder(id: string, data: Partial<{
    name: string;
    description: string;
    color: string;
    icon: string;
  }>, userId: string): Promise<DatabaseSopFolder> {
    try {
      const { data: folder, error } = await supabase
        .from('sop_folders')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('folder_updated', 'sop_folder', id, null, data, userId);

      return folder;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  }

  /**
   * Delete folder (and move SOPs to parent or root)
   */
  static async deleteFolder(id: string, userId: string): Promise<void> {
    try {
      // Get folder info
      const { data: folder } = await supabase
        .from('sop_folders')
        .select('parent_id')
        .eq('id', id)
        .single();

      // Move SOPs to parent folder
      await supabase
        .from('sops')
        .update({ folder_id: folder?.parent_id })
        .eq('folder_id', id);

      // Move child folders to parent
      await supabase
        .from('sop_folders')
        .update({ parent_id: folder?.parent_id })
        .eq('parent_id', id);

      // Delete folder
      const { error } = await supabase
        .from('sop_folders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('folder_deleted', 'sop_folder', id, null, { deleted: true }, userId);
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  }

  // ============ ASSIGNMENTS ============

  /**
   * Test assignment functionality
   */
  static async testAssignments(): Promise<void> {
    try {
      console.log('Testing sop_assignments table access...');
      
      // Test if we can read from the table
      const { data: existingAssignments, error: readError } = await supabase
        .from('sop_assignments')
        .select('*')
        .limit(1);
      
      if (readError) {
        console.error('Error reading sop_assignments table:', readError);
        throw readError;
      }
      
      console.log('sop_assignments table accessible. Sample data:', existingAssignments);
      
      // Test enum values
      console.log('Testing enum values...');
      const testData = {
        sop_id: 'test-sop-id',
        user_id: 'test-user-id',
        assigned_by: 'test-admin-id',
        due_date: new Date().toISOString(),
        priority: 'medium' as const,
        status: 'pending' as const,
        notes: 'Test assignment'
      };
      
      console.log('Test assignment data:', testData);
      console.log('Assignment backend test completed successfully');
      
    } catch (error) {
      console.error('Assignment backend test failed:', error);
      throw error;
    }
  }

  /**
   * Assign SOP to users
   */
  static async assignSOPToUsers(sopId: string, userIds: string[], assignedBy: string, options: {
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
  } = {}): Promise<DatabaseSopAssignment[]> {
    try {
      console.log('SOPService.assignSOPToUsers: Starting assignment');
      console.log('SOPService.assignSOPToUsers: SOP ID:', sopId);
      console.log('SOPService.assignSOPToUsers: User IDs:', userIds);
      console.log('SOPService.assignSOPToUsers: Assigned by:', assignedBy);
      console.log('SOPService.assignSOPToUsers: Options:', options);

      // Validate inputs
      if (!sopId || !userIds.length || !assignedBy) {
        throw new Error('Missing required parameters: sopId, userIds, or assignedBy');
      }

      // First, get the SOP to retrieve its company_id
      const { data: sop, error: sopError } = await supabase
        .from('sops')
        .select('id, company_id')
        .eq('id', sopId)
        .single();

      if (sopError || !sop) {
        console.error('SOPService.assignSOPToUsers: Failed to fetch SOP:', sopError);
        throw new Error('SOP not found or access denied');
      }

      console.log('SOPService.assignSOPToUsers: SOP company_id:', sop.company_id);

      const assignmentData: DatabaseSopAssignmentInsert[] = userIds.map(userId => ({
        sop_id: sopId,
        user_id: userId,
        assigned_by: assignedBy,
        company_id: sop.company_id,
        due_date: options.dueDate || null,
        priority: options.priority || 'medium',
        notes: options.notes || null,
        status: 'pending'
      }));

      console.log('SOPService.assignSOPToUsers: Assignment data prepared:', assignmentData);

      // First check if assignments already exist to avoid duplicates
      const { data: existingAssignments } = await supabase
        .from('sop_assignments')
        .select('user_id')
        .eq('sop_id', sopId)
        .in('user_id', userIds);

      const existingUserIds = existingAssignments?.map(a => a.user_id) || [];
      const newUserIds = userIds.filter(id => !existingUserIds.includes(id));

      if (newUserIds.length === 0) {
        console.log('SOPService.assignSOPToUsers: All users already assigned to this SOP');
        return [];
      }

      const newAssignmentData = assignmentData.filter(a => newUserIds.includes(a.user_id));
      console.log('SOPService.assignSOPToUsers: New assignments to create:', newAssignmentData);

      const { data: assignments, error } = await supabase
        .from('sop_assignments')
        .insert(newAssignmentData)
        .select();

      if (error) {
        console.error('SOPService.assignSOPToUsers: Database error:', error);
        console.error('SOPService.assignSOPToUsers: Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('SOPService.assignSOPToUsers: Assignments created successfully:', assignments);

      // Log audit event
      console.log('SOPService.assignSOPToUsers: Logging audit event');
      try {
        await this.logAuditEvent(
          'assign_sop',
          'sop_assignment',
          sopId,
          null,
          { userIds: newUserIds, options },
          assignedBy
        );
        console.log('SOPService.assignSOPToUsers: Audit event logged successfully');
      } catch (auditError) {
        console.warn('SOPService.assignSOPToUsers: Failed to log audit event (non-critical):', auditError);
      }

      console.log('SOPService.assignSOPToUsers: Assignment process completed successfully');
      return assignments;
    } catch (error) {
      console.error('SOPService.assignSOPToUsers: Assignment failed:', error);
      throw error;
    }
  }

  /**
   * Get SOP assignments
   */
  static async getSOPAssignments(sopId: string): Promise<any[]> {
    try {
      const { data: assignments, error } = await supabase
        .from('sop_assignments')
        .select(`
          *,
          user:users!user_id(id, first_name, last_name, email, avatar_url),
          assigned_by_user:users!assigned_by(id, first_name, last_name, email)
        `)
        .eq('sop_id', sopId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return assignments || [];
    } catch (error) {
      console.error('Error fetching SOP assignments:', error);
      throw error;
    }
  }

  // ============ FILE MANAGEMENT ============

  /**
   * Upload file to Supabase storage and create attachment record
   */
  static async uploadSOPFile(file: File, sopId: string, uploadedBy: string): Promise<DatabaseFileAttachment> {
    try {
      // Get current user's company_id
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', uploadedBy)
        .single();

      if (userError) throw userError;

      const fileExt = file.name.split('.').pop();
      const fileName = `${sopId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sop-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sop-documents')
        .getPublicUrl(fileName);

      // Create attachment record
      const attachmentData: DatabaseFileAttachmentInsert = {
        company_id: currentUser.company_id,
        resource_type: 'sop',
        resource_id: sopId,
        filename: fileName,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_url: publicUrl,
        uploaded_by: uploadedBy,
        metadata: {
          uploadPath: uploadData.path
        }
      };

      const { data: attachment, error } = await supabase
        .from('file_attachments')
        .insert([attachmentData])
        .select()
        .single();

      if (error) throw error;

      return attachment;
    } catch (error) {
      console.error('Error uploading SOP file:', error);
      throw error;
    }
  }

  // ============ COLLABORATION FEATURES ============

  /**
   * Get collaborators for a SOP
   */
  static async getCollaborators(sopId: string): Promise<any[]> {
    try {
      const { data: collaborations, error } = await supabase
        .from('document_collaborations')
        .select(`
          *,
          user:users!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .eq('sop_id', sopId)
        .eq('status', 'active')
        .order('last_activity', { ascending: false });

      if (error) throw error;

      return collaborations || [];
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }
  }

  /**
   * Add collaborator to SOP
   */
  static async addCollaborator(sopId: string, userId: string, addedBy: string): Promise<any> {
    try {
      const collaborationData = {
        sop_id: sopId,
        user_id: userId,
        session_id: crypto.randomUUID(),
        status: 'active',
        last_activity: new Date().toISOString(),
        joined_at: new Date().toISOString()
      };

      const { data: collaboration, error } = await supabase
        .from('document_collaborations')
        .insert([collaborationData])
        .select(`
          *,
          user:users!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('collaborator_added', 'sop_collaboration', sopId, null, 
        { collaboratorId: userId }, addedBy);

      return collaboration;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  // ============ COMMENTS SYSTEM ============

  /**
   * Get comments for a SOP
   */
  static async getComments(sopId: string): Promise<any[]> {
    try {
      const { data: comments, error } = await supabase
        .from('sop_comments')
        .select(`
          *,
          user:users!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .eq('sop_id', sopId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Add comment to SOP
   */
  static async addComment(sopId: string, content: string, userId: string): Promise<any> {
    try {
      const commentData = {
        sop_id: sopId,
        user_id: userId,
        content: content,
        mentions: [],
        attachments: [],
        reactions: {},
        is_resolved: false
      };

      const { data: comment, error } = await supabase
        .from('sop_comments')
        .insert([commentData])
        .select(`
          *,
          user:users!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Log audit event
      await this.logAuditEvent('comment_added', 'sop_comment', sopId, null, 
        { commentId: comment.id, content }, userId);

      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Resolve comment
   */
  static async resolveComment(commentId: string, userId: string): Promise<any> {
    try {
      const { data: comment, error } = await supabase
        .from('sop_comments')
        .update({
          is_resolved: true,
          resolved_by: userId,
          resolved_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select(`
          *,
          user:users!user_id(id, first_name, last_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      return comment;
    } catch (error) {
      console.error('Error resolving comment:', error);
      throw error;
    }
  }

  // ============ VERSION CONTROL ============

  /**
   * Get version history for a SOP
   */
  static async getVersionHistory(sopId: string): Promise<any[]> {
    try {
      const { data: versions, error } = await supabase
        .from('sop_versions')
        .select(`
          *,
          author:users!author_id(id, first_name, last_name, email, avatar_url)
        `)
        .eq('sop_id', sopId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return versions || [];
    } catch (error) {
      console.error('Error fetching version history:', error);
      throw error;
    }
  }

  /**
   * Create new version when SOP is updated
   */
  static async createVersion(sopId: string, sopData: any, changeSummary: string, authorId: string): Promise<any> {
    try {
      const versionData = {
        sop_id: sopId,
        version: sopData.version || '1.0',
        title: sopData.title,
        content: sopData.content,
        description: sopData.description,
        document_url: sopData.document_url,
        change_summary: changeSummary,
        author_id: authorId
      };

      const { data: version, error } = await supabase
        .from('sop_versions')
        .insert([versionData])
        .select(`
          *,
          author:users!author_id(id, first_name, last_name, email, avatar_url)
        `)
        .single();

      if (error) throw error;

      return version;
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  }

  // ============ REAL-TIME FEATURES ============

  /**
   * Subscribe to SOP changes for real-time collaboration
   */
  static subscribeToSOPChanges(sopId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`sop-${sopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sops',
          filter: `id=eq.${sopId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sop_comments',
          filter: `sop_id=eq.${sopId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'document_collaborations',
          filter: `sop_id=eq.${sopId}`
        },
        callback
      )
      .subscribe();

    return channel;
  }

  /**
   * Update collaboration status (active cursor position, etc.)
   */
  static async updateCollaborationStatus(sopId: string, userId: string, status: any): Promise<void> {
    try {
      await supabase
        .from('document_collaborations')
        .update({
          cursor_position: status.cursorPosition,
          active_block_id: status.activeBlockId,
          last_activity: new Date().toISOString(),
          status: 'active'
        })
        .eq('sop_id', sopId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating collaboration status:', error);
    }
  }

  // ============ HELPER METHODS ============

  private static async getSOPAssignmentCount(sopId: string): Promise<number> {
    const { count } = await supabase
      .from('sop_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('sop_id', sopId);
    return count || 0;
  }

  private static async getSOPAcknowledgedCount(sopId: string): Promise<number> {
    const { count } = await supabase
      .from('acknowledgments')
      .select('*', { count: 'exact', head: true })
      .eq('sop_id', sopId);
    return count || 0;
  }

  private static async getFolderSOPCount(folderId: string): Promise<number> {
    const { count } = await supabase
      .from('sops')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', folderId)
      .is('deleted_at', null);
    return count || 0;
  }

  private static async getFolderDepth(folderId: string): Promise<number> {
    const { data: folder } = await supabase
      .from('sop_folders')
      .select('depth')
      .eq('id', folderId)
      .single();
    return folder?.depth || 0;
  }

  private static async updateFolderPath(folderId: string): Promise<void> {
    // Implementation to update folder path based on hierarchy
    // This would build the full path string for the folder
  }

  private static async logAuditEvent(
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues: any,
    newValues: any,
    userId: string
  ): Promise<void> {
    try {
      // Get current user's company_id
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error getting user company for audit log:', userError);
        return; // Don't fail the main operation if audit logging fails
      }

      await supabase
        .from('audit_logs')
        .insert([{
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_values: oldValues,
          new_values: newValues,
          user_id: userId,
          company_id: currentUser.company_id,
          metadata: {}
        }]);
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }
}

// Expose test function to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).testSOPAssignments = SOPService.testAssignments;
  console.log('SOPService test function exposed as window.testSOPAssignments()');
}