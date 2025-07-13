import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { 
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Plus
} from 'lucide-react';

interface DynamicFolder {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  gradient: string;
  iconColor: string;
  createdAt: string;
  sopCount?: number;
}

interface FolderTreeProps {
  folders: DynamicFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  sopCounts: { [key: string]: number };
}

export function FolderTree({ 
  folders, 
  selectedFolderId, 
  onSelectFolder, 
  onCreateFolder,
  sopCounts 
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const buildFolderTree = (parentId: string | null = null, level: number = 0): DynamicFolder[] => {
    return folders
      .filter(folder => folder.parentId === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderFolderItem = (folder: DynamicFolder, level: number) => {
    const hasChildren = folders.some(f => f.parentId === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const sopCount = sopCounts[folder.id] || 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-purple-100 text-purple-900' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          {/* Expand/Collapse Toggle */}
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : null}
          </div>

          {/* Folder Icon */}
          <div className="mr-2">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )}
          </div>

          {/* Folder Name */}
          <span className="flex-1 text-sm font-medium truncate">
            {folder.name}
          </span>

          {/* SOP Count */}
          {sopCount > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs bg-gray-200 text-gray-700">
              {sopCount}
            </Badge>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && level < 2 && (
          <div>
            {buildFolderTree(folder.id, level + 1).map(childFolder => 
              renderFolderItem(childFolder, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = buildFolderTree(null, 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Folders</h2>
        <Button
          size="sm"
          onClick={onCreateFolder}
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Folder
        </Button>
      </div>

      {/* Folder Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* All SOPs Root */}
        <div
          className={`flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors mb-2 ${
            selectedFolderId === null 
              ? 'bg-purple-100 text-purple-900' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => onSelectFolder(null)}
        >
          <div className="w-5 h-5 mr-1"></div>
          <div className="mr-2">
            <Folder className="h-4 w-4 text-blue-500" />
          </div>
          <span className="flex-1 text-sm font-medium">All SOPs</span>
          <Badge variant="secondary" className="ml-2 text-xs bg-gray-200 text-gray-700">
            {Object.values(sopCounts).reduce((sum, count) => sum + count, 0)}
          </Badge>
        </div>

        {/* Folder Tree */}
        <div className="space-y-1">
          {rootFolders.map(folder => renderFolderItem(folder, 0))}
        </div>

        {/* Empty State */}
        {rootFolders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Folder className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No folders yet</p>
            <p className="text-xs text-gray-400">Create your first folder to organize SOPs</p>
          </div>
        )}
      </div>
    </div>
  );
}