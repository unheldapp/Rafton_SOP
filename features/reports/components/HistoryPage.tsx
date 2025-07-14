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
  Archive,
  Loader2
} from 'lucide-react';
import { useAuth } from "../../../shared/context/AuthContext";
import { useHistory } from "../../../shared/hooks/useHistory";
import { AcknowledgmentRecord } from "../../../shared/services/historyService";

export function HistoryPage() {
  const { currentUser } = useAuth();
  const {
    filteredRecords,
    stats,
    departments,
    loading,
    error,
    filters,
    hasActiveFilters,
    setFilters,
    clearFilters,
    downloadReceipt,
    refreshHistory
  } = useHistory(currentUser?.id || null);

  const [selectedDocument, setSelectedDocument] = useState<AcknowledgmentRecord | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

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
    if (currentUser?.email) {
      downloadReceipt(record, currentUser.email);
    }
  };

  const handleSearchChange = (value: string) => {
    setFilters({ searchTerm: value });
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({ [filterType]: value });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading acknowledgment history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refreshHistory} variant="outline">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                value={filters.searchTerm || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
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
                    {Object.values(filters).filter(f => f && f !== 'all').length} active
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
              <Select value={filters.dateRange || 'all'} onValueChange={(value) => handleFilterChange('dateRange', value)}>
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

              <Select value={filters.documentType || 'all'} onValueChange={(value) => handleFilterChange('documentType', value)}>
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

              <Select value={filters.department || 'all'} onValueChange={(value) => handleFilterChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
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
                  {filteredRecords.length} of {stats.total} records
                  {hasActiveFilters && ' (filtered)'}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={refreshHistory} size="sm">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
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