import React, { useState, useEffect } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Badge } from "../../../shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Calendar,
  FileText,
  User,
  Building2,
  Bell,
  MoreHorizontal,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { AcknowledgmentService } from '../../../shared/services/acknowledgmentService';
import { useUsers } from '../../../shared/hooks/useUsers';
import { User as UserType } from '../../../shared/types';

interface AssignmentDashboardProps {
  currentUser: UserType;
}

interface AssignmentStats {
  totalAssignments: number;
  pendingAssignments: number;
  acknowledgedAssignments: number;
  overdueAssignments: number;
}

interface AssignmentListItem {
  id: string;
  sopTitle: string;
  sopId: string;
  userName: string;
  userEmail: string;
  department: string;
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'acknowledged' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export function AssignmentDashboard({ currentUser }: AssignmentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    totalAssignments: 0,
    pendingAssignments: 0,
    acknowledgedAssignments: 0,
    overdueAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const { users } = useUsers();

  // Load assignments and stats
  useEffect(() => {
    loadAssignments();
    loadStats();
  }, [currentPage, statusFilter, priorityFilter, searchTerm]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      };
      
      const response = await AcknowledgmentService.getAcknowledgments(currentPage, 20, filters);
      
      // Transform acknowledgments to assignment format
      const transformedAssignments: AssignmentListItem[] = response.acknowledgments.map(ack => ({
        id: ack.id,
        sopTitle: ack.sopTitle,
        sopId: ack.sopId,
        userName: ack.userName,
        userEmail: ack.userEmail,
        department: ack.department || 'Unknown',
        assignedDate: ack.assignedDate,
        dueDate: ack.dueDate,
        status: ack.status as 'pending' | 'acknowledged' | 'overdue',
        priority: ack.priority,
        notes: ack.notes
      }));
      
      setAssignments(transformedAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await AcknowledgmentService.getAcknowledgmentStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSendReminder = async (assignmentId: string) => {
    try {
      setSendingReminder(assignmentId);
      await AcknowledgmentService.sendReminder(assignmentId);
      toast.success('Reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminder(null);
    }
  };

  const handleBulkReminder = async () => {
    try {
      const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'overdue');
      if (pendingAssignments.length === 0) {
        toast.info('No pending assignments to remind');
        return;
      }
      
      await AcknowledgmentService.sendBulkReminders(pendingAssignments.map(a => a.id));
      toast.success(`Reminders sent to ${pendingAssignments.length} user(s)`);
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      toast.error('Failed to send bulk reminders');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'acknowledged': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = searchTerm === '' || 
      assignment.sopTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Dashboard</h1>
          <p className="text-gray-600">Manage SOP assignments and track acknowledgments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleBulkReminder}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Send Bulk Reminders
          </Button>
          <Button
            onClick={loadAssignments}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting acknowledgment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.acknowledgedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Completed assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdueAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            {filteredAssignments.length} assignment(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading assignments...</span>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No assignments found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {assignment.sopTitle}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{assignment.userName}</span>
                        <span>•</span>
                        <Building2 className="w-4 h-4" />
                        <span>{assignment.department}</span>
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getPriorityColor(assignment.priority)} text-xs`}>
                      {assignment.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(assignment.status)} text-xs`}>
                      {assignment.status}
                    </Badge>
                    {(assignment.status === 'pending' || assignment.status === 'overdue') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSendReminder(assignment.id)}
                        disabled={sendingReminder === assignment.id}
                        className="flex items-center gap-1"
                      >
                        <Bell className="w-3 h-3" />
                        {sendingReminder === assignment.id ? 'Sending...' : 'Remind'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 