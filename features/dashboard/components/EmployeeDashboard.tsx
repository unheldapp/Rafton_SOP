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
  RefreshCw,
  Shield,
  BookOpen,
  List,
  Info,
  Tag
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
  onNavigate: (page: string, sop?: any) => void;
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
    if (!dueDate) return { text: 'No deadline', color: 'text-gray-500' };
    
    const days = getDaysUntilDue(dueDate);
    
    if (days < 0) {
      return { text: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, color: 'text-red-600' };
    } else if (days === 0) {
      return { text: 'Due today', color: 'text-red-600' };
    } else if (days === 1) {
      return { text: 'Due tomorrow', color: 'text-orange-600' };
    } else if (days <= 7) {
      return { text: `Due in ${days} days`, color: 'text-orange-600' };
    } else {
      return { text: `Due in ${days} days`, color: 'text-gray-600' };
    }
  };

  const formatReviewDate = (reviewDate: string | null) => {
    if (!reviewDate) return { text: 'No review scheduled', color: 'text-gray-500' };
    
    const days = getDaysUntilDue(reviewDate);
    
    if (days < 0) {
      return { text: `Review overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, color: 'text-red-600' };
    } else if (days === 0) {
      return { text: 'Review due today', color: 'text-red-600' };
    } else if (days <= 7) {
      return { text: `Review due in ${days} days`, color: 'text-orange-600' };
    } else if (days <= 30) {
      return { text: `Review due in ${days} days`, color: 'text-yellow-600' };
    } else {
      return { text: `Review due in ${days} days`, color: 'text-gray-600' };
    }
  };

  const formatExpiryDate = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const days = getDaysUntilDue(expiryDate);
    
    if (days < 0) {
      return { text: `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`, color: 'text-red-600', urgent: true };
    } else if (days === 0) {
      return { text: 'Expires today', color: 'text-red-600', urgent: true };
    } else if (days <= 7) {
      return { text: `Expires in ${days} days`, color: 'text-orange-600', urgent: true };
    } else if (days <= 30) {
      return { text: `Expires in ${days} days`, color: 'text-yellow-600', urgent: false };
    } else {
      return { text: `Expires in ${days} days`, color: 'text-gray-600', urgent: false };
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'SOP': FileText,
      'Policy': Shield,
      'Training': BookOpen,
      'Procedure': List
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'SOP': 'text-blue-600',
      'Policy': 'text-purple-600',
      'Training': 'text-green-600',
      'Procedure': 'text-orange-600'
    };
    return colors[type as keyof typeof colors] || 'text-blue-600';
  };

  const formatActivityDate = (dateString: string) => {
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

  const handleViewDocument = async (assignment: EmployeeAssignment) => {
    try {
      console.log('EmployeeDashboard: handleViewDocument called with assignment:', assignment);
      
      // Navigate to editor page with the document - for employees this will show SOPViewer
      if (onNavigate) {
        // Create the full SOP object from assignment data with the proper structure expected by SOPViewer
        const sopData = {
          id: assignment.sopId,
          title: assignment.title,
          content: assignment.content,
          version: assignment.version,
          status: 'published', // Assignments are typically for published SOPs
          priority: assignment.priority,
          department: assignment.department,
          created_at: assignment.assignedOn, // Use assignment date as fallback
          updated_at: assignment.assignedOn, // Use assignment date as fallback
          author_name: `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`,
          // Include other necessary fields
          description: assignment.description,
          tags: assignment.tags || [],
          view_count: 0,
          download_count: 0,
          comments_enabled: true,
          locked: false,
          ai_generated: false,
          expires_at: assignment.dueDate,
          author_id: assignment.assignedBy.id,
          reviewer_id: null,
          approved_by: null,
          approved_at: null,
          published_at: assignment.assignedOn,
          review_frequency: null,
          next_review_date: assignment.dueDate,
          document_url: null,
          document_type: 'html',
          file_size: null,
          folder_id: null,
          category_id: null,
          company_id: null, // Will be populated by the viewer
          integration_status: null,
          deleted_at: null
        };
        
        onNavigate('editor', sopData);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleAcknowledgeAssignment = async (assignment: EmployeeAssignment) => {
    try {
      setAcknowledging(assignment.id);
      await acknowledgeAssignment(assignment.assignmentId, assignment.sopId, assignment.version);
      await refreshData(); // Refresh the dashboard data after acknowledgment
    } catch (error) {
      console.error('Error acknowledging assignment:', error);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Assignments */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200" onClick={() => onNavigate('assigned')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Tasks</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.pendingAssignments}</p>
                  <p className="text-sm text-blue-500 mt-1">
                    {stats.pendingAssignments === 0 ? 'All caught up!' : 'Requires acknowledgment'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledged This Month */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200" onClick={() => onNavigate('history')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.acknowledgedThisMonth}</p>
                  <p className="text-sm text-green-500 mt-1">Documents acknowledged</p>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Requiring Attention */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Need Attention</p>
                  <p className="text-3xl font-bold text-amber-600">
                    {data?.pendingAssignments.filter(a => 
                      (a.expiresAt && getDaysUntilDue(a.expiresAt) <= 30) || 
                      (a.nextReviewDate && getDaysUntilDue(a.nextReviewDate) <= 30)
                    ).length || 0}
                  </p>
                  <p className="text-sm text-amber-500 mt-1">
                    Expiring or due for review
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          {stats.overdueAssignments > 0 ? (
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Overdue Tasks</p>
                    <p className="text-3xl font-bold text-red-600">{stats.overdueAssignments}</p>
                    <p className="text-sm text-red-500 mt-1">
                      {stats.overdueAssignments === 1 ? 'Needs immediate attention' : 'Need immediate attention'}
                    </p>
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
                  const reviewDateInfo = formatReviewDate(assignment.nextReviewDate);
                  const expiryInfo = formatExpiryDate(assignment.expiresAt);
                  const overdue = assignment.dueDate && isOverdue(assignment.dueDate);
                  const isAcknowledging = acknowledging === assignment.id;
                  const TypeIcon = getTypeIcon(assignment.type);
                  const typeColor = getTypeColor(assignment.type);
                  
                  return (
                    <div 
                      key={assignment.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <TypeIcon className={`w-4 h-4 ${typeColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-900">
                                  {assignment.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {assignment.type}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{assignment.department}</span>
                                <span>v{assignment.version}</span>
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(assignment.priority)}`}>
                                  {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                                </Badge>
                                {assignment.author && (
                                  <span>by {assignment.author.firstName} {assignment.author.lastName}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {/* Due Date for Pending Assignments */}
                            {assignment.status === 'pending' && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Assignment Due:</span>
                                <span className={dueDateInfo.color}>
                                  {dueDateInfo.text}
                                </span>
                              </div>
                            )}
                            
                            {/* Review Date for Acknowledged Assignments */}
                            {assignment.status === 'acknowledged' && assignment.nextReviewDate && (
                              <div className="flex items-center space-x-2 text-sm">
                                <RefreshCw className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Next Review:</span>
                                <span className={reviewDateInfo.color}>
                                  {reviewDateInfo.text}
                                </span>
                              </div>
                            )}
                            
                            {/* Expiry Warning */}
                            {expiryInfo && (
                              <div className="flex items-center space-x-2 text-sm">
                                <AlertTriangle className={`w-4 h-4 ${expiryInfo.urgent ? 'text-red-400' : 'text-yellow-400'}`} />
                                <span className="text-gray-600">Document:</span>
                                <span className={expiryInfo.color}>
                                  {expiryInfo.text}
                                </span>
                              </div>
                            )}
                            
                            {/* Assignment Notes */}
                            {assignment.notes && (
                              <div className="flex items-start space-x-2 text-sm">
                                <Info className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-gray-600">Notes:</span>
                                  <p className="text-gray-800 mt-1">{assignment.notes}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Tags */}
                            {assignment.tags && assignment.tags.length > 0 && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Tag className="w-4 h-4 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {assignment.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {assignment.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{assignment.tags.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 flex space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => handleViewDocument(assignment)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          {assignment.status === 'pending' && (
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
                          )}
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
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-full ${colorClasses} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900 flex-1">{activity.message}</p>
                        <p className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatActivityDate(activity.date)}</p>
                      </div>
                      
                      {/* Additional context for different activity types */}
                      {activity.type === 'assigned' && activity.priority && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(activity.priority)}`}>
                            {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority
                          </Badge>
                          {activity.sopId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                // Find the assignment and view it
                                const assignment = data?.pendingAssignments.find(a => a.sopId === activity.sopId);
                                if (assignment) {
                                  handleViewDocument(assignment);
                                }
                              }}
                            >
                              View Document
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {activity.type === 'acknowledged' && activity.sopId && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Completed
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2 text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              // Find the assignment and view it
                              const assignment = data?.pendingAssignments.find(a => a.sopId === activity.sopId);
                              if (assignment) {
                                handleViewDocument(assignment);
                              }
                            }}
                          >
                            View Document
                          </Button>
                        </div>
                      )}
                      
                      {activity.type === 'notification' && activity.priority && (
                        <div className="mt-1">
                          <Badge variant="outline" className={`text-xs ${
                            activity.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                            activity.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            activity.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority
                          </Badge>
                        </div>
                      )}
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