import { supabase } from './supabase';
import { SOPWithDetails } from './sopService';
import { User } from '../types';

export interface WorkingCopy {
  id: string;
  sop_id: string;
  user_id: string;
  title: string;
  content: string;
  description: string | null;
  changes: Record<string, any>;
  is_submitted: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  sop: SOPWithDetails;
  user: User;
  reviews?: WorkingCopyReview[];
}

export interface WorkingCopyReview {
  id: string;
  working_copy_id: string;
  reviewer_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  comments: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Relations
  reviewer: User;
}

export interface CreateWorkingCopyData {
  sopId: string;
  title?: string;
  content?: string;
  description?: string;
}

export interface UpdateWorkingCopyData {
  title?: string;
  content?: string;
  description?: string;
  changes?: Record<string, any>;
}

export interface SubmitForReviewData {
  reviewers: string[];
  summary: string;
}

export class WorkingCopyService {
  /**
   * Create a new working copy from a published SOP
   */
  static async createWorkingCopy(data: CreateWorkingCopyData): Promise<WorkingCopy> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First, get the original SOP data
    const { data: sopData, error: sopError } = await supabase
      .from('sops')
      .select('*')
      .eq('id', data.sopId)
      .single();

    if (sopError) throw sopError;
    if (!sopData) throw new Error('SOP not found');

    // Check if user already has a working copy for this SOP
    const { data: existingCopy } = await supabase
      .from('working_copies')
      .select('id')
      .eq('sop_id', data.sopId)
      .eq('user_id', user.id)
      .single();

    if (existingCopy) {
      throw new Error('You already have a working copy for this SOP');
    }

