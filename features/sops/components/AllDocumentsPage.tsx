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
import { useDocuments } from "../../../shared/hooks/useDocuments";
import { EmployeeDocument } from "../../../shared/services/documentService";
import { useAuth } from "../../../shared/context/AuthContext";
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
  ExternalLink,
  RefreshCw,
  Loader2,
  TrendingUp
} from 'lucide-react';

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
  const [selectedDocument, setSelectedDocument] = useState<EmployeeDocument | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'title' | 'department' | 'lastUpdated' | 'type'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get current user's company ID from AuthContext
  const { currentUser: authUser } = useAuth();
  const companyId = authUser?.company?.id || '';

  console.log('AllDocumentsPage: authUser:', authUser);
  console.log('AllDocumentsPage: companyId:', companyId);

  // Use the real documents hook
  const { 
    documents, 
    loading, 
    error, 
    stats, 
    refreshDocuments, 
    incrementViewCount, 
    incrementDownloadCount 
  } = useDocuments(companyId);

  // Get unique values for filters
  const departments = useMemo(() => 
    [...new Set(documents.map(doc => doc.department).filter(Boolean))], 
    [documents]
  );
  const documentTypes = useMemo(() => 
    [...new Set(documents.map(doc => doc.type))], 
    [documents]
  );
  const allTags = useMemo(() => 
    [...new Set(documents.flatMap(doc => doc.tags))], 
    [documents]
  );

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.author.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.author.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      
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
          aValue = (a.department || '').toLowerCase();
          bValue = (b.department || '').toLowerCase();
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
  }, [documents, searchTerm, departmentFilter, typeFilter, tagFilter, sortBy, sortOrder]);

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

  const handleViewDocument = async (document: EmployeeDocument) => {
    setSelectedDocument(document);
    try {
      await incrementViewCount(document.id);
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const handleDownloadDocument = async (document: EmployeeDocument) => {
    try {
      await incrementDownloadCount(document.id);
      if (document.downloadUrl) {
        window.open(document.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const DocumentViewer = ({ document }: { document: EmployeeDocument }) => {
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
          {document.description && (
            <p className="text-gray-600 mb-4">{document.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>{document.department || 'General'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{document.author.firstName} {document.author.lastName}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Updated: {new Date(document.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{document.fileSize || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Document Content</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{document.viewCount} views</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Download className="w-4 h-4" />
                <span>{document.downloadCount} downloads</span>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-96 border rounded-lg p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm text-gray-700">
                {document.content}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {document.tags && document.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {document.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>Published: {document.publishedAt ? new Date(document.publishedAt).toLocaleDateString() : 'N/A'}</p>
              {document.expiresAt && (
                <p>Expires: {new Date(document.expiresAt).toLocaleDateString()}</p>
              )}
            </div>
            {document.downloadUrl && (
              <Button onClick={() => handleDownloadDocument(document)} className="bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const DocumentCard = ({ document }: { document: EmployeeDocument }) => {
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
          {document.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{document.description}</p>
          )}
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Building className="w-3 h-3" />
              <span>{document.department || 'General'}</span>
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
                onClick={() => handleViewDocument(document)}
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

  // Show loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading document library...</p>
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
            <p className="text-red-600 mb-4">Error loading documents</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={refreshDocuments} variant="outline">
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
              <Button 
                onClick={refreshDocuments}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Updates</p>
                  <p className="text-2xl font-bold text-green-600">{stats.recent}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-blue-600">{Object.keys(stats.byDepartment).length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.expiringSoon}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Mode and Sorting Controls */}
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
            Showing {filteredDocuments.length} of {documents.length} documents
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
                              <span className="text-sm text-gray-900">{document.department || 'General'}</span>
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
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDocument(document)}
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
                              
                              {document.downloadUrl && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDownloadDocument(document)}
                                >
                                  <Download className="w-4 h-4" />
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