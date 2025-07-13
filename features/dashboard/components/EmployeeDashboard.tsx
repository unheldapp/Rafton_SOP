import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Eye,
  ChevronRight,
  Activity,
  User,
  Bell,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

interface PendingDocument {
  id: string;
  title: string;
  dueDate: string;
  version: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  assignedDate: string;
  documentType: 'sop' | 'policy' | 'training' | 'procedure';
}

interface RecentActivity {
  id: string;
  type: 'acknowledged' | 'reminder' | 'assigned';
  message: string;
  date: string;
  documentTitle?: string;
}

interface EmployeeDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  onNavigate: (page: string) => void;
}

export function EmployeeDashboard({ currentUser, onNavigate }: EmployeeDashboardProps) {
  // Mock data for pending documents
  const [pendingDocuments] = useState<PendingDocument[]>([
    {
      id: '1',
      title: 'Chemical Handling Procedures',
      dueDate: '2025-07-15T23:59:59Z',
      version: '2.0',
      priority: 'high',
      department: 'Safety',
      assignedDate: '2025-07-10T10:00:00Z',
      documentType: 'sop'
    },
    {
      id: '2',
      title: 'Emergency Response Plan',
      dueDate: '2025-07-12T23:59:59Z',
      version: '3.0',
      priority: 'urgent',
      department: 'Safety',
      assignedDate: '2025-07-08T14:30:00Z',
      documentType: 'procedure'
    },
    {
      id: '3',
      title: 'Workplace Harassment Policy',
      dueDate: '2025-07-20T23:59:59Z',
      version: '2.1',
      priority: 'medium',
      department: 'HR',
      assignedDate: '2025-07-09T09:15:00Z',
      documentType: 'policy'
    },
    {
      id: '4',
      title: 'Data Privacy Training Module',
      dueDate: '2025-07-08T23:59:59Z', // This one is overdue
      version: '1.5',
      priority: 'high',
      department: 'IT',
      assignedDate: '2025-07-01T16:00:00Z',
      documentType: 'training'
    }
  ]);

  // Mock data for recent activity
  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'acknowledged',
      message: 'You acknowledged "Leave Policy" successfully',
      date: '2025-07-06T15:30:00Z',
      documentTitle: 'Leave Policy'
    },
    {
      id: '2',
      type: 'reminder',
      message: 'Reminder: "Emergency Response Plan" is due in 2 days',
      date: '2025-07-10T09:00:00Z',
      documentTitle: 'Emergency Response Plan'
    },
    {
      id: '3',
      type: 'assigned',
      message: 'New document assigned: "Chemical Handling Procedures"',
      date: '2025-07-10T10:00:00Z',
      documentTitle: 'Chemical Handling Procedures'
    },
    {
      id: '4',
      type: 'acknowledged',
      message: 'You acknowledged "Code of Conduct" successfully',
      date: '2025-07-05T11:20:00Z',
      documentTitle: 'Code of Conduct'
    },
    {
      id: '5',
      type: 'reminder',
      message: 'Reminder: "Workplace Harassment Policy" is due in 10 days',
      date: '2025-07-10T08:00:00Z',
      documentTitle: 'Workplace Harassment Policy'
    }
  ]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const pending = pendingDocuments.length;
    const overdue = pendingDocuments.filter(doc => new Date(doc.dueDate) < now).length;
    
    // Mock acknowledged this month (would come from API in real app)
    const acknowledgedThisMonth = 7;
    
    return { pending, overdue, acknowledgedThisMonth };
  }, [pendingDocuments]);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      acknowledged: CheckCircle,
      reminder: Bell,
      assigned: FileText
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      acknowledged: 'text-emerald-600 bg-emerald-50',
      reminder: 'text-amber-600 bg-amber-50',
      assigned: 'text-blue-600 bg-blue-50'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const formatDueDate = (dueDate: string) => {
    const daysUntil = getDaysUntilDue(dueDate);
    const date = new Date(dueDate);
    
    if (daysUntil < 0) {
      return {
        text: `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`,
        color: 'text-red-600 font-medium'
      };
    } else if (daysUntil === 0) {
      return {
        text: 'Due today',
        color: 'text-red-600 font-medium'
      };
    } else if (daysUntil === 1) {
      return {
        text: 'Due tomorrow',
        color: 'text-amber-600 font-medium'
      };
    } else if (daysUntil <= 3) {
      return {
        text: `Due in ${daysUntil} days`,
        color: 'text-amber-600'
      };
    } else {
      return {
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        color: 'text-gray-600'
      };
    }
  };

  const formatActivityDate = (dateString: string) => {
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
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const displayedPendingDocs = pendingDocuments.slice(0, 8);
  const hasMorePending = pendingDocuments.length > 8;

  const displayedActivity = recentActivity.slice(0, 5);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {currentUser.firstName}!
              </h1>
              <p className="text-gray-600">Here's what needs your attention today</p>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Acknowledgments */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('assigned')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Acknowledgments</p>
                  <p className="text-3xl font-bold text-amber-600">{summaryStats.pending}</p>
                  <p className="text-sm text-gray-500 mt-1">Document{summaryStats.pending !== 1 ? 's' : ''} waiting</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-full">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledged This Month */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('history')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Acknowledged This Month</p>
                  <p className="text-3xl font-bold text-emerald-600">{summaryStats.acknowledgedThisMonth}</p>
                  <p className="text-sm text-gray-500 mt-1">Great progress!</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-full">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue (only show if > 0) */}
          {summaryStats.overdue > 0 && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200" onClick={() => onNavigate('assigned')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Overdue Documents</p>
                    <p className="text-3xl font-bold text-red-600">{summaryStats.overdue}</p>
                    <p className="text-sm text-red-500 mt-1">Needs immediate attention</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* If no overdue, show compliance score */}
          {summaryStats.overdue === 0 && (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Compliance Status</p>
                    <p className="text-3xl font-bold text-emerald-600">100%</p>
                    <p className="text-sm text-emerald-500 mt-1">All up to date!</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <Award className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* My Tasks Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>My Tasks</span>
                </CardTitle>
                <CardDescription>
                  Documents requiring your acknowledgment
                  {summaryStats.pending > 0 && ` (${summaryStats.pending} pending)`}
                </CardDescription>
              </div>
              {hasMorePending && (
                <Button variant="outline" onClick={() => onNavigate('assigned')}>
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {displayedPendingDocs.length > 0 ? (
              <div className="space-y-4">
                {displayedPendingDocs.map((doc) => {
                  const dueDateInfo = formatDueDate(doc.dueDate);
                  const overdue = isOverdue(doc.dueDate);
                  
                  return (
                    <div 
                      key={doc.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {doc.title}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500">{doc.department}</span>
                                <Badge variant="outline" className="text-xs">
                                  v{doc.version}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(doc.priority)}`}>
                                  {doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className={dueDateInfo.color}>
                                {dueDateInfo.text}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button 
                            onClick={() => onNavigate('assigned')}
                            className={overdue ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {overdue ? 'Review Now' : 'View & Acknowledge'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-3 bg-emerald-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                <p className="text-gray-500">You don't have any pending document acknowledgments.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Your recent compliance activities and reminders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayedActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClasses = getActivityColor(activity.type);
                
                return (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${colorClasses}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{formatActivityDate(activity.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => onNavigate('history')}
              >
                View Full History
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}