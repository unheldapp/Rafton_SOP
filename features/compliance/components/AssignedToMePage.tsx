import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { useAssignments } from "../../../shared/hooks/useAssignments";
import { EmployeeAssignment } from "../../../shared/services/assignmentService";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Calendar, 
  User, 
  Download,
  CheckSquare,
  X,
  AlertTriangle,
  Info,
  BookOpen,
  ChevronRight,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface AssignedToMePageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  onNavigate?: (page: string, sop?: any) => void;
}

export function AssignedToMePage({ currentUser, onNavigate }: AssignedToMePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [acknowledgeLoading, setAcknowledgeLoading] = useState<string | null>(null);
  const [bulkAcknowledgeLoading, setBulkAcknowledgeLoading] = useState(false);

  // Use the real assignments hook
  const { 
    assignments, 
    loading, 
    error, 
    stats, 
    refreshAssignments, 
    acknowledgeAssignment, 
    bulkAcknowledgeAssignments 
  } = useAssignments(currentUser.id);

  // Filter assignments based on search and filter criteria
  const filteredAssignments = useMemo(() => {
    return assignments.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.assignedBy.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.assignedBy.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assignments, searchTerm, statusFilter, priorityFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Acknowledged
        </Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-600">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewDocument = async (assignment: EmployeeAssignment) => {
    try {
      console.log('AssignedToMePage: handleViewDocument called with assignment:', assignment);
      
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

  const handleAcknowledge = async (assignment: EmployeeAssignment) => {
    try {
      setAcknowledgeLoading(assignment.assignmentId);
      await acknowledgeAssignment(assignment.assignmentId, assignment.sopId, assignment.version);
      // setSelectedDocument(null); // This line was removed as per the edit hint
    } catch (error) {
      console.error('Error acknowledging assignment:', error);
    } finally {
      setAcknowledgeLoading(null);
    }
  };

  const handleBulkAcknowledge = async () => {
    if (selectedDocuments.length === 0) return;
    
    try {
      setBulkAcknowledgeLoading(true);
      await bulkAcknowledgeAssignments(selectedDocuments);
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error bulk acknowledging assignments:', error);
    } finally {
      setBulkAcknowledgeLoading(false);
    }
  };

  const handleBulkSelect = (docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, docId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== docId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingAssignments = filteredAssignments.filter(doc => doc.status === 'pending');
      setSelectedDocuments(pendingAssignments.map(doc => doc.assignmentId));
    } else {
      setSelectedDocuments([]);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading assignments</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={refreshAssignments} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Assigned to Me</h1>
              <p className="text-gray-600">Review and acknowledge documents assigned to you</p>
            </div>
            <Button 
              onClick={refreshAssignments}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">
                    {selectedDocuments.length} document(s) selected
                  </span>
                </div>
                <Button 
                  onClick={handleBulkAcknowledge}
                  disabled={bulkAcknowledgeLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {bulkAcknowledgeLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Acknowledge Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <Card>
          <CardContent className="p-6">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600">
                  {assignments.length === 0 
                    ? "You don't have any assignments yet."
                    : "No assignments match your current filters."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedDocuments.length === filteredAssignments.filter(doc => doc.status === 'pending').length && filteredAssignments.filter(doc => doc.status === 'pending').length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium text-gray-700">Select All</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {filteredAssignments.length} assignment(s)
                  </span>
                </div>

                {/* Assignments Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Assigned By</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment) => {
                        const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                        
                        return (
                          <TableRow key={assignment.assignmentId}>
                            <TableCell>
                              {assignment.status === 'pending' && (
                                <Checkbox
                                  checked={selectedDocuments.includes(assignment.assignmentId)}
                                  onCheckedChange={(checked) => handleBulkSelect(assignment.assignmentId, checked as boolean)}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-purple-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{assignment.title}</p>
                                  <p className="text-sm text-gray-500">Version {assignment.version}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                            <TableCell>{getPriorityBadge(assignment.priority)}</TableCell>
                            <TableCell>
                              {assignment.dueDate ? (
                                <div>
                                  <p className="text-sm text-gray-900">
                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                  </p>
                                  {daysUntilDue !== null && (
                                    <p className={`text-xs ${
                                      daysUntilDue < 0 ? 'text-red-600' : 
                                      daysUntilDue <= 3 ? 'text-amber-600' : 
                                      'text-gray-500'
                                    }`}>
                                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                                       daysUntilDue === 0 ? 'Due today' :
                                       `${daysUntilDue} days left`}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">No due date</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm text-gray-900">
                                  {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {assignment.assignedBy.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {assignment.department || 'General'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {/* The Dialog component was removed, so this section is simplified */}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDocument(assignment)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                {assignment.status === 'pending' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleAcknowledge(assignment)}
                                    disabled={acknowledgeLoading === assignment.assignmentId}
                                  >
                                    {acknowledgeLoading === assignment.assignmentId ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}