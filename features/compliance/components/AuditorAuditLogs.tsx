import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Calendar } from "../../../shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../shared/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { 
  ScrollText, 
  User, 
  FileText, 
  Clock, 
  Filter, 
  Download, 
  Search,
  Calendar as CalendarIcon,
  Settings,
  UserPlus,
  Edit3,
  CheckCircle,
  Building2,
  Code,
  RefreshCw,
  ArrowUpDown,
  Eye,
  Shield
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  performedByEmail: string;
  entityType: 'SOP' | 'Policy' | 'Guideline' | 'User' | 'Role' | 'Organization' | 'Folder' | 'Assignment';
  entityName: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high';
  category: 'acknowledgment' | 'document' | 'user' | 'settings' | 'security' | 'system';
}

export function AuditorAuditLogs() {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [actionTypeFilter, setActionTypeFilter] = useState('all');
  const [performedByFilter, setPerformedByFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [entityNameFilter, setEntityNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  
  // Table states
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [showJsonView, setShowJsonView] = useState(false);
  const itemsPerPage = 15;

  // Comprehensive mock audit log data
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2025-07-11T10:15:32.123Z',
      action: 'Acknowledged SOP',
      performedBy: 'John Doe',
      performedByEmail: 'john.doe@company.com',
      entityType: 'SOP',
      entityName: 'Fire Safety SOP',
      details: 'Version v2.1 acknowledged successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_abc123',
      severity: 'low',
      category: 'acknowledgment'
    },
    {
      id: '2',
      timestamp: '2025-07-11T09:42:18.456Z',
      action: 'Edited Document',
      performedBy: 'Jane Smith',
      performedByEmail: 'jane.ra@company.com',
      entityType: 'SOP',
      entityName: 'Equipment Handling',
      details: 'Title and content updated, version incremented to v1.5',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_def456',
      severity: 'medium',
      category: 'document'
    },
    {
      id: '3',
      timestamp: '2025-07-11T08:01:45.789Z',
      action: 'User Invited',
      performedBy: 'Admin User',
      performedByEmail: 'admin@company.com',
      entityType: 'User',
      entityName: 'rachel.hr@company.com',
      details: 'New user invited with Employee role, sent welcome email',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_ghi789',
      severity: 'medium',
      category: 'user'
    },
    {
      id: '4',
      timestamp: '2025-07-10T16:33:12.234Z',
      action: 'Changed Settings',
      performedBy: 'Admin User',
      performedByEmail: 'admin@company.com',
      entityType: 'Organization',
      entityName: 'Default Review Cycle',
      details: 'Updated default review cycle from 3 months to 6 months',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_jkl012',
      severity: 'high',
      category: 'settings'
    },
    {
      id: '5',
      timestamp: '2025-07-10T14:28:55.567Z',
      action: 'Published Version',
      performedBy: 'Sarah Johnson',
      performedByEmail: 'sarah@company.com',
      entityType: 'Policy',
      entityName: 'Data Privacy Policy',
      details: 'Version v4.2 published and assigned to 45 users',
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_mno345',
      severity: 'medium',
      category: 'document'
    },
    {
      id: '6',
      timestamp: '2025-07-10T12:17:41.890Z',
      action: 'Login Attempted',
      performedBy: 'Mike Brown',
      performedByEmail: 'mike@company.com',
      entityType: 'User',
      entityName: 'mike@company.com',
      details: 'Successful login from new device, 2FA verified',
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      sessionId: 'sess_pqr678',
      severity: 'low',
      category: 'security'
    },
    {
      id: '7',
      timestamp: '2025-07-10T11:05:29.123Z',
      action: 'Role Updated',
      performedBy: 'Admin User',
      performedByEmail: 'admin@company.com',
      entityType: 'Role',
      entityName: 'QA Manager',
      details: 'Updated permissions: added document approval rights',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_stu901',
      severity: 'high',
      category: 'user'
    },
    {
      id: '8',
      timestamp: '2025-07-10T09:52:17.456Z',
      action: 'Assignment Created',
      performedBy: 'Jane Smith',
      performedByEmail: 'jane.ra@company.com',
      entityType: 'Assignment',
      entityName: 'Chemical Handling Training',
      details: 'SOP assigned to 12 Safety team members, due date: Jul 20, 2025',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_vwx234',
      severity: 'medium',
      category: 'document'
    },
    {
      id: '9',
      timestamp: '2025-07-09T17:44:08.789Z',
      action: 'Folder Created',
      performedBy: 'Sarah Johnson',
      performedByEmail: 'sarah@company.com',
      entityType: 'Folder',
      entityName: 'Q3 2025 Procedures',
      details: 'New folder created in Safety department with restricted access',
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      sessionId: 'sess_yz567',
      severity: 'low',
      category: 'document'
    },
    {
      id: '10',
      timestamp: '2025-07-09T15:31:52.012Z',
      action: 'Password Reset',
      performedBy: 'System',
      performedByEmail: 'system@company.com',
      entityType: 'User',
      entityName: 'emily@company.com',
      details: 'Password reset requested and email sent, completed successfully',
      ipAddress: '192.168.1.200',
      userAgent: 'System Process',
      sessionId: 'sess_system',
      severity: 'medium',
      category: 'security'
    },
    {
      id: '11',
      timestamp: '2025-07-09T13:18:36.345Z',
      action: 'Bulk Assignment',
      performedBy: 'Admin User',
      performedByEmail: 'admin@company.com',
      entityType: 'Assignment',
      entityName: 'Q3 Compliance Review',
      details: 'Bulk assigned 8 SOPs to all employees (156 total assignments)',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_bulk123',
      severity: 'high',
      category: 'document'
    },
    {
      id: '12',
      timestamp: '2025-07-09T11:07:44.678Z',
      action: 'Export Data',
      performedBy: 'Mike Brown',
      performedByEmail: 'mike@auditor.com',
      entityType: 'Organization',
      entityName: 'Compliance Report',
      details: 'Generated and downloaded comprehensive compliance report (CSV, 2.3MB)',
      ipAddress: '192.168.1.115',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_audit456',
      severity: 'medium',
      category: 'system'
    }
  ];

  // Filter logs based on all criteria
  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActionType = actionTypeFilter === 'all' || log.action.toLowerCase().includes(actionTypeFilter.toLowerCase());
    const matchesPerformedBy = performedByFilter === 'all' || log.performedByEmail === performedByFilter;
    const matchesEntityType = entityTypeFilter === 'all' || log.entityType === entityTypeFilter;
    const matchesEntityName = entityNameFilter === '' || log.entityName.toLowerCase().includes(entityNameFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const logDate = new Date(log.timestamp);
      if (dateRange.from && logDate < dateRange.from) matchesDateRange = false;
      if (dateRange.to && logDate > dateRange.to) matchesDateRange = false;
    }

    return matchesSearch && matchesActionType && matchesPerformedBy && matchesEntityType && 
           matchesEntityName && matchesCategory && matchesSeverity && matchesDateRange;
  });

  // Sort logs by timestamp
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortDirection === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = sortedLogs.slice(startIndex, endIndex);

  // Get action badge
  const getActionBadge = (action: string, category: string) => {
    const categoryColors = {
      acknowledgment: 'bg-emerald-100 text-emerald-800',
      document: 'bg-blue-100 text-blue-800',
      user: 'bg-purple-100 text-purple-800',
      settings: 'bg-amber-100 text-amber-800',
      security: 'bg-red-100 text-red-800',
      system: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="outline" className={categoryColors[category as keyof typeof categoryColors]}>
        {action}
      </Badge>
    );
  };

  // Get entity type icon
  const getEntityTypeIcon = (entityType: string) => {
    const icons = {
      'SOP': FileText,
      'Policy': FileText,
      'Guideline': FileText,
      'User': User,
      'Role': Shield,
      'Organization': Building2,
      'Folder': FileText,
      'Assignment': CheckCircle
    };
    const Icon = icons[entityType as keyof typeof icons] || FileText;
    return <Icon className="w-4 h-4 text-gray-400" />;
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const severityColors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="outline" className={severityColors[severity as keyof typeof severityColors]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      full: date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }),
      short: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Export functions
  const handleExportCSV = () => {
    const headers = ['Timestamp (UTC)', 'Action', 'Performed By', 'Entity Type', 'Entity Name', 'Details', 'IP Address', 'Severity'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        `"${log.timestamp}"`,
        `"${log.action}"`,
        `"${log.performedBy} (${log.performedByEmail})"`,
        log.entityType,
        `"${log.entityName}"`,
        `"${log.details}"`,
        log.ipAddress,
        log.severity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({});
    setActionTypeFilter('all');
    setPerformedByFilter('all');
    setEntityTypeFilter('all');
    setEntityNameFilter('');
    setCategoryFilter('all');
    setSeverityFilter('all');
    setCurrentPage(1);
  };

  const toggleSort = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Audit Logs</h1>
            <p className="text-gray-600">Comprehensive system activity tracking and compliance audit trail</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowJsonView(!showJsonView)}
            >
              <Code className="w-4 h-4 mr-2" />
              {showJsonView ? 'Table View' : 'JSON View'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Export XLSX')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Export PDF')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Comprehensive Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search across all logs (action, user, entity, details)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Primary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                        ) : (
                          dateRange.from.toLocaleDateString()
                        )
                      ) : (
                        'Last 7 days'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Action Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Action Type</label>
                <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="acknowledged">Acknowledgment</SelectItem>
                    <SelectItem value="edited">SOP Edited</SelectItem>
                    <SelectItem value="published">Version Published</SelectItem>
                    <SelectItem value="invited">User Invited</SelectItem>
                    <SelectItem value="changed">Setting Changed</SelectItem>
                    <SelectItem value="login">Login/Logout</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Performed By */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Performed By</label>
                <Select value={performedByFilter} onValueChange={setPerformedByFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admin@company.com">Admin User</SelectItem>
                    <SelectItem value="john.doe@company.com">John Doe</SelectItem>
                    <SelectItem value="jane.ra@company.com">Jane Smith</SelectItem>
                    <SelectItem value="sarah@company.com">Sarah Johnson</SelectItem>
                    <SelectItem value="mike@auditor.com">Mike Brown</SelectItem>
                    <SelectItem value="system@company.com">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entity Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Entity Type</label>
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Guideline">Guideline</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Role">Role</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                    <SelectItem value="Folder">Folder</SelectItem>
                    <SelectItem value="Assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Entity Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Entity Name</label>
                <Input
                  placeholder="Search by entity name..."
                  value={entityNameFilter}
                  onChange={(e) => setEntityNameFilter(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="acknowledgment">Acknowledgment</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="user">User Management</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Severity */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {filteredLogs.length} of {mockAuditLogs.length} audit entries
              </div>
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ScrollText className="w-5 h-5 text-gray-600" />
              <span>Audit Log Entries</span>
            </CardTitle>
            <CardDescription>
              Chronological record of all system activities • Tamper-proof audit trail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">
                      <Button variant="ghost" className="h-auto p-0 font-medium" onClick={toggleSort}>
                        Timestamp (UTC)
                        <ArrowUpDown className="ml-2 w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity Name</TableHead>
                    <TableHead className="max-w-xs">Details</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No audit logs found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentLogs.map((log) => {
                      const timestamp = formatTimestamp(log.timestamp);
                      return (
                        <TableRow key={log.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium">{timestamp.short}</div>
                                <div className="text-xs text-gray-500">{timestamp.full}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getActionBadge(log.action, log.category)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium">{log.performedBy}</div>
                                <div className="text-xs text-gray-500">{log.performedByEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getEntityTypeIcon(log.entityType)}
                              <Badge variant="outline" className="text-xs">
                                {log.entityType}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="text-sm font-medium truncate">{log.entityName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="text-sm text-gray-600 line-clamp-2">{log.details}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(log.severity)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>Audit Log Details</DialogTitle>
                                  <DialogDescription>
                                    Complete audit trail information for this event
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {selectedLog && (
                                  <div className="space-y-6">
                                    {/* Event Summary */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Action</label>
                                          <div className="mt-1">{getActionBadge(selectedLog.action, selectedLog.category)}</div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</label>
                                          <div className="mt-1 text-sm">{formatTimestamp(selectedLog.timestamp).full}</div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Performed By</label>
                                          <div className="mt-1">
                                            <div className="text-sm font-medium">{selectedLog.performedBy}</div>
                                            <div className="text-xs text-gray-500">{selectedLog.performedByEmail}</div>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Severity</label>
                                          <div className="mt-1">{getSeverityBadge(selectedLog.severity)}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Entity Details */}
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900 mb-3">Entity Information</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Entity Type</label>
                                          <div className="mt-1 flex items-center space-x-2">
                                            {getEntityTypeIcon(selectedLog.entityType)}
                                            <Badge variant="outline">{selectedLog.entityType}</Badge>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Entity Name</label>
                                          <div className="mt-1 text-sm">{selectedLog.entityName}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Details */}
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900 mb-3">Action Details</h3>
                                      <div className="bg-white border rounded-lg p-4">
                                        <p className="text-sm text-gray-700">{selectedLog.details}</p>
                                      </div>
                                    </div>

                                    {/* Technical Details */}
                                    <div>
                                      <h3 className="text-lg font-medium text-gray-900 mb-3">Technical Information</h3>
                                      <div className="grid grid-cols-1 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">IP Address</label>
                                          <div className="mt-1 text-sm font-mono">{selectedLog.ipAddress}</div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">User Agent</label>
                                          <div className="mt-1 text-xs text-gray-600 break-all">{selectedLog.userAgent}</div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700">Session ID</label>
                                          <div className="mt-1 text-sm font-mono">{selectedLog.sessionId}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && <PaginationEllipsis />}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}