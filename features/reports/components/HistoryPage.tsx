import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { 
  History, 
  FileText, 
  Calendar, 
  Eye, 
  Download, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  RefreshCcw,
  Clock,
  Building,
  User,
  ExternalLink,
  X,
  ChevronDown,
  Archive
} from 'lucide-react';

interface AcknowledgmentRecord {
  id: string;
  documentId: string;
  documentTitle: string;
  department: string;
  acknowledgedDate: string;
  version: string;
  status: 'acknowledged' | 'expired' | 'superseded';
  documentType: 'sop' | 'policy' | 'training' | 'procedure';
  content: string;
  currentVersion?: string;
  supersededDate?: string;
  expiryDate?: string;
  acknowledgedBy: string;
  receiptId: string;
}

interface HistoryPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function HistoryPage({ currentUser }: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<AcknowledgmentRecord | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  // Mock acknowledgment history data
  const [acknowledgmentHistory] = useState<AcknowledgmentRecord[]>([
    {
      id: '1',
      documentId: 'doc-1',
      documentTitle: 'Chemical Handling Procedures',
      department: 'Safety',
      acknowledgedDate: '2025-06-15T10:30:00Z',
      version: '2.0',
      status: 'acknowledged',
      documentType: 'sop',
      content: `# Chemical Handling Procedures v2.0\n\n## 1. Purpose and Scope\nThis Standard Operating Procedure (SOP) establishes the requirements for safe handling, storage, and disposal of chemicals in our facility.\n\n## 2. Personal Protective Equipment (PPE)\n### Required PPE:\n- Safety goggles or face shield\n- Chemical-resistant gloves (nitrile or neoprene)\n- Laboratory coat or chemical-resistant apron\n- Closed-toe shoes with chemical-resistant soles`,
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2025-001'
    },
    {
      id: '2',
      documentId: 'doc-2',
      documentTitle: 'Code of Conduct',
      department: 'HR',
      acknowledgedDate: '2025-05-02T14:15:00Z',
      version: '1.2',
      status: 'superseded',
      documentType: 'policy',
      content: `# Code of Conduct v1.2\n\n## Professional Behavior\nAll employees are expected to maintain the highest standards of professional conduct...`,
      currentVersion: '2.0',
      supersededDate: '2025-07-01',
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2025-002'
    },
    {
      id: '3',
      documentId: 'doc-3',
      documentTitle: 'Emergency Response Plan',
      department: 'Safety',
      acknowledgedDate: '2025-04-20T09:45:00Z',
      version: '3.0',
      status: 'acknowledged',
      documentType: 'procedure',
      content: `# Emergency Response Plan v3.0\n\n## Emergency Procedures\nIn case of emergency, follow these critical steps...`,
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2025-003'
    },
    {
      id: '4',
      documentId: 'doc-4',
      documentTitle: 'Data Privacy Training',
      department: 'IT',
      acknowledgedDate: '2025-03-10T16:20:00Z',
      version: '1.0',
      status: 'expired',
      documentType: 'training',
      content: `# Data Privacy Training v1.0\n\n## GDPR Compliance\nUnderstanding and implementing data privacy regulations...`,
      expiryDate: '2025-07-10',
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2025-004'
    },
    {
      id: '5',
      documentId: 'doc-5',
      documentTitle: 'Workplace Harassment Policy',
      department: 'HR',
      acknowledgedDate: '2025-02-28T11:30:00Z',
      version: '2.1',
      status: 'acknowledged',
      documentType: 'policy',
      content: `# Workplace Harassment Policy v2.1\n\n## Zero Tolerance Policy\nOur organization maintains a zero-tolerance policy regarding harassment...`,
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2025-005'
    },
    {
      id: '6',
      documentId: 'doc-6',
      documentTitle: 'Equipment Maintenance Protocol',
      department: 'Operations',
      acknowledgedDate: '2025-01-15T13:45:00Z',
      version: '1.5',
      status: 'superseded',
      documentType: 'sop',
      content: `# Equipment Maintenance Protocol v1.5\n\n## Maintenance Procedures\nRegular maintenance is essential for equipment reliability and safety...`,
      currentVersion: '2.0',
      supersededDate: '2025-06-15',
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2025-006'
    },
    {
      id: '7',
      documentId: 'doc-7',
      documentTitle: 'Quality Control Standards',
      department: 'QA',
      acknowledgedDate: '2024-12-20T08:15:00Z',
      version: '3.2',
      status: 'acknowledged',
      documentType: 'procedure',
      content: `# Quality Control Standards v3.2\n\n## Quality Assurance Procedures\nMaintaining product quality through systematic controls...`,
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2024-012'
    },
    {
      id: '8',
      documentId: 'doc-8',
      documentTitle: 'Cybersecurity Awareness Training',
      department: 'IT',
      acknowledgedDate: '2024-11-30T15:00:00Z',
      version: '2.3',
      status: 'expired',
      documentType: 'training',
      content: `# Cybersecurity Awareness Training v2.3\n\n## Security Best Practices\nProtecting organizational data and systems from cyber threats...`,
      expiryDate: '2025-05-30',
      acknowledgedBy: currentUser.name,
      receiptId: 'RCP-2024-011'
    }
  ]);

  // Filter records based on current filters
  const filteredRecords = useMemo(() => {
    let filtered = acknowledgmentHistory;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '6months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(record =>
        new Date(record.acknowledgedDate) >= filterDate
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.documentType === typeFilter);
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(record => record.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Sort by acknowledged date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.acknowledgedDate).getTime() - new Date(a.acknowledgedDate).getTime()
    );
  }, [acknowledgmentHistory, searchTerm, dateFilter, typeFilter, departmentFilter, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = acknowledgmentHistory.length;
    const acknowledged = acknowledgmentHistory.filter(r => r.status === 'acknowledged').length;
    const expired = acknowledgmentHistory.filter(r => r.status === 'expired').length;
    const superseded = acknowledgmentHistory.filter(r => r.status === 'superseded').length;

    return { total, acknowledged, expired, superseded };
  }, [acknowledgmentHistory]);

  const getStatusBadge = (status: string) => {
    const config = {
      acknowledged: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      superseded: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: RefreshCcw }
    };

    const { color, icon: Icon } = config[status as keyof typeof config];
    return (
      <Badge variant="outline" className={`${color} text-xs flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons = {
      sop: FileText,
      policy: Building,
      training: User,
      procedure: Archive
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDocument = (record: AcknowledgmentRecord) => {
    setSelectedDocument(record);
    setShowDocumentDialog(true);
  };

  const handleDownloadReceipt = (record: AcknowledgmentRecord) => {
    // Mock download functionality
    const receipt = {
      employeeName: currentUser.name,
      employeeEmail: currentUser.email,
      documentTitle: record.documentTitle,
      version: record.version,
      acknowledgedDate: formatDate(record.acknowledgedDate),
      receiptId: record.receiptId,
      department: record.department
    };

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acknowledgment-receipt-${record.receiptId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setTypeFilter('all');
    setDepartmentFilter('all');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm || dateFilter !== 'all' || typeFilter !== 'all' || 
                         departmentFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">My History</h1>
              <p className="text-gray-600">Your document acknowledgment history and compliance records</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative mt-4 md:mt-0 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <History className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.acknowledged}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Superseded</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.superseded}</p>
                </div>
                <RefreshCcw className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <CardTitle className="text-lg">Filters</CardTitle>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[searchTerm, dateFilter !== 'all' ? dateFilter : '', 
                      typeFilter !== 'all' ? typeFilter : '',
                      departmentFilter !== 'all' ? departmentFilter : '',
                      statusFilter !== 'all' ? statusFilter : ''].filter(Boolean).length} active
                  </Badge>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Document Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sop">SOP</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="superseded">Superseded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Acknowledgment History</CardTitle>
                <CardDescription>
                  {filteredRecords.length} of {acknowledgmentHistory.length} records
                  {hasActiveFilters && ' (filtered)'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRecords.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Document</TableHead>
                      <TableHead>Acknowledged On</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const TypeIcon = getDocumentTypeIcon(record.documentType);
                      return (
                        <TableRow key={record.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-start space-x-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <TypeIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-medium text-gray-900 hover:text-purple-600 cursor-pointer"
                                    onClick={() => handleViewDocument(record)}>
                                  {record.documentTitle}
                                </h4>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-500 flex items-center">
                                    <Building className="w-3 h-3 mr-1" />
                                    {record.department}
                                  </span>
                                  <span className="text-sm text-gray-500 capitalize">
                                    {record.documentType}
                                  </span>
                                </div>
                                {record.status === 'superseded' && (
                                  <p className="text-xs text-amber-600 mt-1">
                                    Superseded by v{record.currentVersion} on {record.supersededDate && new Date(record.supersededDate).toLocaleDateString()}
                                  </p>
                                )}
                                {record.status === 'expired' && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Expired on {record.expiryDate && new Date(record.expiryDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDate(record.acknowledgedDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              v{record.version}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(record.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDocument(record)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadReceipt(record)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Receipt
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters ? 'No matching records found' : 'No acknowledgment history'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more records'
                    : 'You haven\'t acknowledged any documents yet'
                  }
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Viewer Dialog */}
        <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{selectedDocument?.documentTitle}</span>
                <Badge variant="outline" className="ml-2">
                  v{selectedDocument?.version}
                </Badge>
                {selectedDocument && getStatusBadge(selectedDocument.status)}
              </DialogTitle>
              <DialogDescription>
                Acknowledged on {selectedDocument && formatDate(selectedDocument.acknowledgedDate)} • {selectedDocument?.department} Department
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[60vh] w-full">
              <div className="prose prose-sm max-w-none p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {selectedDocument?.content}
                </pre>
              </div>
            </ScrollArea>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Receipt ID: {selectedDocument?.receiptId}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => selectedDocument && handleDownloadReceipt(selectedDocument)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button onClick={() => setShowDocumentDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}