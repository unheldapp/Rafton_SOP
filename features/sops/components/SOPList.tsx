import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Input } from "../../../shared/components/ui/input";
import { 
  ChevronRight,
  Home,
  Plus,
  Upload,
  Move,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { SOP } from '../App';

interface DynamicFolder {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  gradient: string;
  iconColor: string;
  createdAt: string;
}

interface SOPListProps {
  sops: SOP[];
  selectedFolderId: string | null;
  folders: DynamicFolder[];
  onCreateSOP: () => void;
  onEditSOP: (sop: SOP) => void;
  onViewSOP: (sop: SOP) => void;
  onDeleteSOP: (sop: SOP) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function SOPList({ 
  sops, 
  selectedFolderId, 
  folders, 
  onCreateSOP, 
  onEditSOP, 
  onViewSOP, 
  onDeleteSOP,
  searchTerm,
  onSearchChange
}: SOPListProps) {
  const [selectedSOPs, setSelectedSOPs] = useState<Set<string>>(new Set());

  // Get folder path for breadcrumbs
  const getFolderPath = (folderId: string | null): DynamicFolder[] => {
    if (!folderId) return [];
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];
    const parentPath = folder.parentId ? getFolderPath(folder.parentId) : [];
    return [...parentPath, folder];
  };

  const folderPath = getFolderPath(selectedFolderId);
  const currentFolder = selectedFolderId ? folders.find(f => f.id === selectedFolderId) : null;

  // Filter SOPs based on search and folder
  const filteredSOPs = sops.filter(sop => {
    const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sop.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sop.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, we'll show all SOPs regardless of folder since we don't have folder assignment yet
    // In a real implementation, SOPs would have a folderId property
    return matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSOPs(new Set(filteredSOPs.map(sop => sop.id)));
    } else {
      setSelectedSOPs(new Set());
    }
  };

  const handleSelectSOP = (sopId: string, checked: boolean) => {
    const newSelected = new Set(selectedSOPs);
    if (checked) {
      newSelected.add(sopId);
    } else {
      newSelected.delete(sopId);
    }
    setSelectedSOPs(newSelected);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending-review': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'draft': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-3 h-3" />;
      case 'pending-review': return <Clock className="w-3 h-3" />;
      case 'draft': return <Edit className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Home className="w-4 h-4" />
          <span>Home</span>
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className={index === folderPath.length - 1 ? 'font-medium text-gray-900' : ''}>
                {folder.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={onCreateSOP}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create SOP
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload SOP
            </Button>
            {selectedSOPs.size > 0 && (
              <Button variant="outline" size="sm">
                <Move className="w-4 h-4 mr-2" />
                Move ({selectedSOPs.size})
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search SOPs..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      {/* SOP Table */}
      <div className="flex-1 overflow-auto">
        {filteredSOPs.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="w-12 p-3 text-left">
                  <Checkbox
                    checked={selectedSOPs.size === filteredSOPs.length && filteredSOPs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-900">SOP Title</th>
                <th className="p-3 text-left text-sm font-medium text-gray-900">Created By</th>
                <th className="p-3 text-left text-sm font-medium text-gray-900">Last Updated</th>
                <th className="p-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="w-24 p-3 text-center text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSOPs.map((sop) => (
                <tr key={sop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedSOPs.has(sop.id)}
                      onCheckedChange={(checked) => handleSelectSOP(sop.id, checked as boolean)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <button
                          onClick={() => onViewSOP(sop)}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors text-left"
                        >
                          {sop.title}
                        </button>
                        <p className="text-sm text-gray-500">{sop.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-900">{sop.author}</td>
                  <td className="p-3 text-sm text-gray-500">{sop.lastUpdated}</td>
                  <td className="p-3">
                    <Badge className={`text-xs ${getStatusColor(sop.status)}`}>
                      {getStatusIcon(sop.status)}
                      <span className="ml-1">{sop.status.replace('-', ' ')}</span>
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSOP(sop)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSOP(sop)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSOP(sop)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No SOPs found' : 'No SOPs in this folder'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : currentFolder 
                    ? `Create your first SOP in ${currentFolder.name}` 
                    : 'Create your first SOP or organize them into folders'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={onCreateSOP}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create SOP
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selection Footer */}
      {selectedSOPs.size > 0 && (
        <div className="p-4 bg-purple-50 border-t border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-900">
              {selectedSOPs.size} SOP{selectedSOPs.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Move className="w-4 h-4 mr-2" />
                Move
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSOPs(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}