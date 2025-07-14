import { useState, useEffect, useCallback, useMemo } from 'react';
import { NotificationService, Notification, NotificationStats, NotificationFilters } from '../services/notificationService';

interface UseNotificationsState {
  notifications: Notification[];
  filteredNotifications: Notification[];
  stats: NotificationStats;
  loading: boolean;
  error: string | null;
  filters: NotificationFilters;
  selectedNotification: string | null;
}

interface UseNotificationsActions {
  setFilters: (filters: Partial<NotificationFilters>) => void;
  clearFilters: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAsUnread: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  setSelectedNotification: (id: string | null) => void;
  getUnreadCount: () => Promise<number>;
}

export function useNotifications(userId: string | null): UseNotificationsState & UseNotificationsActions {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    urgent: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<NotificationFilters>({
    type: 'all',
    status: 'all',
    priority: 'all'
  });
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  // Fetch notifications and stats
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching notifications for user:', userId);
      console.log('Current filters:', filters);

      // Fetch notifications and stats in parallel
      const [notificationsData, statsData] = await Promise.all([
        NotificationService.getUserNotifications(userId, { 
          ...filters,
          limit: 100 // Get more notifications for better filtering
        }),
        NotificationService.getUserNotificationStats(userId)
      ]);

      console.log('Notifications data fetched:', {
        notifications: notificationsData.length,
        stats: statsData
      });

      setNotifications(notificationsData);
      setStats(statsData);

    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    console.log('Setting up real-time notification subscription');
    
    const subscription = NotificationService.subscribeToNotifications(userId, (payload) => {
      console.log('Real-time notification update:', payload);
      
      // Refresh notifications when there's a change
      fetchNotifications();
    });

    return () => {
      console.log('Cleaning up notification subscription');
      NotificationService.unsubscribeFromNotifications(subscription);
    };
  }, [userId, fetchNotifications]);

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === filters.type);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'read') {
        filtered = filtered.filter(notification => notification.isRead);
      } else if (filters.status === 'unread') {
        filtered = filtered.filter(notification => !notification.isRead);
      }
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(notification => notification.priority === filters.priority);
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [notifications, filters]);

  // Update filters
  const setFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    console.log('Setting filters:', newFilters);
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    console.log('Clearing filters');
    setFiltersState({
      type: 'all',
      status: 'all',
      priority: 'all'
    });
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));

      console.log('Notification marked as read:', notificationId);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, []);

  // Mark notification as unread
  const markAsUnread = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsUnread(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        )
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: prev.unread + 1
      }));

      console.log('Notification marked as unread:', notificationId);
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark notification as unread');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await NotificationService.markAllAsRead(userId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0
      }));

      console.log('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [userId]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      
      // Find the notification to check if it was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      const wasUnread = deletedNotification && !deletedNotification.isRead;
      
      // Optimistically update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        unread: wasUnread ? Math.max(0, prev.unread - 1) : prev.unread
      }));

      // Clear selection if this notification was selected
      if (selectedNotification === notificationId) {
        setSelectedNotification(null);
      }

      console.log('Notification deleted:', notificationId);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, [notifications, selectedNotification]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    if (!userId) return;

    try {
      await NotificationService.deleteAllRead(userId);
      
      // Optimistically update local state
      const readCount = notifications.filter(n => n.isRead).length;
      setNotifications(prev => prev.filter(n => !n.isRead));

      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - readCount)
      }));

      console.log('All read notifications deleted');
    } catch (err) {
      console.error('Error deleting read notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete read notifications');
    }
  }, [userId, notifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Get unread count (for sidebar)
  const getUnreadCount = useCallback(async (): Promise<number> => {
    if (!userId) return 0;
    
    try {
      return await NotificationService.getUnreadCount(userId);
    } catch (err) {
      console.error('Error getting unread count:', err);
      return 0;
    }
  }, [userId]);

  // Calculate notification counts for display
  const notificationCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      today: notifications.filter(n => new Date(n.date) >= today).length
    };
  }, [notifications]);

  return {
    // State
    notifications,
    filteredNotifications,
    stats: notificationCounts, // Use calculated counts for real-time accuracy
    loading,
    error,
    filters,
    selectedNotification,
    
    // Actions
    setFilters,
    clearFilters,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications,
    setSelectedNotification,
    getUnreadCount
  };
} 