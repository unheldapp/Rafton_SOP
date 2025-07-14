import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Badge } from "../../../shared/components/ui/badge";
import { Separator } from "../../../shared/components/ui/separator";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { WorkingCopyService } from "../../../shared/services/workingCopyService";
import { useWorkingCopies } from "../../../shared/hooks/useWorkingCopies";
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
  onWorkingCopySubmitForReview?: (originalSOP: any, workingCopy: any) => void;
  currentUser: UserType;
  currentFolderId?: string | null;
}

interface Page {
  id: string;
  title: string;
  content: string;
}

export function SOPEditor({ sop, template, onNavigate, onSubmitForReview, onWorkingCopySubmitForReview, currentUser, currentFolderId }: SOPEditorProps) {
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

  // Working copy state management
  const [existingWorkingCopy, setExistingWorkingCopy] = useState<any>(null);
  const [isWorkingCopyMode, setIsWorkingCopyMode] = useState(false);
  const [isWorkingCopyLoading, setIsWorkingCopyLoading] = useState(false);
  const workingCopyHook = useWorkingCopies();

  // Hooks
  const { 
    createSOP, 
    updateSOP, 
    loading,
    publishSOP
  } = useSOPs();
  const { users } = useUsers();
  const editorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Get author name from the users list
  const getAuthorName = (authorId: string) => {
    const author = users.find(user => user.id === authorId);
    
    if (author) {
      const firstName = author.firstName || '';
      const lastName = author.lastName || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Author';
    }
    
    return 'Unknown Author';
  };
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount if it's a new SOP
  useEffect(() => {
    if (!sop?.id && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 100);
    }
  }, [sop?.id]);

  // Working copy detection for published SOPs
  useEffect(() => {
    const checkWorkingCopy = async () => {
      if (sop?.id && sop.status === 'published') {
        console.log('SOPEditor: Checking for working copy for SOP:', sop.id);
        try {
          const workingCopies = await workingCopyHook.fetchSOPWorkingCopies(sop.id);
          console.log('SOPEditor: Found working copies:', workingCopies);
          
          const userWorkingCopy = workingCopies.find(wc => wc.user_id === currentUser.id);
          console.log('SOPEditor: User working copy:', userWorkingCopy);
          
          if (userWorkingCopy) {
            console.log('SOPEditor: Setting existing working copy:', userWorkingCopy);
            setExistingWorkingCopy(userWorkingCopy);
            // Let user decide whether to continue with working copy via the banner
          } else {
            console.log('SOPEditor: No working copy found, clearing state');
            setExistingWorkingCopy(null);
          }
        } catch (error) {
          console.error('SOPEditor: Working copy error:', error);
          // If tables don't exist yet, gracefully handle
          if (error instanceof Error && (error.message?.includes('relation') || error.message?.includes('table'))) {
            console.log('SOPEditor: Working copy tables not yet created, skipping check');
            setExistingWorkingCopy(null);
          }
        }
      }
    };

    checkWorkingCopy();
  }, [sop?.id, sop?.status, currentUser.id]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('SOPEditor: existingWorkingCopy state changed:', existingWorkingCopy);
  }, [existingWorkingCopy]);

  useEffect(() => {
    console.log('SOPEditor: isWorkingCopyMode state changed:', isWorkingCopyMode);
  }, [isWorkingCopyMode]);



  // Load real data when SOP is provided (but not when in working copy mode)
  useEffect(() => {
    if (sop?.id) {
      setCurrentSOPId(sop.id);
      setHasBeenSavedOnce(true);
      
      // Only load original SOP data if not in working copy mode
      if (!isWorkingCopyMode) {
        console.log('useEffect: Loading original SOP data (not in working copy mode)');
        loadSOPData(sop.id);
      } else {
        console.log('useEffect: Skipping SOP data load (in working copy mode)');
      }
    }
  }, [sop?.id, isWorkingCopyMode]);

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

  // Set editor content when page changes OR when pages content changes
  useEffect(() => {
    const editor = editorRefs.current[currentPageId];
    if (editor) {
      const currentPage = pages.find(page => page.id === currentPageId);
      const newContent = currentPage?.content || '';
      // Only update if content actually changed to avoid cursor issues
      if (editor.innerHTML !== newContent) {
        editor.innerHTML = newContent;
        console.log('Editor content synced for page:', currentPageId);
      }
    }
  }, [currentPageId, pages]);

  const loadSOPData = async (sopId: string) => {
    // Don't load original SOP data if user is in working copy mode
    if (isWorkingCopyMode) {
      console.log('loadSOPData: Skipping because user is in working copy mode');
      return;
    }
    
    console.log('loadSOPData: Loading original SOP data for', sopId);
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

  // Working copy functions
  const createWorkingCopy = async () => {
    if (!sop?.id || isWorkingCopyLoading) return;
    
    try {
      setIsWorkingCopyLoading(true);
      
      const workingCopy = await workingCopyHook.createWorkingCopy({
        sopId: sop.id,
        title: sop.title,
        content: sop.content,
        description: sop.description || undefined
      });
      
      setExistingWorkingCopy(workingCopy);
      
      // Load working copy data into editor state
      loadWorkingCopyData(workingCopy);
      
      setIsWorkingCopyMode(true);
      toast.success('Working copy created successfully');
    } catch (error) {
      console.error('Error creating working copy:', error);
      toast.error('Failed to create working copy');
    } finally {
      setIsWorkingCopyLoading(false);
    }
  };

  const loadWorkingCopyData = (workingCopy: any) => {
    console.log('Loading working copy data:', workingCopy);
    
    // Load title
    setTitle(workingCopy.title || sop?.title || 'Untitled SOP');
    
    // Load additional fields from changes or fallback to original SOP
    // Working copy table doesn't have these fields, they're stored in changes
    const departmentFromChanges = workingCopy.changes?.department;
    const priorityFromChanges = workingCopy.changes?.priority;
    const categoryFromChanges = workingCopy.changes?.categoryId;
    const teamFromChanges = workingCopy.changes?.teamId;
    
    setDepartment(departmentFromChanges || sop?.department || '');
    setPriority(priorityFromChanges || sop?.priority || 'medium');
    setCategoryId(categoryFromChanges || sop?.category_id || 'none');
    setTeamId(teamFromChanges || 'none');
    
    // Load content and parse into pages
    const content = workingCopy.content || '';
    if (content) {
      // Check if content has page breaks (multi-page format)
      if (content.includes('\n\n--- Page Break ---\n\n')) {
        const pageContents = content.split('\n\n--- Page Break ---\n\n');
        const loadedPages = pageContents.map((pageContent: string, index: number) => {
          const titleMatch = pageContent.match(/^### (.*)\n\n/);
          const actualContent = titleMatch ? pageContent.replace(/^### .*\n\n/, '') : pageContent;
          return {
            id: `page-${index + 1}`,
            title: titleMatch ? titleMatch[1] : `Page ${index + 1}`,
            content: actualContent
          };
        });
        setPages(loadedPages);
        setCurrentPageId(loadedPages[0].id);
      } else {
        // Single page content - check if it has a header
        const titleMatch = content.match(/^### (.*)\n\n/);
        const pageContent = titleMatch ? content.replace(/^### .*\n\n/, '') : content;
        const pageTitle = titleMatch ? titleMatch[1] : 'Page 1';
        
        setPages([{
          id: 'page-1',
          title: pageTitle,
          content: pageContent
        }]);
        setCurrentPageId('page-1');
      }
    } else {
      // Empty content - create default page
      setPages([{
        id: 'page-1',
        title: 'Page 1',
        content: ''
      }]);
      setCurrentPageId('page-1');
    }
    
    // Set last saved time from working copy
    if (workingCopy.updated_at) {
      setLastSaved(new Date(workingCopy.updated_at));
    }
    
        // Reset dirty state AFTER all state updates to prevent race conditions
    // Use setTimeout to ensure this happens after other state updates
    setTimeout(() => {
      setIsDirty(false);
    }, 0);
  };

  const goToWorkingCopy = async () => {
    if (!existingWorkingCopy || isWorkingCopyLoading) return;
    
    try {
      setIsWorkingCopyLoading(true);
      
      // Fetch fresh working copy data from database to get latest changes
      console.log('Fetching fresh working copy data:', existingWorkingCopy.id);
      const freshWorkingCopy = await workingCopyHook.fetchWorkingCopyById(existingWorkingCopy.id);
      
      if (freshWorkingCopy) {
        // Update cached state with fresh data
        setExistingWorkingCopy(freshWorkingCopy);
        
        // Load fresh working copy data into editor state
        loadWorkingCopyData(freshWorkingCopy);
        
        // Switch to working copy mode
        setIsWorkingCopyMode(true);
        toast.success('Opened existing working copy');
      } else {
        toast.error('Working copy not found');
      }
    } catch (error) {
      console.error('Error fetching working copy:', error);
      toast.error('Failed to load working copy');
    } finally {
      setIsWorkingCopyLoading(false);
    }
  };

  const exitWorkingCopyMode = () => {
    if (!sop) return;
    
    // Revert to original SOP data
    setTitle(sop.title || 'Untitled SOP');
    setDepartment(sop.department || '');
    setPriority(sop.priority || 'medium');
    setCategoryId(sop.category_id || 'none');
    
    let newPages: Page[] = [];
    let newCurrentPageId = 'page-1';
    
    // Load original SOP content
    if (sop.content) {
      // Check if content has page breaks (multi-page format)
      if (sop.content.includes('\n\n--- Page Break ---\n\n')) {
        const pageContents = sop.content.split('\n\n--- Page Break ---\n\n');
        newPages = pageContents.map((pageContent: string, index: number) => {
          const titleMatch = pageContent.match(/^### (.*)\n\n/);
          const actualContent = titleMatch ? pageContent.replace(/^### .*\n\n/, '') : pageContent;
          return {
            id: `page-${index + 1}`,
            title: titleMatch ? titleMatch[1] : `Page ${index + 1}`,
            content: actualContent
          };
        });
        newCurrentPageId = newPages[0].id;
      } else {
        // Single page content - check if it has a header
        const titleMatch = sop.content.match(/^### (.*)\n\n/);
        const pageContent = titleMatch ? sop.content.replace(/^### .*\n\n/, '') : sop.content;
        const pageTitle = titleMatch ? titleMatch[1] : 'Page 1';
        
        newPages = [{
          id: 'page-1',
          title: pageTitle,
          content: pageContent
        }];
        newCurrentPageId = 'page-1';
      }
    } else {
      // Empty content
      newPages = [{
        id: 'page-1',
        title: 'Page 1',
        content: ''
      }];
    }
    
    // Update state - the useEffect will automatically sync the editor content
    setPages(newPages);
    setCurrentPageId(newCurrentPageId);
    
    // Exit working copy mode
    setIsWorkingCopyMode(false);
    setIsDirty(false);
    toast.success('Exited working copy mode');
  };

  const saveWorkingCopy = async () => {
    if (!existingWorkingCopy?.id) return;
    
    try {
      // Convert HTML content to plain text and combine all pages
      const convertHTMLToText = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Use innerText for proper block element handling and whitespace preservation
        return tempDiv.innerText || tempDiv.textContent || '';
      };

      // Combine all pages into a single content string
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
      
      console.log('Saving working copy with content:', { title, fullContent, department });
      
      const updatedWorkingCopy = await workingCopyHook.updateWorkingCopy(existingWorkingCopy.id, {
        title,
        content: fullContent,
        changes: {
          // Store metadata about what changed
          title_changed: title !== sop?.title,
          content_changed: fullContent !== sop?.content,
          department_changed: department !== sop?.department,
          priority_changed: priority !== sop?.priority,
          category_changed: categoryId !== (sop?.category_id || 'none'),
          team_changed: teamId !== 'none', // teamId is always 'none' in original SOPs
          // Store actual values for fields not in the working copy table
          department: department,
          priority: priority,
          categoryId: categoryId,
          teamId: teamId,
          // Store original values for comparison
          original_title: sop?.title,
          original_content: sop?.content,
          original_department: sop?.department,
          original_priority: sop?.priority,
          original_category_id: sop?.category_id,
          original_team_id: 'none' // SOPs don't have teams originally
        }
      });
      
      // Update cached working copy state with fresh data from database
      setExistingWorkingCopy(updatedWorkingCopy);
      console.log('Updated cached working copy state');
      
      setIsDirty(false);
      setLastSaved(new Date());
      toast.success('Working copy saved successfully');
    } catch (error) {
      console.error('Error saving working copy:', error);
      toast.error('Failed to save working copy');
    }
  };



  const handleManualSave = async () => {
    
    if (!isDirty && !(!hasBeenSavedOnce && title.trim())) {
      toast.info('No changes to save');
      return;
    }
    
    setIsAutoSaving(true);
    try {
      if (isWorkingCopyMode) {
        await saveWorkingCopy();
        // Working copy save is handled in saveWorkingCopy function
        // Don't continue to save to original SOP
      } else {
        // Manual save logic for regular SOPs
        const convertHTMLToText = (html: string) => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          // Use innerText for proper block element handling and whitespace preservation
          return tempDiv.innerText || tempDiv.textContent || '';
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
        toast.success('Document saved successfully');
      }
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('Failed to save document');
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleWorkingCopySubmitForReview = async () => {
    if (!existingWorkingCopy?.id || !sop?.id) return;
    
    try {
      // First save the current changes
      await saveWorkingCopy();
      
      // Prepare data for the submit review page
      const originalSOP = {
        id: sop.id,
        title: sop.title,
        content: sop.content,
        department: sop.department,
        version: sop.version,
        author: sop.author_id || 'Unknown',
        lastUpdated: new Date(sop.updated_at).toLocaleDateString(),
        status: sop.status
      };
      
      // Convert HTML content to plain text for working copy
      const convertHTMLToText = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Use innerText for proper block element handling and whitespace preservation
        return tempDiv.innerText || tempDiv.textContent || '';
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
      
      const workingCopyData = {
        id: existingWorkingCopy.id,
        title: title,
        content: fullContent,
        department: department,
        changes: existingWorkingCopy.changes
      };
      
      // Navigate to the enhanced submit review page
      if (onWorkingCopySubmitForReview) {
        onWorkingCopySubmitForReview(originalSOP, workingCopyData);
      } else {
        toast.error('Working copy submit for review not implemented');
      }
      
    } catch (error) {
      console.error('Error preparing working copy for review:', error);
      toast.error('Failed to prepare working copy for review');
    }
  };

  const handleSubmitForReview = async () => {
    // Convert HTML content to plain text for database storage while preserving line breaks
    const convertHTMLToText = (html: string) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      // Use innerText for proper block element handling and whitespace preservation
      return tempDiv.innerText || tempDiv.textContent || '';
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
        // Use innerText for proper block element handling and whitespace preservation
        return tempDiv.innerText || tempDiv.textContent || '';
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
    return 'Not saved';
  };

  // Helper function to check if Submit for Review should be enabled
  const canSubmitForReview = () => {
    // Basic checks
    if (!sop) {
      return false;
    }
    
    if (isWorkingCopyLoading) {
      return false;
    }
    
    // If in working copy mode, always enable the button
    if (isWorkingCopyMode) {
      return true;
    }
    
    // For non-working copy mode, use regular logic
    return !isEditingDisabled();
  };

  // Helper function to check if editing should be disabled
  const isEditingDisabled = () => {
    // Disable editing for published SOPs that are not in working copy mode
    return sop?.status === 'published' && !isWorkingCopyMode;
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
      {/* Working Copy Banner for Published SOPs */}
      {sop?.status === 'published' && !isWorkingCopyMode && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center shadow-sm">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-900">
                  This is a published SOP
                </h3>
                <p className="text-sm text-purple-700">
                  {existingWorkingCopy 
                    ? `You have unsaved changes in a working copy (last updated: ${new Date(existingWorkingCopy.updated_at).toLocaleDateString()}).`
                    : 'To make changes, you need to create a working copy that can be reviewed and approved.'
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={existingWorkingCopy ? goToWorkingCopy : createWorkingCopy}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-md transition-all duration-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              {existingWorkingCopy ? 'Go to Working Copy' : 'Create Working Copy'}
            </Button>
          </div>
        </div>
      )}

      {/* Working Copy Mode Banner */}
      {isWorkingCopyMode && existingWorkingCopy && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                <FileText className="w-3 h-3 text-pink-600" />
              </div>
              <span className="text-sm font-medium text-pink-900">
                Working Copy Mode
              </span>
              <span className="text-sm text-pink-700">
                • You're editing a working copy of this published SOP
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-pink-600">
                Created: {new Date(existingWorkingCopy.created_at).toLocaleDateString()}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exitWorkingCopyMode}
                className="text-pink-700 border-pink-300 hover:bg-pink-100"
              >
                <X className="w-4 h-4 mr-2" />
                Exit Working Copy
              </Button>
            </div>
          </div>
        </div>
      )}

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
                  disabled={isEditingDisabled()}
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
                  disabled={isEditingDisabled() || (!isDirty && hasBeenSavedOnce)}
                  type="button"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isWorkingCopyMode ? 'Save Working Copy' : (hasBeenSavedOnce ? 'Save' : 'Save Document')}
                </Button>
                
                {currentUser.role === 'admin' && !isWorkingCopyMode && (
                  <Button variant="default" size="sm" onClick={handleDirectPublish} disabled={isEditingDisabled() || loading} type="button">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={isWorkingCopyMode ? handleWorkingCopySubmitForReview : handleSubmitForReview}
                  disabled={(() => {
                    // In working copy mode, ignore the global loading state
                    const shouldCheckGlobalLoading = !isWorkingCopyMode;
                    return (shouldCheckGlobalLoading && loading) || isWorkingCopyLoading || !canSubmitForReview();
                  })()} 
                  type="button"
                >
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
              {/* Formatting Tools */}
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('bold')} disabled={isEditingDisabled()} type="button">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('italic')} disabled={isEditingDisabled()} type="button">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('underline')} disabled={isEditingDisabled()} type="button">
                <Underline className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('strikeThrough')} disabled={isEditingDisabled()} type="button">
                <Strikethrough className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('insertUnorderedList')} disabled={isEditingDisabled()} type="button">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('insertOrderedList')} disabled={isEditingDisabled()} type="button">
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<h1>')} disabled={isEditingDisabled()} type="button">
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<h2>')} disabled={isEditingDisabled()} type="button">
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<h3>')} disabled={isEditingDisabled()} type="button">
                <Heading3 className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyLeft')} disabled={isEditingDisabled()} type="button">
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyCenter')} disabled={isEditingDisabled()} type="button">
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyRight')} disabled={isEditingDisabled()} type="button">
                <AlignRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('justifyFull')} disabled={isEditingDisabled()} type="button">
                <AlignJustify className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<blockquote>')} disabled={isEditingDisabled()} type="button">
                <Quote className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleFormat('formatBlock', '<pre>')} disabled={isEditingDisabled()} type="button">
                <Code className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled={isEditingDisabled()} type="button">
                <Table className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled={isEditingDisabled()} type="button">
                <Image className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled={isEditingDisabled()} type="button">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled={isEditingDisabled()} type="button">
                <MessageSquare className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" disabled={isEditingDisabled()} type="button">
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
                      <span>Created by: {sop?.author_id ? getAuthorName(sop.author_id) : `${currentUser.firstName} ${currentUser.lastName}`}</span>
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
                      contentEditable={!isEditingDisabled()}
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
                      <Select value={department} onValueChange={setDepartment} disabled={isEditingDisabled() || loadingOrganization}>
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
                      <Select value={categoryId} onValueChange={setCategoryId} disabled={isEditingDisabled() || loadingOrganization}>
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
                      <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high' | 'critical')} disabled={isEditingDisabled()}>
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