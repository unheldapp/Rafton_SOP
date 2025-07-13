import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
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
  ChevronRight
} from 'lucide-react';

interface AssignedDocument {
  id: string;
  title: string;
  assignedOn: string;
  dueDate: string;
  status: 'pending' | 'acknowledged' | 'overdue' | 'expired';
  priority: 'critical' | 'high' | 'medium' | 'low';
  version: string;
  assignedBy: string;
  department: string;
  description: string;
  content: string;
  acknowledgedDate?: string;
  type: 'SOP' | 'Policy' | 'Training' | 'Procedure';
  tags: string[];
}

interface AssignedToMePageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function AssignedToMePage({ currentUser }: AssignedToMePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<AssignedDocument | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Mock data - in real app, this would come from API
  const assignedDocuments: AssignedDocument[] = [
    {
      id: '1',
      title: 'Chemical Handling Procedures',
      assignedOn: '2025-07-08',
      dueDate: '2025-07-15',
      status: 'pending',
      priority: 'high',
      version: '2.1',
      assignedBy: 'John Smith',
      department: 'Safety',
      description: 'Updated chemical handling procedures with new safety protocols.',
      content: 'This SOP establishes safety requirements for chemical handling...',
      type: 'SOP',
      tags: ['Safety', 'Chemical', 'PPE']
    },
    {
      id: '2',
      title: 'Emergency Response Plan',
      assignedOn: '2025-07-05',
      dueDate: '2025-07-12',
      status: 'overdue',
      priority: 'critical',
      version: '3.0',
      assignedBy: 'Sarah Johnson',
      department: 'Safety',
      description: 'Comprehensive emergency response procedures for workplace incidents.',
      content: 'Emergency procedures for various workplace scenarios...',
      type: 'Policy',
      tags: ['Emergency', 'Safety', 'Response']
    },
    {
      id: '3',
      title: 'Data Privacy Training',
      assignedOn: '2025-07-10',
      dueDate: '2025-07-20',
      status: 'pending',
      priority: 'medium',
      version: '1.0',
      assignedBy: 'Mike Brown',
      department: 'IT',
      description: 'Annual data privacy and security training module.',
      content: 'Data privacy regulations and best practices...',
      type: 'Training',
      tags: ['Privacy', 'Data', 'Security']
    },
    {
      id: '4',
      title: 'Quality Control Standards',
      assignedOn: '2025-07-01',
      dueDate: '2025-07-08',
      status: 'acknowledged',
      priority: 'medium',
      version: '1.2',
      assignedBy: 'Emily Davis',
      department: 'QA',
      description: 'Updated quality control procedures for manufacturing processes.',
      content: 'Quality control standards and procedures...',
      acknowledgedDate: '2025-07-07',
      type: 'Procedure',
      tags: ['Quality', 'Manufacturing', 'Standards']
    },
    {
      id: '5',
      title: 'Workplace Harassment Policy',
      assignedOn: '2025-06-28',
      dueDate: '2025-07-05',
      status: 'acknowledged',
      priority: 'high',
      version: '2.0',
      assignedBy: 'Lisa Chen',
      department: 'HR',
      description: 'Updated workplace harassment prevention policy.',
      content: 'Workplace harassment prevention and reporting procedures...',
      acknowledgedDate: '2025-07-04',
      type: 'Policy',
      tags: ['HR', 'Policy', 'Workplace']
    }
  ];

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    return assignedDocuments.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchTerm, statusFilter, priorityFilter]);

  // Calculate counts
  const statusCounts = useMemo(() => {
    return {
      pending: assignedDocuments.filter(doc => doc.status === 'pending').length,
      acknowledged: assignedDocuments.filter(doc => doc.status === 'acknowledged').length,
      overdue: assignedDocuments.filter(doc => doc.status === 'overdue').length,
      expired: assignedDocuments.filter(doc => doc.status === 'expired').length
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock },
      acknowledged: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: X }
    };
    
    const { color, icon: Icon } = config[status as keyof typeof config];
    return (
      <Badge className={`${color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle },
      medium: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Info },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Info }
    };
    
    const { color, icon: Icon } = config[priority as keyof typeof config];
    return (
      <Badge variant="outline" className={`${color} text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAcknowledge = (docId: string) => {
    // In real app, this would call an API
    console.log(`Acknowledging document: ${docId}`);
    setSelectedDocument(null);
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
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const DocumentViewer = ({ document }: { document: AssignedDocument }) => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">{document.type}</span>
            </div>
            <span className="text-gray-400">•</span>
            <Badge variant="outline" className="text-xs">
              v{document.version}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {getPriorityBadge(document.priority)}
            {getStatusBadge(document.status)}
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{document.title}</h1>
        <p className="text-gray-600 mb-4">{document.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>Assigned by: {document.assignedBy}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {new Date(document.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>Department: {document.department}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {document.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Document Content</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {document.content}
          </p>
        </div>
      </div>
      
      {document.status === 'pending' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-900">Acknowledgment Required</span>
          </div>
          <p className="text-sm text-purple-700 mb-4">
            Please review this document and acknowledge that you have read and understood its contents.
          </p>
          <div className="flex space-x-3">
            <Button 
              onClick={() => handleAcknowledge(document.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Acknowledge Document
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      )}
      
      {document.status === 'acknowledged' && document.acknowledgedDate && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-emerald-900">
              Acknowledged on {new Date(document.acknowledgedDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Assigned to Me</h1>
              <p className="text-gray-600">Documents that require your acknowledgment</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter('pending')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{statusCounts.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter('acknowledged')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-emerald-600">{statusCounts.acknowledged}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter('overdue')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{assignedDocuments.length}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedDocuments.length > 0 && (
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">
                {selectedDocuments.length} document(s) selected
              </span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  Bulk Acknowledge
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedDocuments([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
                <CardDescription>
                  {statusFilter !== 'all' && `Filtered by: ${statusFilter}`}
                  {priorityFilter !== 'all' && ` • Priority: ${priorityFilter}`}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Assigned On</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => {
                    const daysUntilDue = getDaysUntilDue(document.dueDate);
                    const isSelected = selectedDocuments.includes(document.id);
                    
                    return (
                      <TableRow 
                        key={document.id} 
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : ''}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleBulkSelect(document.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{document.title}</p>
                              <p className="text-sm text-gray-500 truncate">{document.type} • {document.department}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {new Date(document.assignedOn).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">by {document.assignedBy}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {new Date(document.dueDate).toLocaleDateString()}
                          </div>
                          {daysUntilDue >= 0 && document.status === 'pending' && (
                            <div className="text-xs text-amber-600">
                              {daysUntilDue} days left
                            </div>
                          )}
                          {daysUntilDue < 0 && document.status === 'overdue' && (
                            <div className="text-xs text-red-600">
                              {Math.abs(daysUntilDue)} days overdue
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(document.status)}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(document.priority)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            v{document.version}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedDocument(document)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                {document.status === 'pending' ? 'View & Acknowledge' : 'View'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Document Viewer</DialogTitle>
                              </DialogHeader>
                              {selectedDocument && <DocumentViewer document={selectedDocument} />}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No documents have been assigned to you yet'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}