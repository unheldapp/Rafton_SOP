import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Badge } from "../../../shared/components/ui/badge";
import { Separator } from "../../../shared/components/ui/separator";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { 
  Save,
  Send,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code,
  Table,
  Image,
  Paperclip,
  MessageSquare,
  AtSign,
  Clock,
  Users,
  Eye,
  ArrowLeft,
  MoreHorizontal,
  Share,
  Download,
  Settings,
  FileText,
  Calendar,
  User,
  Building2,
  Hash,
  Zap,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  ChevronDown,
  FilePlus,
  Trash2,
  Edit2
} from 'lucide-react';
import { useSOPs } from '../../../shared/hooks/useSOPs';
import { useUsers } from '../../../shared/hooks/useUsers';
import { SOPWithDetails, SOPService } from '../../../shared/services/sopService';
import { OrganizationService, OrganizationData } from '../../../shared/services/organizationService';
import { User as UserType } from '../../../shared/types';

interface Template {
  id: string;
  title: string;
  description: string;
  department: string;
  content: string;
}

interface SOPEditorProps {
  sop?: SOPWithDetails | null;
  template?: Template | null;
  onNavigate: (page: any, sop?: SOPWithDetails) => void;
  onSubmitForReview?: (sopId: string, changes: { title: string; content: string; department: string }) => void;
  currentUser: UserType;
  currentFolderId?: string | null;
}

interface Page {
  id: string;
  title: string;
  content: string;
}

