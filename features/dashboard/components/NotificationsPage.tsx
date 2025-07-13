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
  Archive
} from 'lucide-react';

interface Notification {
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
}

interface NotificationsPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function NotificationsPage({ currentUser }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'assigned',
      title: 'New SOP Assigned',
      message: "You've been assigned a new SOP: 'Chemical Handling Procedures'",
      date: '2025-07-10T14:30:00Z',
      isRead: false,
      documentId: '1',
      documentTitle: 'Chemical Handling Procedures',
      priority: 'high',
      sender: 'John Smith',
      dueDate: '2025-07-15'
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Acknowledgment Reminder',
      message: "Reminder: Acknowledge 'Emergency Response Plan' by July 12",
      date: '2025-07-09T09:15:00Z',
      isRead: true,
      documentId: '2',
      documentTitle: 'Emergency Response Plan',
      priority: 'urgent',
      sender: 'Sarah Johnson',
      dueDate: '2025-07-12'
    },
    {
      id: '3',
      type: 'updated',
      title: 'Document Updated',
      message: "'Workplace Harassment Policy' has been updated. Please re-acknowledge.",
      date: '2025-07-08T16:45:00Z',
      isRead: false,
      documentId: '5',
      documentTitle: 'Workplace Harassment Policy',
      priority: 'medium',
      sender: 'Lisa Chen',
      dueDate: '2025-07-20'
    },
    {
      id: '4',
      type: 'deadline',
      title: 'Approaching Deadline',
      message: "'Data Privacy Training' acknowledgment due in 2 days",
      date: '2025-07-08T11:00:00Z',
      isRead: true,
      documentId: '3',
      documentTitle: 'Data Privacy Training',
      priority: 'medium',
      sender: 'Mike Brown',
      dueDate: '2025-07-20'
    },
    {
      id: '5',
      type: 'general',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance on July 15th from 2-4 AM',
      date: '2025-07-07T10:30:00Z',
      isRead: false,
      priority: 'low',
      sender: 'System Administrator'
    },
    {
      id: '6',
      type: 'assigned',
      title: 'Training Module Assigned',
      message: "New training module assigned: 'Cybersecurity Awareness'",
      date: '2025-07-06T13:20:00Z',
      isRead: true,
      documentId: '7',
      documentTitle: 'Cybersecurity Training Module',
      priority: 'medium',
      sender: 'Alex Thompson',
      dueDate: '2025-07-25'
    },
    {
      id: '7',
      type: 'deadline',
      title: 'Overdue Document',
      message: "'Emergency Response Plan' acknowledgment is now overdue",
      date: '2025-07-05T08:00:00Z',
      isRead: false,
      documentId: '2',
      documentTitle: 'Emergency Response Plan',
      priority: 'urgent',
      sender: 'Sarah Johnson'
    }
  ]);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'unread' && !notification.isRead) ||
        (statusFilter === 'read' && notification.isRead);
      
      return matchesType && matchesStatus;
    });
  }, [notifications, typeFilter, statusFilter]);

  // Calculate counts
  const notificationCounts = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      today: notifications.filter(n => {
        const notifDate = new Date(n.date);
        const today = new Date();
        return notifDate.toDateString() === today.toDateString();
      }).length
    };
  }, [notifications]);

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
    if (priority === 'urgent') return 'text-red-600 bg-red-50';
    
    const colors = {
      assigned: 'text-blue-600 bg-blue-50',
      reminder: 'text-amber-600 bg-amber-50',
      updated: 'text-purple-600 bg-purple-50',
      deadline: 'text-red-600 bg-red-50',
      general: 'text-gray-600 bg-gray-50'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Urgent' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'High' },
      medium: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Medium' },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Low' }
    };
    
    const { color, label } = config[priority as keyof typeof config];
    return (
      <Badge variant="outline" className={`${color} text-xs`}>
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification.id);
    
    // In a real app, this would navigate to the document
    if (notification.documentId) {
      console.log(`Navigating to document: ${notification.documentTitle}`);
    }
  };

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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  {filteredNotifications.length} of {notifications.length} notifications
                  {typeFilter !== 'all' && ` • Filtered by: ${typeFilter}`}
                  {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                </CardDescription>
              </div>
              <Filter className="w-5 h-5 text-gray-400" />
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
                  {typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters to see more notifications'
                    : 'You\'re all caught up! No new notifications.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}