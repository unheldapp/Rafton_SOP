import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { useEmployeeDashboard } from "../../../shared/hooks/useEmployeeDashboard";
import { EmployeeAssignment } from "../../../shared/services/assignmentService";
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
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    firstName?: string;
  };
  onNavigate: (page: string) => void;
}

export function EmployeeDashboard({ currentUser, onNavigate }: EmployeeDashboardProps) {
  const { data, loading, error, refreshData, acknowledgeAssignment } = useEmployeeDashboard();
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 text-red-700 bg-red-50';
      case 'high': return 'border-orange-500 text-orange-700 bg-orange-50';
      case 'medium': return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      case 'low': return 'border-green-500 text-green-700 bg-green-50';
      default: return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'acknowledged': return CheckCircle;
      case 'reminder': return Bell;
      case 'assigned': return FileText;
      case 'notification': return Bell;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'acknowledged': return 'bg-emerald-50 text-emerald-600';
      case 'reminder': return 'bg-amber-50 text-amber-600';
      case 'assigned': return 'bg-blue-50 text-blue-600';
      case 'notification': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return { text: 'No due date', color: 'text-gray-500' };
    
    const overdue = isOverdue(dueDate);
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (overdue) {
      const daysPast = Math.abs(daysUntilDue);
      return {
        text: `Overdue by ${daysPast} day${daysPast !== 1 ? 's' : ''}`,
        color: 'text-red-600'
      };
    } else if (daysUntilDue === 0) {
      return { text: 'Due today', color: 'text-red-600' };
    } else if (daysUntilDue === 1) {
      return { text: 'Due tomorrow', color: 'text-amber-600' };
    } else if (daysUntilDue <= 7) {
      return { text: `Due in ${daysUntilDue} days`, color: 'text-amber-600' };
    } else {
      return { text: `Due in ${daysUntilDue} days`, color: 'text-gray-600' };
    }
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleAcknowledgeAssignment = async (assignment: EmployeeAssignment) => {
    try {
      setAcknowledging(assignment.id);
      await acknowledgeAssignment(assignment.id, assignment.sopId, assignment.sopVersion);
      // The hook will automatically refresh the data
    } catch (err) {
      console.error('Error acknowledging assignment:', err);
      // Handle error (could show toast notification)
    } finally {
      setAcknowledging(null);
    }
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading dashboard: {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <p className="text-gray-500">No dashboard data available</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, pendingAssignments, recentActivity } = data;
  const displayedPendingDocs = pendingAssignments.slice(0, 8);
  const hasMorePending = pendingAssignments.length > 8;
  const displayedActivity = recentActivity.slice(0, 5);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Welcome back, {currentUser.firstName || currentUser.name}!
                </h1>
                <p className="text-gray-600">Here's what needs your attention today</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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
                  <p className="text-3xl font-bold text-amber-600">{stats.pendingAssignments}</p>
                  <p className="text-sm text-gray-500 mt-1">Document{stats.pendingAssignments !== 1 ? 's' : ''} waiting</p>
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
                  <p className="text-3xl font-bold text-emerald-600">{stats.acknowledgedThisMonth}</p>
                  <p className="text-sm text-gray-500 mt-1">Great progress!</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-full">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overdue or Compliance Status */}
          {stats.overdueAssignments > 0 ? (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200" onClick={() => onNavigate('assigned')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Overdue Documents</p>
                    <p className="text-3xl font-bold text-red-600">{stats.overdueAssignments}</p>
                    <p className="text-sm text-red-500 mt-1">Needs immediate attention</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Compliance Status</p>
                    <p className="text-3xl font-bold text-emerald-600">{Math.round(stats.complianceRate)}%</p>
                    <p className="text-sm text-emerald-500 mt-1">
                      {stats.complianceRate === 100 ? 'All up to date!' : 'Good progress!'}
                    </p>
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
                  {stats.pendingAssignments > 0 && ` (${stats.pendingAssignments} pending)`}
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
                {displayedPendingDocs.map((assignment) => {
                  const dueDateInfo = formatDueDate(assignment.dueDate);
                  const overdue = assignment.dueDate && isOverdue(assignment.dueDate);
                  const isAcknowledging = acknowledging === assignment.id;
                  
                  return (
                    <div 
                      key={assignment.id}
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
                                {assignment.sopTitle}
                              </h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500">{assignment.department}</span>
                                <Badge variant="outline" className="text-xs">
                                  v{assignment.sopVersion}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(assignment.priority)}`}>
                                  {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
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
                        
                        <div className="ml-4 flex space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => onNavigate('assigned')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button 
                            onClick={() => handleAcknowledgeAssignment(assignment)}
                            disabled={isAcknowledging}
                            className={overdue ? 'bg-red-600 hover:bg-red-700' : ''}
                          >
                            {isAcknowledging ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Acknowledging...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Acknowledge
                              </>
                            )}
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
            
            {recentActivity.length > 5 && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}