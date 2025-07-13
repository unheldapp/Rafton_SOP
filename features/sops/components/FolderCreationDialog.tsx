import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../../../shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Folder, Plus, X } from 'lucide-react';

interface FolderCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (data: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }) => Promise<void>;
  currentFolderId?: string | null;
}

const FOLDER_COLORS = [
  { value: '#8b5cf6', label: 'Purple', bg: 'bg-purple-500' },
  { value: '#ef4444', label: 'Red', bg: 'bg-red-500' },
  { value: '#f59e0b', label: 'Orange', bg: 'bg-orange-500' },
  { value: '#10b981', label: 'Green', bg: 'bg-green-500' },
  { value: '#3b82f6', label: 'Blue', bg: 'bg-blue-500' },
  { value: '#6366f1', label: 'Indigo', bg: 'bg-indigo-500' },
  { value: '#ec4899', label: 'Pink', bg: 'bg-pink-500' },
  { value: '#06b6d4', label: 'Cyan', bg: 'bg-cyan-500' }
];

const FOLDER_ICONS = [
  { value: 'folder', label: 'Default Folder' },
  { value: 'folder-open', label: 'Open Folder' },
  { value: 'archive', label: 'Archive' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'shield-check', label: 'Security' },
  { value: 'cog', label: 'Settings' },
  { value: 'users', label: 'Team' },
  { value: 'star', label: 'Important' }
];

export function FolderCreationDialog({ 
  isOpen, 
  onClose, 
  onCreateFolder, 
  currentFolderId 
}: FolderCreationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8b5cf6',
    icon: 'folder'
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Folder name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Folder name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Folder name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onCreateFolder({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon
      });
      
      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        color: '#8b5cf6',
        icon: 'folder'
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedColor = FOLDER_COLORS.find(c => c.value === formData.color);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-purple-600" />
            <span>Create New Folder</span>
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your SOPs. Choose a name, color, and icon that best represents the contents.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="folderName" className="text-sm font-medium text-gray-700">
              Folder Name *
            </Label>
            <Input
              id="folderName"
              type="text"
              placeholder="Enter folder name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="folderDescription" className="text-sm font-medium text-gray-700">
              Description (Optional)
            </Label>
            <Textarea
              id="folderDescription"
              placeholder="Enter folder description..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`resize-none ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
              rows={3}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Folder Color
            </Label>
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleInputChange('color', color.value)}
                  className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center transition-all ${
                    formData.color === color.value 
                      ? 'ring-2 ring-gray-800 ring-offset-2' 
                      : 'hover:scale-110'
                  }`}
                  disabled={isSubmitting}
                  title={color.label}
                >
                  {formData.color === color.value && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Folder Icon
            </Label>
            <Select 
              value={formData.icon} 
              onValueChange={(value) => handleInputChange('icon', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLDER_ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Preview
            </Label>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: formData.color }}
              >
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {formData.name || 'Folder Name'}
                </p>
                {formData.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Folder</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Trigger component for easy use
export function FolderCreationTrigger({ 
  onCreateFolder, 
  currentFolderId,
  children 
}: {
  onCreateFolder: (data: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }) => Promise<void>;
  currentFolderId?: string | null;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children || (
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Folder
          </Button>
        )}
      </div>
      
      <FolderCreationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreateFolder={onCreateFolder}
        currentFolderId={currentFolderId}
      />
    </>
  );
}