export function SOPEditor({ sop, template, onNavigate, onSubmitForReview, currentUser, currentFolderId }: SOPEditorProps) {
  // State management
  const [title, setTitle] = useState(
    sop?.title || 
    template?.title || 
    'Untitled SOP'
  );
  const [department, setDepartment] = useState(
    sop?.department || 
    template?.department || 
    ''
  );
  const [pages, setPages] = useState<Page[]>([{
    id: 'page-1',
    title: 'Page 1',
    content: sop?.content || template?.content || ''
  }]);
  const [currentPageId, setCurrentPageId] = useState('page-1');
  const [priority, setPriority] = useState(sop?.priority || 'medium');
  const [categoryId, setCategoryId] = useState(sop?.category_id || 'none');
  const [teamId, setTeamId] = useState('none');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [currentSOPId, setCurrentSOPId] = useState<string | null>(sop?.id || null);
  const [hasBeenSavedOnce, setHasBeenSavedOnce] = useState(!!sop?.id);
  
  // Organization data
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [loadingOrganization, setLoadingOrganization] = useState(true);

  // Hooks
  const { 
    createSOP, 
    updateSOP, 
    uploadSOPFile, 
    loading,
    publishSOP
  } = useSOPs();
  const { users } = useUsers();
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const titleInputRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout>();

  // Focus title input on mount if it's a new SOP
  useEffect(() => {
    if (!sop?.id && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 100);
    }
  }, [sop?.id]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!isDirty || isAutoSaving) return;

    setIsAutoSaving(true);
    try {
      // Convert HTML content to plain text for database storage while preserving line breaks
      const convertHTMLToText = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Replace HTML elements with line breaks to preserve formatting
        const elements = tempDiv.querySelectorAll('*');
        elements.forEach(element => {
          if (['BR', 'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
            element.replaceWith(element.textContent + '\n');
          }
        });
        
        return tempDiv.textContent || tempDiv.innerText || '';
      };

      // For single page documents, don't add page headers unless there are multiple pages
      let fullContent: string;
      if (pages.length === 1) {
        const plainTextContent = convertHTMLToText(pages[0].content);
        fullContent = plainTextContent;
      } else {
        fullContent = pages.map(page => {
          const plainTextContent = convertHTMLToText(page.content);
          return `### ${page.title}\n\n${plainTextContent}`;
        }).join('\n\n--- Page Break ---\n\n');
      }

      if (currentSOPId) {
        // Update existing SOP
        await updateSOP(currentSOPId, {
          title,
          content: fullContent,
          department: department || undefined,
          priority,
          categoryId: categoryId === 'none' ? undefined : categoryId,
          folderId: currentFolderId || undefined
        });
      } else if (title.trim() && fullContent.trim()) {
        // Create new SOP only if we don't have an existing ID
        const newSOP = await createSOP({
          title,
          content: fullContent,
          department: department || undefined,
          priority,
          categoryId: categoryId === 'none' ? undefined : categoryId,
          folderId: currentFolderId || undefined
        });
        
        // Set the new SOP ID to prevent creating duplicates
        setCurrentSOPId(newSOP.id);
        setHasBeenSavedOnce(true);
      }
      
      setLastSaved(new Date());
      setIsDirty(false);
      toast.success('Changes saved automatically');
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsAutoSaving(false);
    }
  }, [currentSOPId, hasBeenSavedOnce, title, pages, department, priority, categoryId, isDirty, isAutoSaving, updateSOP, createSOP, currentFolderId]);

  // Set up auto-save timer
  useEffect(() => {
    if (isDirty) {
      autoSaveRef.current = setTimeout(autoSave, 3000); // Auto-save after 3 seconds of inactivity
    }
    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [isDirty, autoSave]);

  // Load real data when SOP is provided
  useEffect(() => {
    if (sop?.id) {
      setCurrentSOPId(sop.id);
      setHasBeenSavedOnce(true);
      loadSOPData(sop.id);
    }
  }, [sop?.id]);

  // Load organizational data on mount
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setLoadingOrganization(true);
        const orgData = await OrganizationService.getOrganizationData();
        setOrganizationData(orgData);
        
        // If current user has a department that's not in the list, add it
        if (currentUser.department && !orgData.departments.includes(currentUser.department)) {
          orgData.departments.push(currentUser.department);
          orgData.departments.sort();
        }
        
        setOrganizationData(orgData);
      } catch (error) {
        console.error('Error loading organization data:', error);
        toast.error('Failed to load organization data');
        
        // Fallback to basic data with current user's department
        const fallbackData: OrganizationData = {
          departments: currentUser.department ? [currentUser.department] : [],
          teams: [],
          categories: [],
          users: [currentUser as any]
        };
        setOrganizationData(fallbackData);
      } finally {
        setLoadingOrganization(false);
      }
    };

    loadOrganizationData();
  }, [currentUser]);

  // Mark as dirty when content changes (including new fields)
  useEffect(() => {
    setIsDirty(true);
  }, [title, pages, department, priority, categoryId, teamId]);

  // Set editor content when page changes
  useEffect(() => {
    const editor = editorRefs.current[currentPageId];
    if (editor) {
      editor.innerHTML = pages.find(page => page.id === currentPageId)?.content || '';
    }
  }, [currentPageId]);

  const loadSOPData = async (sopId: string) => {
    try {
      // Load real data from API
      const [collaboratorsData, commentsData, versionsData] = await Promise.all([
        SOPService.getCollaborators(sopId),
        SOPService.getComments(sopId),
        SOPService.getVersionHistory(sopId)
      ]);
      
      // Transform collaborators data
      const transformedCollaborators = collaboratorsData.map((collab: any) => ({
        id: collab.user.id,
        name: `${collab.user.first_name} ${collab.user.last_name}`,
        email: collab.user.email,
        avatar: `${collab.user.first_name.charAt(0)}${collab.user.last_name.charAt(0)}`,
        active: collab.status === 'active',
        color: `bg-${['blue', 'green', 'purple', 'orange', 'pink'][Math.floor(Math.random() * 5)]}-500`
      }));
      
      // Transform comments data
      const transformedComments = commentsData.map((comment: any) => ({
        id: comment.id,
        author: `${comment.user.first_name} ${comment.user.last_name}`,
        time: new Date(comment.created_at).toLocaleDateString(),
        content: comment.content,
        resolved: comment.is_resolved
      }));
      
      // Transform version history data
      const transformedVersions = versionsData.map((version: any) => ({
        version: version.version,
        date: new Date(version.created_at).toLocaleDateString(),
        time: new Date(version.created_at).toLocaleTimeString(),
        author: `${version.author.first_name} ${version.author.last_name}`,
        changes: version.change_summary || 'No summary provided'
      }));
      
      setCollaborators(transformedCollaborators);
      setComments(transformedComments);
      setVersionHistory(transformedVersions);

      // Split content into pages if sop exists
      if (sop?.content) {
        // Check if content has page breaks (multi-page format)
        if (sop.content.includes('\n\n--- Page Break ---\n\n')) {
          const pageContents = sop.content.split('\n\n--- Page Break ---\n\n');
          const loadedPages = pageContents.map((content, index) => {
            const titleMatch = content.match(/^### (.*)\n\n/);
            const pageContent = titleMatch ? content.replace(/^### .*\n\n/, '') : content;
            return {
              id: `page-${index + 1}`,
              title: titleMatch ? titleMatch[1] : `Page ${index + 1}`,
              content: pageContent
            };
          });
          setPages(loadedPages);
          setCurrentPageId(loadedPages[0].id);
        } else {
          // Single page content - check if it has a header
          const titleMatch = sop.content.match(/^### (.*)\n\n/);
          const pageContent = titleMatch ? sop.content.replace(/^### .*\n\n/, '') : sop.content;
          const pageTitle = titleMatch ? titleMatch[1] : 'Page 1';
          
          setPages([{
            id: 'page-1',
            title: pageTitle,
            content: pageContent
          }]);
          setCurrentPageId('page-1');
        }
      }
    } catch (error) {
      console.error('Error loading SOP data:', error);
      // Fallback to empty arrays
      setCollaborators([]);
      setComments([]);
      setVersionHistory([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    
    try {
      if (sop?.id) {
        // Upload file for existing SOP
        await uploadSOPFile(file, sop.id);
        toast.success('File uploaded successfully');
      } else {
        // Store file for new SOP creation
        toast.success('File ready to upload with SOP');
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload file');
    }
  };

  const handleManualSave = async () => {
    
    if (!isDirty && !(!hasBeenSavedOnce && title.trim())) {
      toast.info('No changes to save');
      return;
    }
    
    setIsAutoSaving(true);
    try {
      await autoSave();
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('Failed to save document');
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    // Convert HTML content to plain text for database storage while preserving line breaks
    const convertHTMLToText = (html: string) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Replace HTML elements with line breaks to preserve formatting
      const elements = tempDiv.querySelectorAll('*');
      elements.forEach(element => {
        if (['BR', 'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
          element.replaceWith(element.textContent + '\n');
        }
      });
      
      return tempDiv.textContent || tempDiv.innerText || '';
    };

    // For single page documents, don't add page headers unless there are multiple pages
    let fullContent: string;
    if (pages.length === 1) {
      const plainTextContent = convertHTMLToText(pages[0].content);
      fullContent = plainTextContent;
    } else {
      fullContent = pages.map(page => {
        const plainTextContent = convertHTMLToText(page.content);
        return `### ${page.title}\n\n${plainTextContent}`;
      }).join('\n\n--- Page Break ---\n\n');
    }

    let sopIdForReview = currentSOPId;

    try {
      if (!currentSOPId) {
        // Create new SOP first if it doesn't exist
        toast.info('Creating SOP and submitting for review...');
        const newSOP = await createSOP({
          title,
          content: fullContent,
          department: department || undefined,
          priority,
          categoryId: categoryId === 'none' ? undefined : categoryId,
          folderId: currentFolderId || undefined
        });
        
        sopIdForReview = newSOP.id;
        setCurrentSOPId(newSOP.id);
        setHasBeenSavedOnce(true);
      } else {
        // Update existing SOP first
        await updateSOP(currentSOPId, {
          title,
          content: fullContent,
          department: department || undefined,
          priority,
          categoryId: categoryId === 'none' ? undefined : categoryId,
          folderId: currentFolderId || undefined
        });
      }
      
      // Submit for review
      const changes = { title, content: fullContent, department };
      onSubmitForReview?.(sopIdForReview!, changes);
    } catch (error) {
      console.error('Failed to prepare SOP for review:', error);
      toast.error('Failed to submit for review');
    }
  };

  const handleDirectPublish = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only administrators can directly publish SOPs');
      return;
    }

    try {
      // Convert HTML content to plain text for database storage while preserving line breaks
      const convertHTMLToText = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Replace HTML elements with line breaks to preserve formatting
        const elements = tempDiv.querySelectorAll('*');
        elements.forEach(element => {
          if (['BR', 'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.tagName)) {
            element.replaceWith(element.textContent + '\n');
          }
        });
        
        return tempDiv.textContent || tempDiv.innerText || '';
      };

      // For single page documents, don't add page headers unless there are multiple pages
      let fullContent: string;
      if (pages.length === 1) {
        const plainTextContent = convertHTMLToText(pages[0].content);
        fullContent = plainTextContent;
      } else {
        fullContent = pages.map(page => {
          const plainTextContent = convertHTMLToText(page.content);
          return `### ${page.title}\n\n${plainTextContent}`;
        }).join('\n\n--- Page Break ---\n\n');
      }

      let sopIdToPublish = currentSOPId;

      if (currentSOPId) {
        // Update existing SOP first
        await updateSOP(currentSOPId, {
          title,
          content: fullContent,
          department: department || undefined,
          priority,
          categoryId: categoryId === 'none' ? undefined : categoryId,
          folderId: currentFolderId || undefined
        });
      } else {
        // Create new SOP first
        const newSOP = await createSOP({
          title,
          content: fullContent,
          department: department || undefined,
          priority,
          categoryId: categoryId === 'none' ? undefined : categoryId,
          folderId: currentFolderId || undefined
        });
        
        sopIdToPublish = newSOP.id;
        setCurrentSOPId(newSOP.id);
        setHasBeenSavedOnce(true);
      }
      
      // Then publish it
      await publishSOP(sopIdToPublish!);
      toast.success('SOP published successfully!');
      onNavigate('sops');
    } catch (error) {
      console.error('Failed to publish SOP:', error);
      toast.error('Failed to publish SOP');
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !sop?.id) return;
    
    try {
      // Use real API call
      const comment = await SOPService.addComment(sop.id, newComment, currentUser.id);
      
      // Transform the response to match our local format
      const transformedComment = {
        id: comment.id,
        author: `${comment.user.first_name} ${comment.user.last_name}`,
        time: 'Just now',
        content: comment.content,
        resolved: comment.is_resolved
      };
      
      setComments(prev => [transformedComment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const getBackButtonText = () => {
    if (sop) return 'Back to SOPs';
    if (template) return 'Back to Templates';
    return 'Back to SOPs';
  };

  const getBackDestination = () => {
    if (sop) return 'sops';
    if (template) return 'template-selector';
    return 'sops';
  };

  const getSaveStatusText = () => {
    if (isAutoSaving) return 'Saving...';
    if (lastSaved) return `Last saved: ${lastSaved.toLocaleTimeString()}`;
    if (isDirty) return 'Unsaved changes';
    return 'All changes saved';
  };

  const addPage = () => {
    const newPage: Page = {
      id: `page-${pages.length + 1}`,
      title: `Page ${pages.length + 1}`,
      content: ''
    };
    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
    setIsDirty(true);
  };

  const updatePageContent = (pageId: string, newContent: string) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, content: newContent } : page
    ));
    setIsDirty(true);
  };

  const updatePageTitle = (pageId: string, newTitle: string) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, title: newTitle } : page
    ));
    setIsDirty(true);
    setEditingPageId(null);
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the last page');
      return;
    }
    const newPages = pages.filter(page => page.id !== pageId);
    setPages(newPages);
    setCurrentPageId(newPages[0].id);
    setIsDirty(true);
  };

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onNavigate(getBackDestination());
                }}
                type="button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {getBackButtonText()}
              </Button>
              
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  onFocus={() => {
                  }}
                  onClick={() => {
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="border border-gray-200 px-3 py-1 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors min-w-[300px] rounded-md cursor-text"
                  placeholder="Untitled SOP"
                  type="text"
                  tabIndex={1}
                  autoComplete="off"
                  data-testid="sop-title-input"
                  ref={titleInputRef}
                />
              </div>
              
              {template && !sop && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  From Template
                </Badge>
              )}
              
              {/* Save Status */}
              <div className="flex items-center space-x-2 text-sm">
                {isAutoSaving && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                <span className={`${isDirty ? 'text-amber-600' : 'text-green-600'}`}>
                  {getSaveStatusText()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Collaborators */}
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collaborator, index) => (
                  <Avatar key={index} className="w-8 h-8 border-2">
                      <AvatarFallback className={`${collaborator.color} text-white text-xs`}>
                        {collaborator.avatar}
                      </AvatarFallback>
                    </Avatar>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualSave} 
                  disabled={!isDirty && hasBeenSavedOnce}
                  type="button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {hasBeenSavedOnce ? 'Save' : 'Save Document'}
                </Button>
                
                {currentUser.role === 'admin' && (
                  <Button variant="default" size="sm" onClick={handleDirectPublish} disabled={loading} type="button">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                )}
                
                <Button variant="outline" size="sm" onClick={handleSubmitForReview} disabled={loading} type="button">
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
                
                <Button variant="ghost" size="sm" type="button">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button variant="ghost" size="sm" type="button">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Enhanced Toolbar */}
          <div className="flex flex-wrap items-center gap-1 mt-3 py-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              {/* File Upload Button - Prominent */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" 
                  type="button"
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
              </div>
              
              <Separator orientation="vertical" className="h-6 mx-2" />
              
              {/* Formatting Tools */}
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('bold')} type="button">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('italic')} type="button">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('underline')} type="button">
                <Underline className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('strikeThrough')} type="button">
                <Strikethrough className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('insertUnorderedList')} type="button">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('insertOrderedList')} type="button">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<h1>')} type="button">
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<h2>')} type="button">
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<h3>')} type="button">
                <Heading3 className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyLeft')} type="button">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyCenter')} type="button">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyRight')} type="button">
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyFull')} type="button">
                <AlignJustify className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<blockquote>')} type="button">
                <Quote className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<pre>')} type="button">
                <Code className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" type="button">
                <Table className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" type="button">
                <Image className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" type="button">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" type="button">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" type="button">
                <AtSign className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Right side stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Pages: {pages.length}</span>
              <span>Words: {pages.reduce((acc, page) => acc + page.content.split(/\s+/).filter(word => word.length > 0).length, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
          {/* Page Navigation Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-white h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Pages ({pages.length})
              </h3>
              <div className="space-y-2">
                {pages.map((page) => (
                  <div key={page.id} className="flex items-center space-x-2">
                    {editingPageId === page.id ? (
                      <Input
                        value={editingPageTitle}
                        onChange={(e) => setEditingPageTitle(e.target.value)}
                        onBlur={() => {
                          if (editingPageTitle.trim()) {
                            updatePageTitle(page.id, editingPageTitle.trim());
                          } else {
                            setEditingPageTitle(page.title); // Reset if empty
                          }
                          setEditingPageId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (editingPageTitle.trim()) {
                              updatePageTitle(page.id, editingPageTitle.trim());
                            }
                            setEditingPageId(null);
                          }
                        }}
                        autoFocus
                        className="flex-1 h-8 text-sm"
                      />
                    ) : (
                      <Button
                        variant={currentPageId === page.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left flex-1 h-8 text-sm"
                        onClick={() => setCurrentPageId(page.id)}
                        type="button"
                      >
                        {page.title}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingPageId(page.id);
                        setEditingPageTitle(page.title);
                      }}
                      type="button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deletePage(page.id)}
                      disabled={pages.length <= 1}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={addPage}
                type="button"
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Add Page
              </Button>
            </div>
          </div>

          {/* Main Editor Area - Google Docs Style */}
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <div className="max-w-5xl mx-auto py-8">
              {/* Document Paper */}
              <div className="bg-white shadow-lg rounded-lg mx-4 min-h-screen">
                {/* Document Header */}
                <div className="px-16 py-8 border-b border-gray-200">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {title}
                  </h1>
                  <div className="flex items-center flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Last modified: {lastSaved?.toLocaleString() || 'Never'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Created by: {sop?.author ? `${sop.author.firstName} ${sop.author.lastName}` : `${currentUser.firstName} ${currentUser.lastName}`}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4" />
                      <span>Version: {sop?.version || '1.0'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>Department: {department || 'Unassigned'}</span>
                    </div>
                    {template && (
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Template: {template.title}</span>
                      </div>
                    )}
                    <Badge variant="outline" className={`
                      ${sop?.status === 'published' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${sop?.status === 'draft' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                      ${sop?.status === 'review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}
                    `}>
                      {sop?.status || 'Draft'}
                    </Badge>
                  </div>
                </div>

                {/* Page Content */}
                <div className="px-16 py-8 pb-32">
                  {pages.find(page => page.id === currentPageId) && (
                    <div 
                      ref={(el) => editorRefs.current[currentPageId] = el}
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      onInput={(e) => updatePageContent(currentPageId, e.currentTarget.innerHTML)}
                      className="w-full text-base leading-relaxed outline-none focus:outline-none min-h-screen prose prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-table:border-collapse prose-th:border prose-th:p-2 prose-td:border prose-td:p-2"
                      style={{ 
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        lineHeight: '1.8',
                        fontSize: '16px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'normal'
                      }}
                    />
                  )}
                  
                  {/* Upload File Display */}
                  {uploadFile && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Paperclip className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">{uploadFile.name}</p>
                            <p className="text-sm text-blue-700">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setUploadFile(null)} type="button">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Enhanced */}
          <div className="w-80 border-l border-gray-200 bg-white h-full overflow-y-auto">
            <div className="p-4 space-y-6">
              
              {/* Document Settings */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Document Settings</h3>
                  {loadingOrganization && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                
                {loadingOrganization ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Department</Label>
                      <Select value={department} onValueChange={setDepartment} disabled={loadingOrganization}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {organizationData?.departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                          {(!organizationData?.departments || organizationData.departments.length === 0) && (
                            <SelectItem value="no-departments" disabled>No departments available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Category</Label>
                      <Select value={categoryId} onValueChange={setCategoryId} disabled={loadingOrganization}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {organizationData?.categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <div className="flex items-center space-x-2">
                                {category.icon && <span className="text-sm">{category.icon}</span>}
                                <span>{category.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          {(!organizationData?.categories || organizationData.categories.length === 0) && (
                            <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Team</Label>
                      <Select value={teamId} onValueChange={setTeamId} disabled={loadingOrganization}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No team</SelectItem>
                          {organizationData?.teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              <div className="flex items-center space-x-2">
                                {team.icon && <span className="text-sm">{team.icon}</span>}
                                <span>{team.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                          {(!organizationData?.teams || organizationData.teams.length === 0) && (
                            <SelectItem value="no-teams" disabled>No teams available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Priority</Label>
                      <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high' | 'critical')}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-gray-50">
                          {sop?.status || 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Collaborators */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Collaborators</h3>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" type="button">
                        <Plus className="w-4 h-4 mr-1" />
                        <span className="text-sm text-blue-600">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Collaborators</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {organizationData?.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-500 text-white text-xs">
                                  {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-gray-500">{user.department} • {user.position}</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Add collaborator logic here
                                toast.success(`${user.first_name} ${user.last_name} added as collaborator`);
                              }}
                              type="button"
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                        {(!organizationData?.users || organizationData.users.length === 0) && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No users available
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-3">
                  {collaborators.map((collaborator, index) => (
                    <div key={collaborator.id || index} className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`${collaborator.color} text-white text-xs`}>
                          {collaborator.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{collaborator.name}</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${collaborator.active ? 'bg-green-400' : 'bg-gray-300'}`} />
                          <p className="text-xs text-gray-500">
                            {collaborator.active ? 'Currently editing' : 'Offline'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {collaborators.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No collaborators yet. Add team members to collaborate on this document.
                    </p>
                  )}
                </div>
              </div>

              {/* Version History */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Version History</h3>
                </div>
                
                <div className="space-y-3">
                  {versionHistory.slice(0, 5).map((version, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 hover:bg-white rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Version {version.version}</p>
                        <p className="text-xs text-gray-600">{version.author} • {version.date}</p>
                        <p className="text-xs text-gray-500 mt-1">{version.changes}</p>
                      </div>
                    </div>
                  ))}
                  
                  {versionHistory.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No version history available.
                    </p>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Comments</h3>
                  {comments.filter(c => !c.resolved).length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {comments.filter(c => !c.resolved).length}
                    </Badge>
                  )}
                </div>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Add a comment..." 
                      className="flex-1 text-sm"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addComment();
                        }
                      }}
                      type="text"
                    />
                    <Button size="sm" onClick={addComment} disabled={!newComment.trim()} type="button">
                      Post
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {comments.filter(c => !c.resolved).map((comment) => (
                    <div key={comment.id} className="border-l-2 border-blue-200 pl-3 py-2 bg-white rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      <Button variant="ghost" size="sm" className="mt-2 text-xs h-6 px-2" type="button">
                        Resolve
                      </Button>
                    </div>
                  ))}
                  
                  {comments.filter(c => !c.resolved).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No comments yet. Add the first comment above.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" type="button">
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" type="button">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Mode
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" type="button">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" type="button">
                    <Share className="w-4 h-4 mr-2" />
                    Share Document
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
    </div>
  );
}