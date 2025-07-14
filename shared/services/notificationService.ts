import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'assigned' | 'reminder' | 'updated' | 'deadline' | 'general';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  documentId?: string;
  documentTitle?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender?: string;
  dueDate?: string;
  expiresAt?: string;
  data?: any;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  today: number;
}

export interface NotificationFilters {
  type?: 'all' | 'assigned' | 'reminder' | 'updated' | 'deadline' | 'general';
  status?: 'all' | 'read' | 'unread';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
}

export class NotificationService {
  /**
   * Get notifications for a specific user
   */
  static async getUserNotifications(userId: string, filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      console.log('Fetching notifications for user:', userId);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'read') {
          query = query.eq('read', true);
        } else if (filters.status === 'unread') {
          query = query.eq('read', false);
        }
      }

      // Apply priority filter
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      // Filter out expired notifications
      query = query.or('expires_at.is.null,expires_at.gte.' + new Date().toISOString());

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data: notifications, error } = await query;

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      if (!notifications || notifications.length === 0) {
        console.log('No notifications found for user:', userId);
        return [];
      }

      console.log('Raw notifications:', notifications);

      // Transform database notifications to our interface
      const transformedNotifications: Notification[] = notifications.map((notification: any) => {
        const data = notification.data || {};
        
        return {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          date: notification.created_at,
          isRead: notification.read,
          priority: notification.priority,
          documentId: data.documentId,
          documentTitle: data.documentTitle,
          sender: data.sender,
          dueDate: data.dueDate,
          expiresAt: notification.expires_at,
          data: data
        };
      });

      console.log('Transformed notifications:', transformedNotifications);
      return transformedNotifications;

    } catch (error) {
      console.error('Error in getUserNotifications:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics for a user
   */
  static async getUserNotificationStats(userId: string): Promise<NotificationStats> {
    try {
      console.log('Fetching notification stats for user:', userId);

      // Get all valid (non-expired) notifications for the user
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('id, read, priority, created_at')
        .eq('user_id', userId)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString());

      if (error) {
        console.error('Error fetching notification stats:', error);
        throw error;
      }

      if (!notifications) {
        return { total: 0, unread: 0, urgent: 0, today: 0 };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        urgent: notifications.filter(n => n.priority === 'urgent').length,
        today: notifications.filter(n => new Date(n.created_at) >= today).length
      };

      console.log('Notification stats:', stats);
      return stats;

    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      console.log('Marking notification as read:', notificationId);

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      console.log('Notification marked as read successfully');
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as unread
   */
  static async markAsUnread(notificationId: string): Promise<void> {
    try {
      console.log('Marking notification as unread:', notificationId);

      const { error } = await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as unread:', error);
        throw error;
      }

      console.log('Notification marked as unread successfully');
    } catch (error) {
      console.error('Error in markAsUnread:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      console.log('Marking all notifications as read for user:', userId);

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      console.log('All notifications marked as read successfully');
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      console.log('Deleting notification:', notificationId);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }

      console.log('Notification deleted successfully');
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      throw error;
    }
  }

  /**
   * Delete all read notifications for a user
   */
  static async deleteAllRead(userId: string): Promise<void> {
    try {
      console.log('Deleting all read notifications for user:', userId);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('read', true);

      if (error) {
        console.error('Error deleting read notifications:', error);
        throw error;
      }

      console.log('All read notifications deleted successfully');
    } catch (error) {
      console.error('Error in deleteAllRead:', error);
      throw error;
    }
  }

  /**
   * Create a new notification (for admin use)
   */
  static async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    data?: any;
    expiresAt?: string;
  }): Promise<Notification> {
    try {
      console.log('Creating notification:', notification);

      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority || 'medium',
          data: notification.data || {},
          expires_at: notification.expiresAt
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      if (!newNotification) {
        throw new Error('Failed to create notification');
      }

      // Transform to our interface
      const data = newNotification.data || {};
      const transformed: Notification = {
        id: newNotification.id,
        type: newNotification.type,
        title: newNotification.title,
        message: newNotification.message,
        date: newNotification.created_at,
        isRead: newNotification.read,
        priority: newNotification.priority,
        documentId: data.documentId,
        documentTitle: data.documentTitle,
        sender: data.sender,
        dueDate: data.dueDate,
        expiresAt: newNotification.expires_at,
        data: data
      };

      console.log('Notification created successfully:', transformed);
      return transformed;

    } catch (error) {
      console.error('Error in createNotification:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user (for sidebar badge)
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString());

      if (error) {
        console.error('Error getting unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }

  /**
   * Subscribe to real-time notification updates
   */
  static subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    console.log('Subscribing to notifications for user:', userId);

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  }

  /**
   * Unsubscribe from real-time updates
   */
  static unsubscribeFromNotifications(subscription: any) {
    console.log('Unsubscribing from notifications');
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
} 