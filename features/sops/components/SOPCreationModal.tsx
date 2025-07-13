import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Badge } from "../../../shared/components/ui/badge";
import { toast } from "sonner";
import { 
  FileText,
  Upload,
  X,
  User,
  Users
} from 'lucide-react';

interface DynamicFolder {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  gradient: string;
  iconColor: string;
  createdAt: string;
}

interface SOPCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSOP: (sopData: any) => void;
  folders: DynamicFolder[];
  currentFolderId?: string | null;
  users: any[];
}

export function SOPCreationModal({ 
  isOpen, 
  onClose, 
  onCreateSOP, 
  folders,
  currentFolderId,
  users = []
}: SOPCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    folderId: currentFolderId || '',
    content: '',
    assignedUsers: [] as string[],
    assignedTeams: [] as string[]
  });
  const [contentType, setContentType] = useState<'editor' | 'upload'>('editor');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a SOP title");
      return;
    }

    if (contentType === 'upload' && !uploadedFile) {
      toast.error("Please upload a file or switch to editor mode");
      return;
    }

    if (contentType === 'editor' && !formData.content.trim()) {
      toast.error("Please enter SOP content");
      return;
    }

    const sopData = {
      ...formData,
      file: uploadedFile,
      contentType
    };

    onCreateSOP(sopData);
    handleClose();
    toast.success("SOP created successfully!");
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      folderId: currentFolderId || '',
      content: '',
      assignedUsers: [],
      assignedTeams: []
    });
    setContentType('editor');
    setUploadedFile(null);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.includes(userId)
        ? prev.assignedUsers.filter(id => id !== userId)
        : [...prev.assignedUsers, userId]
    }));
  };

  // Build folder options with hierarchy
  const buildFolderOptions = (parentId: string | null = null, level: number = 0): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    const childFolders = folders.filter(f => f.parentId === parentId);
    
    childFolders.forEach(folder => {
      const indent = '  '.repeat(level);
      options.push(
        <SelectItem key={folder.id} value={folder.id}>
          {indent}{folder.name}
        </SelectItem>
      );
      
      if (level < 2) {
        options.push(...buildFolderOptions(folder.id, level + 1));
      }
    });
    
    return options;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Create New SOP
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">SOP Title *</Label>
              <Input
                id="title"
                placeholder="Enter SOP title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the SOP..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select value={formData.folderId} onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-purple-500">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root (No folder)</SelectItem>
                  {buildFolderOptions()}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant={contentType === 'editor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentType('editor')}
                >
                  Rich Text Editor
                </Button>
                <Button
                  type="button"
                  variant={contentType === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setContentType('upload')}
                >
                  File Upload
                </Button>
              </div>
            </div>

            {contentType === 'editor' ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter SOP content here... (In a real implementation, this would be a rich text editor)"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 min-h-[200px]"
                />
                <p className="text-sm text-gray-500">
                  Note: This would be replaced with a rich text editor in the final implementation
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-6 h-6 text-green-600" />
                        <span className="font-medium text-gray-900">{uploadedFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-purple-600 hover:text-purple-700 font-medium">
                            Click to upload
                          </span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        PDF, DOC, DOCX, TXT up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Assignment Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assign to Users (Optional)</Label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                {users.length > 0 ? (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={formData.assignedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor={`user-${user.id}`} className="flex items-center space-x-2 cursor-pointer">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.name}</span>
                          <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No users available</p>
                )}
              </div>
              {formData.assignedUsers.length > 0 && (
                <p className="text-sm text-gray-600">
                  {formData.assignedUsers.length} user{formData.assignedUsers.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              Create SOP
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}