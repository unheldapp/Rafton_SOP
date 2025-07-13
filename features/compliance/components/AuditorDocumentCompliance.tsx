import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Calendar } from "../../../shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../shared/components/ui/pagination";
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Filter, 
  Search,
  Calendar as CalendarIcon,
  Download,
  MoreHorizontal,
  FileType,
  Building2,
  Tag
} from 'lucide-react';

interface DocumentComplianceData {
  id: string;
  title: string;
  type: 'SOP' | 'Policy' | 'Guideline' | 'Procedure';
  department: string;
  assigned: number;
  acknowledged: number;
  pending: number;
  overdue: number;
  dueDate: string;
  version: string;
  lastUpdated: string;
  tags: string[];
  employees: {
    id: string;
    name: string;
    email: string;
    department: string;
    acknowledged: boolean;
    acknowledgedOn?: string;
    dueDate: string;
    daysOverdue?: number;
    reminderSent: boolean;
  }[];
}

interface AuditorDocumentComplianceProps {
  initialFilters?: {
    status?: string;
    department?: string;
    type?: string;
  };
}

export function AuditorDocumentCompliance({ initialFilters }: AuditorDocumentComplianceProps) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState(initialFilters?.type || 'all');
  const [departmentFilter, setDepartmentFilter] = useState(initialFilters?.department || 'all');
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status || 'all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [tagFilter, setTagFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Detail modal
  const [selectedDocument, setSelectedDocument] = useState<DocumentComplianceData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock comprehensive document data
  const mockDocuments: DocumentComplianceData[] = [
    {
      id: '1',
      title: 'Fire Safety SOP',
      type: 'SOP',
      department: 'Operations',
      assigned: 24,
      acknowledged: 18,
      pending: 4,
      overdue: 2,
      dueDate: '2025-07-10',
      version: 'v2.1',
      lastUpdated: '2025-06-15',
      tags: ['Safety', 'Emergency', 'High Priority'],
      employees: [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@company.com',
          department: 'Operations',
          acknowledged: true,
          acknowledgedOn: '2025-06-20',
          dueDate: '2025-07-10',
          reminderSent: false
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          department: 'Operations',
          acknowledged: false,
          dueDate: '2025-07-10',
          daysOverdue: 19,
          reminderSent: true
        },
        {
          id: '3',
          name: 'Mike Brown',
          email: 'mike@company.com',
          department: 'QA',
          acknowledged: false,
          dueDate: '2025-07-10',
          daysOverdue: 19,
          reminderSent: true
        }
      ]
    },
    {
      id: '2',
      title: 'Code of Conduct',
      type: 'Policy',
      department: 'HR',
      assigned: 45,
      acknowledged: 45,
      pending: 0,
      overdue: 0,
      dueDate: '2025-08-01',
      version: 'v3.0',
      lastUpdated: '2025-07-01',
      tags: ['HR', 'Ethics', 'Mandatory'],
      employees: []
    },
    {
      id: '3',
      title: 'Equipment Handling',
      type: 'SOP',
      department: 'Operations',
      assigned: 10,
      acknowledged: 5,
      pending: 3,
      overdue: 2,
      dueDate: '2025-06-30',
      version: 'v1.4',
      lastUpdated: '2025-06-01',
      tags: ['Operations', 'Safety'],
      employees: []
    },
    {
      id: '4',
      title: 'Chemical Handling Update',
      type: 'SOP',
      department: 'Safety',
      assigned: 12,
      acknowledged: 10,
      pending: 0,
      overdue: 2,
      dueDate: '2025-06-25',
      version: 'v2.3',
      lastUpdated: '2025-05-20',
      tags: ['Safety', 'Chemical', 'High Priority'],
      employees: []
    },
    {
      id: '5',
      title: 'Data Privacy Policy',
      type: 'Policy',
      department: 'IT',
      assigned: 25,
      acknowledged: 22,
      pending: 1,
      overdue: 2,
      dueDate: '2025-06-28',
      version: 'v4.1',
      lastUpdated: '2025-06-10',
      tags: ['IT', 'Privacy', 'Compliance'],
      employees: []
    },
    {
      id: '6',
      title: 'Quality Control Guidelines',
      type: 'Guideline',
      department: 'QA',
      assigned: 18,
      acknowledged: 16,
      pending: 2,
      overdue: 0,
      dueDate: '2025-07-15',
      version: 'v1.2',
      lastUpdated: '2025-06-25',
      tags: ['QA', 'Quality'],
      employees: []
    },
    {
      id: '7',
      title: 'Financial Reporting Procedures',
      type: 'Procedure',
      department: 'Finance',
      assigned: 8,
      acknowledged: 7,
      pending: 1,
      overdue: 0,
      dueDate: '2025-07-20',
      version: 'v2.0',
      lastUpdated: '2025-07-01',
      tags: ['Finance', 'Reporting'],
      employees: []
    }
  ];

  // Filter documents based on all criteria
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = documentTypeFilter === 'all' || doc.type === documentTypeFilter;
    const matchesDepartment = departmentFilter === 'all' || doc.department.toLowerCase() === departmentFilter.toLowerCase();
    const matchesTag = tagFilter === 'all' || doc.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'fully-acknowledged') {
      matchesStatus = doc.pending === 0 && doc.overdue === 0;
    } else if (statusFilter === 'partial') {
      matchesStatus = doc.acknowledged > 0 && (doc.pending > 0 || doc.overdue > 0);
    } else if (statusFilter === 'pending') {
      matchesStatus = doc.pending > 0;
    } else if (statusFilter === 'overdue') {
      matchesStatus = doc.overdue > 0;
    }

    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const docDate = new Date(doc.dueDate);
      if (dateRange.from && docDate < dateRange.from) matchesDateRange = false;
      if (dateRange.to && docDate > dateRange.to) matchesDateRange = false;
    }

    return matchesSearch && matchesType && matchesDepartment && matchesStatus && matchesDateRange && matchesTag;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  const getStatusBadge = (doc: DocumentComplianceData) => {
    if (doc.overdue > 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (doc.pending > 0) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
    } else {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Complete</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Document Title', 'Type', 'Department', 'Assigned', 'Acknowledged', 'Pending', 'Overdue', 'Due Date', 'Version'];
    const csvContent = [
      headers.join(','),
      ...filteredDocuments.map(doc => [
        `"${doc.title}"`,
        doc.type,
        doc.department,
        doc.assigned,
        doc.acknowledged,
        doc.pending,
        doc.overdue,
        doc.dueDate,
        doc.version
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-compliance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (doc: DocumentComplianceData) => {
    setSelectedDocument(doc);
    setIsDetailModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDocumentTypeFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
    setDateRange({});
    setTagFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Document Compliance</h1>
            <p className="text-gray-600">Track acknowledgment status and compliance for all documents</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Export PDF')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                placeholder="Search documents by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Document Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Document Type</label>
                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                  <SelectTrigger>
                    <FileType className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Guideline">Guideline</SelectItem>
                    <SelectItem value="Procedure">Procedure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <Building2 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="fully-acknowledged">Fully Acknowledged</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</label>
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
                        'Select range'
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

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger>
                    <Tag className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="high priority">High Priority</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="mandatory">Mandatory</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Showing {filteredDocuments.length} of {mockDocuments.length} documents
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Document Table */}
        <Card>
          <CardHeader>
            <CardTitle>Document Compliance Overview</CardTitle>
            <CardDescription>Acknowledgment status for all published documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Assigned</TableHead>
                    <TableHead className="text-center">Acknowledged</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Overdue</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                        No documents found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentDocuments.map((doc) => (
                      <TableRow key={doc.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">{doc.title}</div>
                            <div className="text-sm text-gray-500">{doc.department}</div>
                            <div className="flex gap-1 mt-1">
                              {doc.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {doc.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{doc.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {doc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{doc.assigned}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-emerald-600 font-medium">{doc.acknowledged}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {doc.pending > 0 ? (
                            <span className="text-amber-600 font-medium">{doc.pending}</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {doc.overdue > 0 ? (
                            <span className="text-red-600 font-medium">{doc.overdue}</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(doc.dueDate).toLocaleDateString()}
                            {new Date(doc.dueDate) < new Date() && doc.overdue > 0 && (
                              <div className="text-xs text-red-600 mt-1">
                                {Math.ceil((new Date().getTime() - new Date(doc.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{doc.version}</code>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(doc)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(doc)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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

        {/* Document Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>{selectedDocument?.title}</span>
              </DialogTitle>
              <DialogDescription>
                Detailed acknowledgment tracking for this document
              </DialogDescription>
            </DialogHeader>
            
            {selectedDocument && (
              <div className="space-y-6">
                {/* Document Metadata */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                      <div className="mt-1">
                        <Badge variant="secondary">{selectedDocument.type}</Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</label>
                      <div className="mt-1 text-sm font-medium">{selectedDocument.department}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Version</label>
                      <div className="mt-1">
                        <code className="text-xs bg-white px-2 py-1 rounded">{selectedDocument.version}</code>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</label>
                      <div className="mt-1 text-sm font-medium">
                        {new Date(selectedDocument.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</label>
                    <div className="mt-1 flex gap-1">
                      {selectedDocument.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedDocument.assigned}</div>
                    <div className="text-sm text-gray-600">Total Assigned</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{selectedDocument.acknowledged}</div>
                    <div className="text-sm text-gray-600">Acknowledged</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{selectedDocument.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{selectedDocument.overdue}</div>
                    <div className="text-sm text-gray-600">Overdue</div>
                  </div>
                </div>

                {/* Employee Acknowledgment Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Acknowledgment Log</h3>
                  
                  {selectedDocument.employees.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Acknowledged</TableHead>
                          <TableHead>Acknowledged On</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Days Overdue</TableHead>
                          <TableHead>Reminder Sent</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedDocument.employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-gray-500">{employee.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>
                              {employee.acknowledged ? (
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Yes
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  No
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {employee.acknowledgedOn 
                                ? new Date(employee.acknowledgedOn).toLocaleDateString()
                                : '-'
                              }
                            </TableCell>
                            <TableCell>{new Date(employee.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {employee.daysOverdue ? (
                                <Badge variant="destructive" className="text-xs">
                                  {employee.daysOverdue} days
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {employee.reminderSent ? (
                                <Badge variant="outline" className="text-xs">
                                  Sent
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No detailed employee data available for this document.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}