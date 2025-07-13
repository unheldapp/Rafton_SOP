import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Input } from "../../../shared/components/ui/input";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Calendar } from "../../../shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { 
  Search,
  Filter,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageCircle,
  Download,
  RefreshCw,
  Calendar as CalendarIcon,
  FileText,
  Users,
  XCircle,
  ChevronDown,
  MoreHorizontal,
  History,
  User,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  AcknowledgmentService, 
  AcknowledgmentEntry, 
  AcknowledgmentFilters,
  AcknowledgmentStats
} from '../../../shared/services/acknowledgmentService';

// Define types locally to avoid import issues
type UserRole = 'admin' | 'employee' | 'auditor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
  status: 'active' | 'pending';
  department?: string;
}

interface SOP {
  id: string;
  title: string;
  department: string;
  status: 'draft' | 'published' | 'pending-review';
  acknowledgedPercent: number;
  lastUpdated: string;
  version: string;
  content: string;
  author: string;
  assignedTo: string[];
}

interface AcknowledgmentModuleProps {
  sops: SOP[];
  users: User[];
  onNavigate: (page: any, sop?: SOP) => void;
}

export function AcknowledgmentModule({ sops, users, onNavigate }: AcknowledgmentModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [acknowledgments, setAcknowledgments] = useState<AcknowledgmentEntry[]>([]);
  const [stats, setStats] = useState<AcknowledgmentStats>({
    totalAssigned: 0,
    acknowledged: 0,
    pending: 0,
    declined: 0,
    overdue: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueDocuments, setUniqueDocuments] = useState<Array<{ id: string; title: string }>>([]);
  const [uniqueUsers, setUniqueUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AcknowledgmentFilters>({
    documentType: 'all',
    documentName: 'all',
    status: 'all',
    assignedUser: 'all',
    priority: 'all',
    dateFrom: undefined,
    dateTo: undefined
  });

  // Load acknowledgments data
  const loadAcknowledgments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await AcknowledgmentService.getAcknowledgments({
        page,
        limit: 20,
        filters: {
          ...filters,
          search: searchTerm
        },
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      setAcknowledgments(response.entries);
      setStats(response.stats);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.limit));
    } catch (err) {
      console.error('Error loading acknowledgments:', err);
      setError('Failed to load acknowledgments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      const [documents, users] = await Promise.all([
        AcknowledgmentService.getUniqueDocuments(),
        AcknowledgmentService.getUniqueUsers()
      ]);

      setUniqueDocuments(documents);
      setUniqueUsers(users);
    } catch (err) {
      console.error('Error loading filter options:', err);
    }
  };

  // Initial load
  useEffect(() => {
    loadAcknowledgments();
    loadFilterOptions();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadAcknowledgments(1);
  }, [filters, searchTerm]);

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acknowledged':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'declined':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(acknowledgments.map(ack => ack.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkResend = async () => {
    try {
      setLoading(true);
      const assignmentIds = Array.from(selectedItems);
      await AcknowledgmentService.sendBulkReminders(assignmentIds);
      setSelectedItems(new Set());
      await loadAcknowledgments(currentPage);
    } catch (err) {
      console.error('Error sending bulk reminders:', err);
      setError('Failed to send reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkExport = () => {
    // Create CSV export
    const csvData = acknowledgments
      .filter(ack => selectedItems.has(ack.id))
      .map(ack => ({
        'Document Title': ack.sopTitle,
        'Assigned To': ack.assignedTo,
        'Email': ack.assignedEmail,
        'Status': ack.status,
        'Priority': ack.priority,
        'Due Date': formatDate(ack.dueDate),
        'Acknowledged On': formatDateTime(ack.acknowledgedAt || ''),
        'Department': ack.department,
        'Version': ack.version
      }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acknowledgments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendReminder = async (assignmentId: string, userId: string) => {
    try {
      await AcknowledgmentService.sendReminder(assignmentId, userId);
      await loadAcknowledgments(currentPage);
    } catch (err) {
      console.error('Error sending reminder:', err);
      setError('Failed to send reminder. Please try again.');
    }
  };

  const handleViewDocument = (sopId: string) => {
    const sop = sops.find(s => s.id === sopId);
    if (sop) {
      onNavigate('sop-view', sop);
    }
  };

  const handleViewReason = (entry: AcknowledgmentEntry) => {
    alert(`Decline Reason: ${entry.declineReason || 'No reason provided'}`);
  };

  const handleAuditTrail = (id: string) => {
    // Navigate to audit trail page
    onNavigate('audit-trail', { acknowledgmentId: id });
  };

  const handleRefresh = () => {
    loadAcknowledgments(currentPage);
  };

  const acknowledgedRate = stats.totalAssigned > 0 ? Math.round((stats.acknowledged / stats.totalAssigned) * 100) : 0;

  if (loading && acknowledgments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading acknowledgments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Acknowledgement Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage SOP compliance across your organization
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssigned}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.acknowledged}</p>
                <p className="text-xs text-gray-500">{acknowledgedRate}% rate</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-orange-600">{stats.declined}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-6">
          {/* Top Row - Search and Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search documents or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select 
              value={filters.documentType || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, documentType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="SOP">SOP</SelectItem>
                <SelectItem value="Policy">Policy</SelectItem>
                <SelectItem value="Procedure">Procedure</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.priority || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
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

          {/* Bottom Row - Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select 
              value={filters.documentName || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, documentName: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Document Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                {uniqueDocuments.map(doc => (
                  <SelectItem key={doc.id} value={doc.id}>{doc.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filters.assignedUser || 'all'} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, assignedUser: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assigned User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? formatDate(filters.dateFrom) : 'From Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date?.toISOString() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? formatDate(filters.dateTo) : 'To Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date?.toISOString() }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">
                {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleBulkResend} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Resend ({selectedItems.size})
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Acknowledgments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Acknowledgment Tracking</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleBulkExport}>
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === acknowledgments.length && acknowledgments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Document Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Acknowledged On</TableHead>
                  <TableHead>Reminders</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acknowledgments.map((ack) => (
                  <TableRow key={ack.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(ack.id)}
                        onCheckedChange={(checked) => handleSelectItem(ack.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{ack.sopTitle}</div>
                        <div className="text-sm text-gray-500">
                          {ack.documentType} • v{ack.version} • {ack.department}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{ack.assignedTo}</div>
                          <div className="text-sm text-gray-500">{ack.assignedEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getStatusColor(ack.status)}`}>
                        {getStatusIcon(ack.status)}
                        <span className="ml-1 capitalize">{ack.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${getPriorityColor(ack.priority)}`}>
                        {ack.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm ${
                        ack.dueDate && new Date(ack.dueDate) < new Date() && ack.status !== 'acknowledged' 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-900'
                      }`}>
                        {formatDate(ack.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(ack.acknowledgedAt || '')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {ack.reminders > 0 ? (
                          <Badge variant="secondary" className="text-xs">
                            {ack.reminders} sent
                          </Badge>
                        ) : (
                          'None'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDocument(ack.sopId)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {ack.status !== 'acknowledged' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSendReminder(ack.assignmentId, ack.userId)}
                            className="h-8 w-8 p-0"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {ack.status === 'declined' && ack.declineReason && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewReason(ack)}
                            className="h-8 w-8 p-0"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAuditTrail(ack.id)}
                          className="h-8 w-8 p-0"
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {acknowledgments.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No acknowledgments found</h3>
              <p className="text-gray-500">
                {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== null && f !== undefined)
                  ? 'Try adjusting your search terms or filters'
                  : 'No acknowledgment entries available'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAcknowledgments(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAcknowledgments(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}