import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Badge } from "../../../shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Separator } from "../../../shared/components/ui/separator";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { 
  Download,
  FileText,
  Calendar,
  Filter,
  Target,
  Users,
  Activity,
  Search,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Send,
  Save,
  CheckSquare,
  BookOpen,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useReports, UseReportsReturn } from '../../../shared/hooks/useReports';
import { ReportType } from '../../../shared/services/reportService';

interface ReportsProps {
  // No longer need sops and users props as we're using real data
}

export function Reports({}: ReportsProps) {
  const [activeTab, setActiveTab] = useState<ReportType>('acknowledgment');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  
  // Use the reports hook for the current active tab
  const reportData = useReports(activeTab);
  
  // DEBUG: Add logging to see what's happening
  React.useEffect(() => {
    console.log('=== REPORTS DEBUG ===');
    console.log('Active Tab:', activeTab);
    console.log('Report Data:', reportData);
    console.log('Loading:', reportData.loading);
    console.log('Error:', reportData.error);
    console.log('Data length:', reportData.data?.length);
    console.log('Total:', reportData.total);
    console.log('Stats:', reportData.stats);
  }, [activeTab, reportData]);

  // DEBUG: Test function
  const testReportService = async () => {
    console.log('=== TESTING REPORT SERVICE DIRECTLY ===');
    try {
      const { reportService } = await import('../../../shared/services/reportService');
      const { useAuth } = await import('../../../shared/context/AuthContext');
      console.log('Report service imported successfully');
      
      // This won't work directly due to hook rules, but helps debug
      console.log('Current user from reportData hook should show in the logs above');
    } catch (error) {
      console.error('Error importing report service:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'acknowledged':
      case 'current':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
      case 'due-soon':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue':
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    await reportData.exportReport(format);
  };

  const handleScheduleReport = () => {
    console.log('Scheduling report for', activeTab);
    // Implementation would go here
  };

  const handleSaveTemplate = () => {
    console.log('Saving report template for', activeTab);
    // Implementation would go here
  };

  const handleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows(prev => 
      prev.length === reportData.data.length 
        ? []
        : reportData.data.map(item => item.id)
    );
  };

  const handleSearchChange = (value: string) => {
    reportData.setPagination({
      ...reportData.pagination,
      search: value
    });
  };

  const handlePageChange = (newPage: number) => {
    reportData.setPagination({
      ...reportData.pagination,
      page: newPage
    });
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    reportData.setFilters({
      ...reportData.filters,
      [filterKey]: value
    });
  };

  const clearFilters = () => {
    reportData.setFilters({
      dateRange: 'last-30-days',
      status: 'all',
      department: 'all',
      priority: 'all',
      documentType: 'all',
      user: 'all'
    });
  };

  const renderFilters = () => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-purple-600" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
              <Select value={reportData.filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                  <SelectItem value="last-year">Last year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={reportData.filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="due-soon">Due Soon</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
              <Select value={reportData.filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <Select value={reportData.filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Document Type</label>
              <Select value={reportData.filters.documentType} onValueChange={(value) => handleFilterChange('documentType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sop">SOP</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="guideline">Guideline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => reportData.refreshData()}
                disabled={reportData.loading}
              >
                {reportData.loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSummaryStats = () => {
    const stats = reportData.stats;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </CardContent>
        </Card>
        
        {activeTab === 'acknowledgment' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">{stats.acknowledged || 0}</div>
                <div className="text-sm text-gray-600">Acknowledged</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-600">{stats.pending || 0}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.overdue || 0}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'sop-review' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">{stats.current || 0}</div>
                <div className="text-sm text-gray-600">Current</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-600">{stats.dueSoon || 0}</div>
                <div className="text-sm text-gray-600">Due Soon</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.overdue || 0}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'user-activity' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">{stats.active || 0}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{stats.inactive || 0}</div>
                <div className="text-sm text-gray-600">Inactive Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.avgAcknowledged || 0}</div>
                <div className="text-sm text-gray-600">Avg Acknowledged</div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'compliance-summary' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">{stats.avgCompliance || 0}%</div>
                <div className="text-sm text-gray-600">Avg Compliance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.totalDocs || 0}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAcknowledged || 0}</div>
                <div className="text-sm text-gray-600">Total Acknowledged</div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'audit-trail' && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.today || 0}</div>
                <div className="text-sm text-gray-600">Today's Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.users || 0}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.events || 0}</div>
                <div className="text-sm text-gray-600">Event Types</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  };

  const getTableColumns = () => {
    switch (activeTab) {
      case 'acknowledgment':
        return [
          { key: 'document', label: 'Document' },
          { key: 'assignedTo', label: 'Assigned To' },
          { key: 'status', label: 'Status' },
          { key: 'dueDate', label: 'Due Date' },
          { key: 'acknowledgedOn', label: 'Acknowledged On' },
          { key: 'version', label: 'Version' },
          { key: 'actions', label: 'Actions' }
        ];
      case 'sop-review':
        return [
          { key: 'title', label: 'SOP Title' },
          { key: 'currentVersion', label: 'Version' },
          { key: 'lastReviewed', label: 'Last Reviewed' },
          { key: 'nextReview', label: 'Next Review' },
          { key: 'reviewStatus', label: 'Status' },
          { key: 'assignedReviewer', label: 'Reviewer' },
          { key: 'actions', label: 'Actions' }
        ];
      case 'user-activity':
        return [
          { key: 'user', label: 'User' },
          { key: 'department', label: 'Department' },
          { key: 'role', label: 'Role' },
          { key: 'lastLogin', label: 'Last Login' },
          { key: 'acknowledgedCount', label: 'Acknowledged' },
          { key: 'pendingCount', label: 'Pending' },
          { key: 'status', label: 'Status' },
          { key: 'actions', label: 'Actions' }
        ];
      case 'compliance-summary':
        return [
          { key: 'department', label: 'Department' },
          { key: 'totalDocs', label: 'Total Docs' },
          { key: 'acknowledged', label: 'Acknowledged' },
          { key: 'pending', label: 'Pending' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'complianceRate', label: 'Compliance Rate' },
          { key: 'avgResponseTime', label: 'Avg Response Time' }
        ];
      case 'audit-trail':
        return [
          { key: 'event', label: 'Event' },
          { key: 'user', label: 'User' },
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'entity', label: 'Entity' },
          { key: 'details', label: 'Details' },
          { key: 'ipAddress', label: 'IP Address' }
        ];
      default:
        return [];
    }
  };

  const renderTable = () => {
    const columns = getTableColumns();
    const totalPages = Math.ceil(reportData.total / reportData.pagination.itemsPerPage);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Report</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search..."
                  value={reportData.pagination.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {selectedRows.length > 0 && (
                <Button variant="outline" size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Bulk Action ({selectedRows.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reportData.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading report data...</span>
            </div>
          ) : reportData.error ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {reportData.error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedRows.length === reportData.data.length && reportData.data.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    {columns.map((column) => (
                      <TableHead key={column.key} className="cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center space-x-1">
                          <span>{column.label}</span>
                          <SortAsc className="w-3 h-3 text-gray-400" />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox 
                          checked={selectedRows.includes(item.id)}
                          onCheckedChange={() => handleRowSelection(item.id)}
                        />
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          {column.key === 'status' || column.key === 'reviewStatus' ? (
                            <Badge className={`text-xs ${getStatusColor(item[column.key])}`}>
                              {item[column.key]?.replace('-', ' ')}
                            </Badge>
                          ) : column.key === 'complianceRate' ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{item[column.key]}%</span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 h-2 rounded-full" 
                                  style={{ width: `${item[column.key]}%` }}
                                />
                              </div>
                            </div>
                          ) : column.key === 'actions' ? (
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="font-medium">{item[column.key] || '—'}</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((reportData.pagination.page - 1) * reportData.pagination.itemsPerPage) + 1} to {Math.min(reportData.pagination.page * reportData.pagination.itemsPerPage, reportData.total)} of {reportData.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={reportData.pagination.page === 1}
                    onClick={() => handlePageChange(reportData.pagination.page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === reportData.pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={reportData.pagination.page === totalPages}
                    onClick={() => handlePageChange(reportData.pagination.page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Clear selected rows when tab changes
  React.useEffect(() => {
    setSelectedRows([]);
  }, [activeTab]);

  // Add debugging for the reports data
  React.useEffect(() => {
    console.log('Reports Component - Current tab:', activeTab);
    console.log('Reports Component - Data:', reportData.data);
    console.log('Reports Component - Total:', reportData.total);
    console.log('Reports Component - Stats:', reportData.stats);
    console.log('Reports Component - Loading:', reportData.loading);
    console.log('Reports Component - Error:', reportData.error);
  }, [activeTab, reportData.data, reportData.total, reportData.stats, reportData.loading, reportData.error]);

  const testDirectCall = async () => {
    console.log('Testing direct report service call...');
    try {
      const { reportService } = await import('../../../shared/services/reportService');
      const { useAuth } = await import('../../../shared/context/AuthContext');
      
      // We need to get the current user somehow for testing
      console.log('Report service available:', !!reportService);
    } catch (error) {
      console.error('Error testing direct call:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports and track compliance metrics
          </p>
        </div>
        
        {/* Export Options */}
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={testDirectCall}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            🐛 Debug Test
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={reportData.loading}
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            disabled={reportData.loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')}
            disabled={reportData.loading}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="outline" onClick={handleScheduleReport}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportType)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 shadow-sm h-12 p-1 rounded-xl">
          {[
            { value: 'acknowledgment', icon: CheckSquare, label: 'Acknowledgment' },
            { value: 'sop-review', icon: BookOpen, label: 'SOP Review' },
            { value: 'user-activity', icon: Users, label: 'User Activity' },
            { value: 'compliance-summary', icon: Target, label: 'Compliance' },
            { value: 'audit-trail', icon: Activity, label: 'Audit Trail' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="relative flex items-center space-x-2 rounded-lg border-0 font-medium transition-all duration-300 ease-in-out"
                style={{
                  color: isActive ? '#ffffff' : '#374151',
                  background: isActive 
                    ? 'linear-gradient(135deg, #9333ea 0%, #8b5cf6 100%)' 
                    : 'transparent',
                  boxShadow: isActive 
                    ? '0 10px 15px -3px rgba(147, 51, 234, 0.3), 0 4px 6px -4px rgba(147, 51, 234, 0.2)' 
                    : 'none',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f3e8ff';
                    e.currentTarget.style.color = '#7c3aed';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent 
          value={activeTab} 
          className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
        >
          {/* Filters */}
          <div className="animate-in fade-in-50 slide-in-from-top-2 duration-500 delay-100">
            {renderFilters()}
          </div>
          
          {/* Summary Stats */}
          <div className="animate-in fade-in-50 slide-in-from-left-2 duration-500 delay-200">
            {renderSummaryStats()}
          </div>
          
          {/* Data Table */}
          <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-300">
            {renderTable()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}