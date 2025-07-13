import React, { useState, useEffect } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Badge } from "../../../shared/components/ui/badge";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Search,
  Plus,
  Upload,
  Grid3X3,
  List,
  Folder,
  FileText,
  Clock,
  CheckCircle,
  Edit,
  MoreHorizontal,
  Eye,
  Trash2,
  Filter,
  X,
  ChevronRight,
  Home,
  AlertCircle,
  Loader2,
  UserCheck
} from 'lucide-react';
import { useSOPs, useFolders, useAssignments } from '../../../shared/hooks/useSOPs';
import { useUsers } from '../../../shared/hooks/useUsers';
import { SOPWithDetails, SOPFilters, FolderWithSOPCount } from '../../../shared/services/sopService';
import { User } from '../../../shared/types';
import { FolderCreationTrigger } from './FolderCreationDialog';
import { SOPAssignmentModal } from './SOPAssignmentModal';

interface SOPsPageProps {
  onNavigate: (page: any, sop?: SOPWithDetails, folderId?: string) => void;
  currentUser: User;
}

type ViewMode = 'grid' | 'list';

export function SOPsPage({ onNavigate, currentUser }: SOPsPageProps) {
  // State management
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SOPFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  // Assignment modal state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [sopToAssign, setSopToAssign] = useState<SOPWithDetails | null>(null);
  const [selectedSOP, setSelectedSOP] = useState<SOPWithDetails | null>(null);

  // Hooks
  const { 
    sops, 
    loading: sopsLoading, 
    error: sopsError, 
    total, 
    fetchSOPs, 
    createSOP, 
    updateSOP, 
    deleteSOP, 
    publishSOP,
    uploadSOPFile 
  } = useSOPs();
  
  const { 
    folders, 
    loading: foldersLoading, 
    error: foldersError, 
    fetchFolders, 
    createFolder, 
    updateFolder, 
    deleteFolder 
  } = useFolders();

  const { users } = useUsers();

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const searchFilters: SOPFilters = {
      ...filters,
      // Handle folder filtering properly:
      // - When currentFolderId is null (root level): show only SOPs with no folder (folder_id = null)
      // - When currentFolderId has a value: show only SOPs in that folder
      folderId: currentFolderId === null ? 'null' : currentFolderId || undefined,
      search: searchTerm || undefined
    };

    fetchSOPs({
      page: currentPage,
      limit: 20,
      filters: searchFilters,
      sortBy: 'updated_at',
      sortOrder: 'desc'
    });
  }, [currentFolderId, searchTerm, filters, currentPage, fetchSOPs]);

  useEffect(() => {
    fetchFolders(currentFolderId);
  }, [currentFolderId, fetchFolders]);

  // Get current folder and breadcrumb path
  const getCurrentFolder = (): FolderWithSOPCount | null => {
    if (!currentFolderId) return null;
    return findFolderById(folders, currentFolderId);
  };

  const findFolderById = (folderList: FolderWithSOPCount[], id: string): FolderWithSOPCount | null => {
    for (const folder of folderList) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getBreadcrumbPath = (): FolderWithSOPCount[] => {
    if (!currentFolderId) return [];
    const path: FolderWithSOPCount[] = [];
    
    const buildPath = (folderId: string) => {
      const folder = findFolderById(folders, folderId);
      if (folder) {
        if (folder.parent_id) {
          buildPath(folder.parent_id);
        }
        path.push(folder);
      }
    };
    
    buildPath(currentFolderId);
    return path;
  };

  // Event handlers
  const handleCreateFolder = async (data: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }) => {
    try {
      await createFolder({
        ...data,
        parentId: currentFolderId || undefined
      });
      toast.success(`Folder "${data.name}" created successfully!`);
    } catch (error) {
      toast.error('Failed to create folder');
      console.error(error);
    }
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSelectedItems(new Set());
    setCurrentPage(1);
  };

  const handleCreateSOP = () => {
    onNavigate('template-selector', undefined, currentFolderId);
  };

  const handleEditSOP = (sop: SOPWithDetails) => {
    onNavigate('editor', sop, currentFolderId);
  };

  const handleViewSOP = (sop: SOPWithDetails) => {
    // Increment view count and navigate to editor in view mode
    onNavigate('editor', { ...sop, viewMode: 'view' }, currentFolderId);
  };

  const handleDeleteSOP = async (sop: SOPWithDetails) => {
    if (confirm(`Are you sure you want to delete "${sop.title}"?`)) {
      try {
        await deleteSOP(sop.id);
        toast.success('SOP deleted successfully!');
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(sop.id);
          return newSet;
        });
      } catch (error) {
        toast.error('Failed to delete SOP');
        console.error(error);
      }
    }
  };

  const handlePublishSOP = async (sop: SOPWithDetails) => {
    try {
      await publishSOP(sop.id);
      toast.success('SOP published successfully!');
    } catch (error) {
      toast.error('Failed to publish SOP');
      console.error(error);
    }
  };

  const handleAssignSOP = (sop: SOPWithDetails) => {
    setSopToAssign(sop);
    setShowAssignmentModal(true);
  };

  const handleAssignmentModalClose = () => {
    setShowAssignmentModal(false);
    setSopToAssign(null);
  };

  const handleFileUpload = async (file: File) => {
    try {
      // For now, we'll create a new SOP from the uploaded file
      const sopData = {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        description: `Uploaded document: ${file.name}`,
        content: `# ${file.name}\n\nThis document was uploaded on ${new Date().toLocaleDateString()}.`,
        folderId: currentFolderId || undefined,
        department: currentUser.department || undefined
      };

      const newSOP = await createSOP(sopData);
      
      // Upload the file as an attachment
      await uploadSOPFile(file, newSOP.id);
      
      toast.success('File uploaded and SOP created successfully!');
    } catch (error) {
      toast.error('Failed to upload file');
      console.error(error);
    }
  };

  const handleItemSelect = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} item(s)?`)) {
      try {
        const deletePromises = Array.from(selectedItems).map(async (itemId) => {
          const sop = sops.find(s => s.id === itemId);
          if (sop) {
            await deleteSOP(itemId);
          }
        });
        
        await Promise.all(deletePromises);
        toast.success(`${selectedItems.size} item(s) deleted successfully!`);
        setSelectedItems(new Set());
      } catch (error) {
        toast.error('Failed to delete some items');
        console.error(error);
      }
    }
  };

  const handleFilterChange = (key: keyof SOPFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : [value]
    }));
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'review': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'draft': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'archived': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-3 h-3" />;
      case 'review': return <Clock className="w-3 h-3" />;
      case 'approved': return <CheckCircle className="w-3 h-3" />;
      case 'draft': return <Edit className="w-3 h-3" />;
      case 'archived': return <FileText className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const breadcrumbPath = getBreadcrumbPath();
  const departments = Array.from(new Set(sops.map(sop => sop.department).filter(Boolean)));
  const isLoading = sopsLoading || foldersLoading;

  // Error display
  if (sopsError || foldersError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading SOPs: {sopsError || foldersError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Optional Filters Sidebar */}
      {showFilters && (
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select 
                value={filters.status?.[0] || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Priority</label>
              <Select 
                value={filters.priority?.[0] || 'all'} 
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
              <Select 
                value={filters.department?.[0] || 'all'} 
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">SOPs</h1>
                <p className="text-sm text-gray-500">
                  Manage your Standard Operating Procedures ({total} total)
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => setCurrentFolderId(null)}
              className="flex items-center hover:text-gray-900 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </button>
            {breadcrumbPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setCurrentFolderId(folder.id)}
                  className={`hover:text-gray-900 transition-colors ${
                    index === breadcrumbPath.length - 1 ? 'font-medium text-gray-900' : ''
                  }`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderCreationTrigger
                onCreateFolder={handleCreateFolder}
                currentFolderId={currentFolderId}
              />
              <Button
                onClick={handleCreateSOP}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create SOP
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx,.txt';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileUpload(file);
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload SOP
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search SOPs and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mr-3" />
              <span className="text-gray-600">Loading SOPs...</span>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {/* Folders */}
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedItems.has(folder.id)}
                      onCheckedChange={(checked) => handleItemSelect(folder.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: folder.color || '#8b5cf6' }}
                    >
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate w-full">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {folder.sopCount || 0} items
                    </p>
                  </div>
                </div>
              ))}

              {/* SOPs */}
              {sops.map((sop) => (
                <div
                  key={sop.id}
                  className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleViewSOP(sop)}
                >
                  <div className="absolute top-2 left-2">
                    <Checkbox
                      checked={selectedItems.has(sop.id)}
                      onCheckedChange={(checked) => handleItemSelect(sop.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm truncate w-full">
                      {sop.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      v{sop.version} • {new Date(sop.updated_at).toLocaleDateString()}
                    </p>
                    <Badge className={`text-xs mt-2 ${getStatusColor(sop.status)}`}>
                      {getStatusIcon(sop.status)}
                      <span className="ml-1">{sop.status}</span>
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSOP(sop);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {currentUser.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignSOP(sop);
                          }}
                          className="h-6 w-6 p-0"
                          title="Assign to users"
                        >
                          <UserCheck className="w-3 h-3" />
                        </Button>
                      )}
                      {currentUser.role === 'admin' && sop.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishSOP(sop);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 p-3 text-left">
                      <Checkbox />
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-900">Name</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-900">Author</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-900">Last Updated</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="w-20 p-3 text-center text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Folders */}
                  {folders.map((folder) => (
                    <tr
                      key={folder.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleFolderClick(folder.id)}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedItems.has(folder.id)}
                          onCheckedChange={(checked) => handleItemSelect(folder.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: folder.color || '#8b5cf6' }}
                          >
                            <Folder className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{folder.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-500">Folder</td>
                      <td className="p-3 text-sm text-gray-500">-</td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(folder.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">
                          {folder.sopCount || 0} items
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* SOPs */}
                  {sops.map((sop) => (
                    <tr
                      key={sop.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewSOP(sop)}
                    >
                      <td className="p-3">
                        <Checkbox
                          checked={selectedItems.has(sop.id)}
                          onCheckedChange={(checked) => handleItemSelect(sop.id, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-200 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{sop.title}</span>
                            <p className="text-sm text-gray-500">v{sop.version} • {sop.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-500">SOP Document</td>
                      <td className="p-3 text-sm text-gray-500">
                        {sop.author ? `${sop.author.first_name} ${sop.author.last_name}` : 'Unknown'}
                      </td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(sop.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${getStatusColor(sop.status)}`}>
                          {getStatusIcon(sop.status)}
                          <span className="ml-1">{sop.status}</span>
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewSOP(sop);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSOP(sop);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {currentUser.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignSOP(sop);
                              }}
                              className="h-6 w-6 p-0"
                              title="Assign to users"
                            >
                              <UserCheck className="w-3 h-3" />
                            </Button>
                          )}
                          {currentUser.role === 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSOP(sop);
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && folders.length === 0 && sops.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No items found' : 'This folder is empty'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters' 
                  : 'Create your first SOP or folder to get started'
                }
              </p>
              {!searchTerm && (
                <div className="flex items-center justify-center space-x-3">
                  <FolderCreationTrigger
                    onCreateFolder={handleCreateFolder}
                    currentFolderId={currentFolderId}
                  />
                  <Button
                    onClick={handleCreateSOP}
                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create SOP
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} results
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage * 20 >= total}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Selection Footer */}
        {selectedItems.size > 0 && (
          <div className="bg-purple-50 border-t border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-purple-900">
                {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Move
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Assignment Modal */}
      {sopToAssign && (
        <SOPAssignmentModal
          isOpen={showAssignmentModal}
          onClose={handleAssignmentModalClose}
          sop={sopToAssign}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}