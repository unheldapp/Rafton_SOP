import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { 
  Bell, 
  FileText, 
  Clock, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  Mail,
  ExternalLink,
  Filter,
  X,
  Calendar,
  User,
  Building,
  Trash2,
  Archive,
  Loader2
} from 'lucide-react';
import { useAuth } from "../../../shared/context/AuthContext";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { Notification } from "../../../shared/services/notificationService";

export function NotificationsPage() {
  const { currentUser } = useAuth();
  const {
    filteredNotifications,
    stats: notificationCounts,
    loading,
    error,
    filters,
    selectedNotification,
    setFilters,
    clearFilters,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshNotifications,
    setSelectedNotification
  } = useNotifications(currentUser?.id || null);

  const getNotificationIcon = (type: string) => {
    const icons = {
      assigned: FileText,
      reminder: Clock,
      updated: RefreshCcw,
      deadline: AlertCircle,
      general: Bell
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationColor = (type: string, priority: string) => {
    const urgentColors = 'bg-red-100 text-red-700';
    const highColors = 'bg-orange-100 text-orange-700';
    const mediumColors = 'bg-blue-100 text-blue-700';
    const lowColors = 'bg-gray-100 text-gray-700';

    if (priority === 'urgent') return urgentColors;
    if (priority === 'high') return highColors;
    if (priority === 'medium') return mediumColors;
    return lowColors;
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      urgent: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Urgent' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'High' },
      medium: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Medium' },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Low' }
    };
    
    const config = configs[priority as keyof typeof configs] || configs.medium;
    return (
      <Badge variant="outline" className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setSelectedNotification(notification.id);
    
    // In a real app, this would navigate to the document
    if (notification.documentId) {
      console.log(`Navigating to document: ${notification.documentTitle}`);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({ [filterType]: value });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshNotifications} variant="outline">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasActiveFilters = filters.type !== 'all' || filters.status !== 'all' || filters.priority !== 'all';

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Stay updated with important compliance alerts</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assigned">SOP Assigned</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="updated">SOP Updated</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
              {notificationCounts.unread > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button onClick={refreshNotifications} variant="outline" size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{notificationCounts.total}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-amber-600">{notificationCounts.unread}</p>
                </div>
                <Mail className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{notificationCounts.urgent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-emerald-600">{notificationCounts.today}</p>
                </div>
                <Calendar className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  {filteredNotifications.length} of {notificationCounts.total} notifications
                  {hasActiveFilters && ' (filtered)'}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear Filters
                  </Button>
                )}
                <Filter className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const isSelected = selectedNotification === notification.id;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                        notification.isRead 
                          ? 'bg-white border-gray-200' 
                          : 'bg-blue-50 border-blue-200 shadow-sm'
                      } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(notification.priority)}
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.date)}
                              </span>
                            </div>
                          </div>
                          
                          <p className={`text-sm mb-3 ${notification.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {notification.sender && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{notification.sender}</span>
                                </div>
                              )}
                              {notification.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Due: {new Date(notification.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {notification.documentId && (
                                <Button variant="ghost" size="sm" className="text-xs">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View Document
                                </Button>
                              )}
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id);
                                }}
                              >
                                {notification.isRead ? (
                                  <>
                                    <Mail className="w-3 h-3 mr-1" />
                                    Mark Unread
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Mark Read
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more notifications'
                    : 'You\'re all caught up! No new notifications.'
                  }
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}