    // Create the working copy
    const { data: workingCopy, error } = await supabase
      .from('working_copies')
      .insert({
        sop_id: data.sopId,
        user_id: user.id,
        title: data.title || sopData.title,
        content: data.content || sopData.content,
        description: data.description || sopData.description,
        changes: {
          created_from_version: sopData.version,
          original_title: sopData.title,
          original_content: sopData.content,
          original_description: sopData.description,
          original_department: sopData.department
        },
        is_submitted: false
      })
      .select(`
        *,
        sop:sops(*),
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return workingCopy;
  }

  /**
   * Get working copy by ID
   */
  static async getWorkingCopyById(id: string): Promise<WorkingCopy> {
    const { data, error } = await supabase
      .from('working_copies')
      .select(`
        *,
        sop:sops(*),
        user:users(*),
        reviews:working_copy_reviews(
          *,
          reviewer:users(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get all working copies for current user
   */
  static async getUserWorkingCopies(): Promise<WorkingCopy[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('working_copies')
      .select(`
        *,
        sop:sops(*),
        user:users(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all working copies for a specific SOP
   */
  static async getSOPWorkingCopies(sopId: string): Promise<WorkingCopy[]> {
    const { data, error } = await supabase
      .from('working_copies')
      .select(`
        *,
        sop:sops(*),
        user:users(*),
        reviews:working_copy_reviews(
          *,
          reviewer:users(*)
        )
      `)
      .eq('sop_id', sopId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending working copies for review (for admins)
   */
  static async getPendingWorkingCopies(): Promise<WorkingCopy[]> {
    const { data, error } = await supabase
      .from('working_copies')
      .select(`
        *,
        sop:sops(*),
        user:users(*),
        reviews:working_copy_reviews(
          *,
          reviewer:users(*)
        )
      `)
      .eq('is_submitted', true)
      .order('submitted_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update a working copy
   */
  static async updateWorkingCopy(id: string, updates: UpdateWorkingCopyData): Promise<WorkingCopy> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current working copy to check ownership
    const { data: currentCopy } = await supabase
      .from('working_copies')
      .select('user_id, is_submitted')
      .eq('id', id)
      .single();

    if (!currentCopy) throw new Error('Working copy not found');
    if (currentCopy.user_id !== user.id) throw new Error('Unauthorized');
    if (currentCopy.is_submitted) throw new Error('Cannot edit submitted working copy');

    const { data, error } = await supabase
      .from('working_copies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        sop:sops(*),
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Submit working copy for review
   */
  static async submitForReview(id: string, data: SubmitForReviewData): Promise<WorkingCopy> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current working copy to check ownership
    const { data: currentCopy } = await supabase
      .from('working_copies')
      .select('user_id, is_submitted')
      .eq('id', id)
      .single();

    if (!currentCopy) throw new Error('Working copy not found');
    if (currentCopy.user_id !== user.id) throw new Error('Unauthorized');
    if (currentCopy.is_submitted) throw new Error('Working copy already submitted');

    // Start transaction
    const { data: updatedCopy, error: updateError } = await supabase
      .from('working_copies')
      .update({
        is_submitted: true,
        submitted_at: new Date().toISOString(),
        changes: {
          ...currentCopy.changes,
          submission_summary: data.summary
        }
      })
      .eq('id', id)
      .select(`
        *,
        sop:sops(*),
        user:users(*)
      `)
      .single();

    if (updateError) throw updateError;

    // Create review records for each reviewer
    const reviewRecords = data.reviewers.map(reviewerId => ({
      working_copy_id: id,
      reviewer_id: reviewerId,
      status: 'pending' as const,
      comments: null,
      reviewed_at: null
    }));

    const { error: reviewError } = await supabase
      .from('working_copy_reviews')
      .insert(reviewRecords);

    if (reviewError) throw reviewError;

    // Send notifications to reviewers
    await this.sendReviewNotifications(id, data.reviewers);

    return updatedCopy;
  }

  /**
   * Approve/reject working copy
   */
  static async reviewWorkingCopy(
    workingCopyId: string,
    reviewId: string,
    status: 'approved' | 'rejected' | 'changes_requested',
    comments?: string
  ): Promise<WorkingCopyReview> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('working_copy_reviews')
      .update({
        status,
        comments: comments || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('reviewer_id', user.id)
      .select(`
        *,
        reviewer:users(*)
      `)
      .single();

    if (error) throw error;

    // Check if all reviewers have approved
    await this.checkAndMergeIfApproved(workingCopyId);

    return data;
  }

  /**
   * Merge approved working copy into original SOP
   */
  static async mergeWorkingCopy(workingCopyId: string): Promise<SOPWithDetails> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get working copy with all reviews
    const { data: workingCopy, error: copyError } = await supabase
      .from('working_copies')
      .select(`
        *,
        sop:sops(*),
        user:users(*),
        reviews:working_copy_reviews(*)
      `)
      .eq('id', workingCopyId)
      .single();

    if (copyError) throw copyError;
    if (!workingCopy) throw new Error('Working copy not found');

    // Check if all reviews are approved
    const allApproved = workingCopy.reviews.every(review => review.status === 'approved');
    if (!allApproved) {
      throw new Error('Working copy has not been fully approved');
    }

    // Create new version of the SOP
    const currentVersion = parseFloat(workingCopy.sop.version);
    const newVersion = (currentVersion + 0.1).toFixed(1);

    // Save current version to versions table
    const { error: versionError } = await supabase
      .from('sop_versions')
      .insert({
        sop_id: workingCopy.sop_id,
        version: workingCopy.sop.version,
        title: workingCopy.sop.title,
        content: workingCopy.sop.content,
        description: workingCopy.sop.description,
        change_summary: `Merged working copy from ${workingCopy.user.first_name} ${workingCopy.user.last_name}`,
        author_id: workingCopy.sop.author_id
      });

    if (versionError) throw versionError;

    // Update the main SOP with all changes
    const updateData: any = {
      title: workingCopy.title,
      content: workingCopy.content,
      description: workingCopy.description,
      version: newVersion,
      updated_at: new Date().toISOString()
    };

    // Apply additional fields from changes if they exist
    if (workingCopy.changes) {
      if (workingCopy.changes.department !== undefined) {
        updateData.department = workingCopy.changes.department;
      }
      if (workingCopy.changes.priority !== undefined) {
        updateData.priority = workingCopy.changes.priority;
      }
      if (workingCopy.changes.categoryId !== undefined) {
        updateData.category_id = workingCopy.changes.categoryId === 'none' ? null : workingCopy.changes.categoryId;
      }
      // Note: teamId is not stored in SOPs table as SOPs don't have teams
    }

    const { data: updatedSOP, error: sopError } = await supabase
      .from('sops')
      .update(updateData)
      .eq('id', workingCopy.sop_id)
      .select('*')
      .single();

    if (sopError) throw sopError;

    // Delete the working copy
    const { error: deleteError } = await supabase
      .from('working_copies')
      .delete()
      .eq('id', workingCopyId);

    if (deleteError) throw deleteError;

    // Send notification to working copy creator
    await this.sendMergeNotification(workingCopy.user_id, workingCopy.sop.title);

    return updatedSOP;
  }

  /**
   * Delete working copy
   */
  static async deleteWorkingCopy(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check ownership
    const { data: currentCopy } = await supabase
      .from('working_copies')
      .select('user_id, is_submitted')
      .eq('id', id)
      .single();

    if (!currentCopy) throw new Error('Working copy not found');
    if (currentCopy.user_id !== user.id) throw new Error('Unauthorized');
    if (currentCopy.is_submitted) throw new Error('Cannot delete submitted working copy');

    const { error } = await supabase
      .from('working_copies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Private helper methods
   */
  private static async checkAndMergeIfApproved(workingCopyId: string): Promise<void> {
    const { data: reviews, error } = await supabase
      .from('working_copy_reviews')
      .select('status')
      .eq('working_copy_id', workingCopyId);

    if (error) throw error;

    const allApproved = reviews.every(review => review.status === 'approved');
    if (allApproved) {
      // Auto-merge if all approved
      await this.mergeWorkingCopy(workingCopyId);
    }
  }

  private static async sendReviewNotifications(workingCopyId: string, reviewerIds: string[]): Promise<void> {
    // Get working copy details
    const { data: workingCopy } = await supabase
      .from('working_copies')
      .select(`
        *,
        sop:sops(title),
        user:users(first_name, last_name)
      `)
      .eq('id', workingCopyId)
      .single();

    if (!workingCopy) return;

    // Create notifications for each reviewer
    const notifications = reviewerIds.map(userId => ({
      user_id: userId,
      type: 'working_copy_review',
      title: 'Working Copy Review Request',
      message: `${workingCopy.user.first_name} ${workingCopy.user.last_name} has submitted a working copy of "${workingCopy.sop.title}" for your review.`,
      data: {
        working_copy_id: workingCopyId,
        sop_title: workingCopy.sop.title,
        author_name: `${workingCopy.user.first_name} ${workingCopy.user.last_name}`
      },
      priority: 'high'
    }));

    await supabase.from('notifications').insert(notifications);
  }

  private static async sendMergeNotification(userId: string, sopTitle: string): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'working_copy_merged',
      title: 'Working Copy Merged',
      message: `Your working copy of "${sopTitle}" has been approved and merged successfully.`,
      data: {
        sop_title: sopTitle
      },
      priority: 'medium'
    });
  }
} 