import React, { useState, useMemo } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Badge } from "../../../shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  Download,
  BookOpen,
  Building,
  Tag,
  Grid3X3,
  List,
  Clock,
  Shield,
  Zap,
  Users,
  Settings,
  AlertTriangle,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  department: string;
  type: 'SOP' | 'Policy' | 'Training' | 'Procedure' | 'Manual' | 'Guideline';
  lastUpdated: string;
  version: string;
  author: string;
  description: string;
  content: string;
  tags: string[];
  status: 'published' | 'archived';
  category: string;
  fileSize?: string;
  downloadUrl?: string;
}

interface AllDocumentsPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

export function AllDocumentsPage({ currentUser }: AllDocumentsPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'title' | 'department' | 'lastUpdated' | 'type'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data - in real app, this would come from API
  const allDocuments: Document[] = [
    {
      id: '1',
      title: 'Chemical Handling Procedures',
      department: 'Safety',
      type: 'SOP',
      lastUpdated: '2025-07-08',
      version: '2.1',
      author: 'John Smith',
      description: 'Comprehensive procedures for safe handling, storage, and disposal of chemicals.',
      content: 'This SOP establishes safety requirements for chemical handling in our facility...',
      tags: ['Safety', 'Chemical', 'PPE', 'Storage'],
      status: 'published',
      category: 'Safety Procedures',
      fileSize: '2.4 MB'
    },
    {
      id: '2',
      title: 'Emergency Response Plan',
      department: 'Safety',
      type: 'Policy',
      lastUpdated: '2025-07-05',
      version: '3.0',
      author: 'Sarah Johnson',
      description: 'Comprehensive emergency response procedures for workplace incidents.',
      content: 'Emergency procedures for various workplace scenarios including fire, medical emergencies...',
      tags: ['Emergency', 'Safety', 'Response', 'Critical'],
      status: 'published',
      category: 'Emergency Procedures',
      fileSize: '3.1 MB'
    },
    {
      id: '3',
      title: 'Data Privacy Policy',
      department: 'IT',
      type: 'Policy',
      lastUpdated: '2025-07-10',
      version: '1.5',
      author: 'Mike Brown',
      description: 'Company data privacy and protection policies in compliance with regulations.',
      content: 'Data privacy regulations and best practices for handling personal information...',
      tags: ['Privacy', 'Data', 'Security', 'Compliance'],
      status: 'published',
      category: 'IT Policies',
      fileSize: '1.8 MB'
    },
    {
      id: '4',
      title: 'Quality Control Standards',
      department: 'QA',
      type: 'Manual',
      lastUpdated: '2025-07-01',
      version: '1.2',
      author: 'Emily Davis',
      description: 'Quality control procedures and standards for manufacturing processes.',
      content: 'Quality control standards and procedures for ensuring product quality...',
      tags: ['Quality', 'Manufacturing', 'Standards', 'Testing'],
      status: 'published',
      category: 'Quality Management',
      fileSize: '4.2 MB'
    },
    {
      id: '5',
      title: 'Workplace Harassment Policy',
      department: 'HR',
      type: 'Policy',
      lastUpdated: '2025-06-28',
      version: '2.0',
      author: 'Lisa Chen',
      description: 'Workplace harassment prevention and reporting procedures.',
      content: 'Workplace harassment prevention and reporting procedures for all employees...',
      tags: ['HR', 'Policy', 'Workplace', 'Conduct'],
      status: 'published',
      category: 'HR Policies',
      fileSize: '1.5 MB'
    },
    {
      id: '6',
      title: 'Equipment Maintenance Manual',
      department: 'Operations',
      type: 'Manual',
      lastUpdated: '2025-07-03',
      version: '2.3',
      author: 'Robert Wilson',
      description: 'Complete guide for equipment maintenance and troubleshooting.',
      content: 'Equipment maintenance procedures, schedules, and troubleshooting guides...',
      tags: ['Equipment', 'Maintenance', 'Operations', 'Troubleshooting'],
      status: 'published',
      category: 'Operations',
      fileSize: '8.7 MB'
    },
    {
      id: '7',
      title: 'Cybersecurity Training Module',
      department: 'IT',
      type: 'Training',
      lastUpdated: '2025-07-12',
      version: '1.0',
      author: 'Alex Thompson',
      description: 'Interactive cybersecurity awareness training for all employees.',
      content: 'Cybersecurity best practices, threat awareness, and incident response...',
      tags: ['Cybersecurity', 'Training', 'Awareness', 'Security'],
      status: 'published',
      category: 'Security Training',
      fileSize: '5.3 MB'
    },
    {
      id: '8',
      title: 'Financial Reporting Procedures',
      department: 'Finance',
      type: 'Procedure',
      lastUpdated: '2025-06-25',
      version: '1.8',
      author: 'Maria Rodriguez',
      description: 'Standard procedures for financial reporting and documentation.',
      content: 'Financial reporting procedures, documentation requirements, and compliance...',
      tags: ['Finance', 'Reporting', 'Documentation', 'Compliance'],
      status: 'published',
      category: 'Financial Procedures',
      fileSize: '2.9 MB'
    },
    {
      id: '9',
      title: 'New Employee Onboarding Guide',
      department: 'HR',
      type: 'Guideline',
      lastUpdated: '2025-07-15',
      version: '3.1',
      author: 'Jennifer Lee',
      description: 'Complete onboarding guide for new employees.',
      content: 'New employee onboarding process, required training, and integration...',
      tags: ['HR', 'Onboarding', 'New Employee', 'Integration'],
      status: 'published',
      category: 'HR Guidelines',
      fileSize: '6.1 MB'
    },
    {
      id: '10',
      title: 'Environmental Compliance Manual',
      department: 'Safety',
      type: 'Manual',
      lastUpdated: '2025-07-07',
      version: '2.0',
      author: 'David Park',
      description: 'Environmental compliance requirements and procedures.',
      content: 'Environmental regulations, compliance requirements, and reporting procedures...',
      tags: ['Environmental', 'Compliance', 'Regulations', 'Reporting'],
      status: 'published',
      category: 'Environmental',
      fileSize: '3.7 MB'
    }
  ];

  // Get unique values for filters
  const departments = [...new Set(allDocuments.map(doc => doc.department))];
  const documentTypes = [...new Set(allDocuments.map(doc => doc.type))];
  const allTags = [...new Set(allDocuments.flatMap(doc => doc.tags))];

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let filtered = allDocuments.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || doc.department === departmentFilter;
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      const matchesTag = tagFilter === 'all' || doc.tags.includes(tagFilter);
      
      return matchesSearch && matchesDepartment && matchesType && matchesTag;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'department':
          aValue = a.department.toLowerCase();
          bValue = b.department.toLowerCase();
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated).getTime();
          bValue = new Date(b.lastUpdated).getTime();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, departmentFilter, typeFilter, tagFilter, sortBy, sortOrder]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      total: allDocuments.length,
      byDepartment: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      recent: allDocuments.filter(doc => {
        const lastUpdated = new Date(doc.lastUpdated);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastUpdated >= thirtyDaysAgo;
      }).length
    };

    allDocuments.forEach(doc => {
      stats.byDepartment[doc.department] = (stats.byDepartment[doc.department] || 0) + 1;
      stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
    });

    return stats;
  }, []);

  const getTypeIcon = (type: string) => {
    const icons = {
      'SOP': FileText,
      'Policy': Shield,
      'Training': BookOpen,
      'Procedure': List,
      'Manual': BookOpen,
      'Guideline': Info
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'SOP': 'bg-blue-100 text-blue-800',
      'Policy': 'bg-purple-100 text-purple-800',
      'Training': 'bg-green-100 text-green-800',
      'Procedure': 'bg-orange-100 text-orange-800',
      'Manual': 'bg-indigo-100 text-indigo-800',
      'Guideline': 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const DocumentViewer = ({ document }: { document: Document }) => {
    const TypeIcon = getTypeIcon(document.type);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <TypeIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">{document.type}</span>
              </div>
              <span className="text-gray-400">•</span>
              <Badge variant="outline" className="text-xs">
                v{document.version}
              </Badge>
            </div>
            <Badge className={`${getTypeColor(document.type)} border-0`}>
              {document.type}
            </Badge>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{document.title}</h1>
          <p className="text-gray-600 mb-4">{document.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>{document.department}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{document.author}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Updated: {new Date(document.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{document.fileSize}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {document.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
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
        
        <div className="flex justify-between items-center bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Reference Document</span>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const DocumentCard = ({ document }: { document: Document }) => {
    const TypeIcon = getTypeIcon(document.type);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TypeIcon className="w-4 h-4 text-purple-600" />
              <Badge className={`${getTypeColor(document.type)} border-0 text-xs`}>
                {document.type}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              v{document.version}
            </Badge>
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{document.title}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Building className="w-3 h-3" />
              <span>{document.department}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Updated: {new Date(document.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {document.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setSelectedDocument(document)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Document Library</DialogTitle>
              </DialogHeader>
              {selectedDocument && <DocumentViewer document={selectedDocument} />}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">All Documents</h1>
              <p className="text-gray-600">Browse the complete document library</p>
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
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SOPs</p>
                  <p className="text-2xl font-bold text-blue-600">{summaryStats.byType.SOP || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Policies</p>
                  <p className="text-2xl font-bold text-purple-600">{summaryStats.byType.Policy || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recently Updated</p>
                  <p className="text-2xl font-bold text-emerald-600">{summaryStats.recent}</p>
                </div>
                <Clock className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Toggle and Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Cards
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Last Updated</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredDocuments.length} of {allDocuments.length} documents
          </div>
        </div>

        {/* Documents Display */}
        {viewMode === 'table' ? (
          <Card>
            <CardHeader>
              <CardTitle>Document Library</CardTitle>
              <CardDescription>
                Browse and search through all available documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => {
                      const TypeIcon = getTypeIcon(document.type);
                      
                      return (
                        <TableRow key={document.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <TypeIcon className="w-5 h-5 text-gray-400" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{document.title}</p>
                                <p className="text-sm text-gray-500 truncate">{document.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{document.department}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getTypeColor(document.type)} border-0`}>
                              {document.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {new Date(document.lastUpdated).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">v{document.version}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-48">
                              {document.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {document.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{document.tags.length - 2}
                                </Badge>
                              )}
                            </div>
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
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Document Library</DialogTitle>
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
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500">
              {searchTerm || departmentFilter !== 'all' || typeFilter !== 'all' || tagFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No documents are available in the library'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}