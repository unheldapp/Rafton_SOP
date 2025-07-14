import React, { useState, useEffect } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Badge } from "../../../shared/components/ui/badge";
import { Separator } from "../../../shared/components/ui/separator";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  ArrowLeft,
  Send,
  GitBranch,
  Calendar,
  User,
  Building2,
  Hash,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  MessageSquare,
  Home,
  Plus,
  Minus,
  GitPullRequest,
  GitCommit,
  Edit3,
  Check,
  X,
  ChevronRight,
  Activity,
  Search
} from 'lucide-react';
import { User as UserType } from '../../../shared/types';
import { useUsers } from '../../../shared/hooks/useUsers';
import { useAuth } from '../../../shared/context/AuthContext';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: string;
  lineNumber: number;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

interface SOPSubmitReviewPageProps {
  originalSOP: {
    id: string;
    title: string;
    content: string;
    department: string;
    version: string;
    author: string; // This should be author_id but keeping as author for now to see what's passed
    lastUpdated: string;
    status: string;
  };
  workingCopy: {
    id: string;
    title: string;
    content: string;
    department: string;
    changes: any;
  };
  users: UserType[];
  onNavigate: (page: any) => void;
  onSubmitForReview: (workingCopyId: string, reviewers: string[], summary: string, version: string) => void;
}

export function SOPSubmitReviewPage({ 
  originalSOP, 
  workingCopy, 
  users, 
  onNavigate, 
  onSubmitForReview 
}: SOPSubmitReviewPageProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [reviewSummary, setReviewSummary] = useState('');
  const [activeTab, setActiveTab] = useState('diff');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newVersion, setNewVersion] = useState('');
  
  // Fetch users from organization
  const { users: organizationUsers, loading: usersLoading } = useUsers();
  const { currentUser } = useAuth();
  
  // Filter users based on search query
  const filteredUsers = organizationUsers.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const role = user.role.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query) || role.includes(query);
  });
  
  // Get author name from the users list
  const getAuthorName = (authorId: string) => {
    const author = organizationUsers.find(user => user.id === authorId);
    
    if (author) {
      // Handle both firstName/lastName and first_name/last_name formats
      const firstName = author.firstName || author.first_name || '';
      const lastName = author.lastName || author.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Unknown Author';
    }
    
    return 'Unknown Author';
  };

  // Version validation
  const isVersionValid = () => {
    if (!newVersion.trim()) return false;
    if (newVersion.trim() === originalSOP.version) return false;
    return true;
  };

  const getVersionError = () => {
    if (!newVersion.trim()) return 'Version is required';
    if (newVersion.trim() === originalSOP.version) return `Version must be different from current version (${originalSOP.version})`;
    return '';
  };

  // Generate diff between original and working copy
  const generateDiff = (original: string, modified: string): DiffLine[] => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    const diff: DiffLine[] = [];
    
    // Simple diff algorithm - in production, use a proper diff library like diff2html
    let origIndex = 0;
    let modIndex = 0;
    
    while (origIndex < originalLines.length || modIndex < modifiedLines.length) {
      const origLine = originalLines[origIndex] || '';
      const modLine = modifiedLines[modIndex] || '';
      
      if (origLine === modLine) {
        diff.push({
          type: 'unchanged',
          content: origLine,
          lineNumber: origIndex + 1,
          originalLineNumber: origIndex + 1,
          modifiedLineNumber: modIndex + 1
        });
        origIndex++;
        modIndex++;
      } else {
        // Check if line was removed
        if (origIndex < originalLines.length && !modifiedLines.includes(origLine)) {
          diff.push({
            type: 'removed',
            content: origLine,
            lineNumber: origIndex + 1,
            originalLineNumber: origIndex + 1
          });
          origIndex++;
        }
        // Check if line was added
        else if (modIndex < modifiedLines.length && !originalLines.includes(modLine)) {
          diff.push({
            type: 'added',
            content: modLine,
            lineNumber: modIndex + 1,
            modifiedLineNumber: modIndex + 1
          });
          modIndex++;
        }
        // Line was modified
        else {
          diff.push({
            type: 'removed',
            content: origLine,
            lineNumber: origIndex + 1,
            originalLineNumber: origIndex + 1
          });
          diff.push({
            type: 'added',
            content: modLine,
            lineNumber: modIndex + 1,
            modifiedLineNumber: modIndex + 1
          });
          origIndex++;
          modIndex++;
        }
      }
    }
    
    return diff;
  };

  const diffData = generateDiff(originalSOP.content, workingCopy.content);
  const addedLines = diffData.filter(d => d.type === 'added').length;
  const removedLines = diffData.filter(d => d.type === 'removed').length;
  const changedLines = Math.max(addedLines, removedLines);

  // Check if there are any changes
  const hasChanges = originalSOP.title !== workingCopy.title || 
                    originalSOP.content !== workingCopy.content || 
                    originalSOP.department !== workingCopy.department;

  const handleReviewerToggle = (userId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      content: newComment,
      author: 'Current User', // In real app, use current user
      timestamp: new Date().toISOString(),
      type: 'general'
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleSubmitForReview = () => {
    if (selectedReviewers.length === 0) {
      toast.error("Please select at least one reviewer");
      return;
    }

    if (!reviewSummary.trim()) {
      toast.error("Please provide a summary of your changes");
      return;
    }

    if (!isVersionValid()) {
      toast.error(getVersionError());
      return;
    }

    // Show success notification
    toast.success("Review request created!", {
      description: "Your working copy has been submitted for review. Selected reviewers will be notified.",
      duration: 5000,
    });

    // Submit for review with all the data including version
    onSubmitForReview(workingCopy.id, selectedReviewers, reviewSummary, newVersion.trim());

    // Navigate back to SOPs page
    setTimeout(() => {
      onNavigate('sops');
    }, 1500);
  };

  const getDiffLineClass = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-400';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'unchanged':
        return 'bg-gray-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getDiffLineIcon = (type: DiffLine['type']) => {
    switch (type) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
                              <Button variant="ghost" onClick={() => onNavigate('sops')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to SOPs
                </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl flex items-center justify-center">
                  <GitPullRequest className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Submit for Review</h1>
                  <p className="text-sm text-gray-600">
                    {originalSOP.department} • {originalSOP.title}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <GitBranch className="w-3 h-3 mr-1" />
                Working Copy
              </Badge>
              
              <Button 
                onClick={handleSubmitForReview}
                disabled={selectedReviewers.length === 0 || !reviewSummary.trim() || !isVersionValid() || usersLoading}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Diff and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Changes Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+{addedLines}</div>
                    <div className="text-sm text-green-700">Added Lines</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">-{removedLines}</div>
                    <div className="text-sm text-red-700">Removed Lines</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{changedLines}</div>
                    <div className="text-sm text-blue-700">Total Changes</div>
                  </div>
                </div>
                
                {/* Change Details */}
                <div className="mt-4 space-y-2">
                  {originalSOP.title !== workingCopy.title && (
                    <div className="flex items-center gap-2 text-sm">
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span className="text-gray-600">Title changed from</span>
                      <span className="font-medium text-red-600">"{originalSOP.title}"</span>
                      <span className="text-gray-600">to</span>
                      <span className="font-medium text-green-600">"{workingCopy.title}"</span>
                    </div>
                  )}
                  {originalSOP.department !== workingCopy.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span className="text-gray-600">Department changed from</span>
                      <span className="font-medium text-red-600">"{originalSOP.department}"</span>
                      <span className="text-gray-600">to</span>
                      <span className="font-medium text-green-600">"{workingCopy.department}"</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Diff View */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diff">
                  <GitCommit className="w-4 h-4 mr-2" />
                  Diff View
                </TabsTrigger>
                <TabsTrigger value="original">
                  <FileText className="w-4 h-4 mr-2" />
                  Original
                </TabsTrigger>
                <TabsTrigger value="modified">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modified
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="diff" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>File Changes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="font-mono text-sm">
                        {diffData.map((line, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-2 px-4 py-1 ${getDiffLineClass(line.type)}`}
                          >
                            <div className="w-12 text-right text-gray-500 select-none">
                              {line.lineNumber}
                            </div>
                            <div className="w-6 flex justify-center">
                              {getDiffLineIcon(line.type)}
                            </div>
                            <div className="flex-1 whitespace-pre-wrap break-words">
                              {line.content || ' '}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="original" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Original Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">
                        {originalSOP.content}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="modified" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Modified Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="font-mono text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded">
                        {workingCopy.content}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Reviewers and Comments */}
          <div className="lg:col-span-1 space-y-6">
            {/* Version */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Version
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="version">New Version Number</Label>
                  <Input
                    id="version"
                    placeholder="e.g., 1.1, 2.0, 1.0.1"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    className={getVersionError() ? 'border-red-300 focus:border-red-500' : ''}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Current: {originalSOP.version}</span>
                    {getVersionError() && (
                      <span className="text-red-600">{getVersionError()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Review Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Review Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your changes and what reviewers should focus on..."
                  value={reviewSummary}
                  onChange={(e) => setReviewSummary(e.target.value)}
                  rows={4}
                  className="mb-4"
                />
              </CardContent>
            </Card>

            {/* Reviewer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Select Reviewers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Selected Reviewers Count */}
                {selectedReviewers.length > 0 && (
                  <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      {selectedReviewers.length} reviewer{selectedReviewers.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
                
                {/* Users List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {usersLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading users...</p>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-4">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'No users found matching your search' : 'No users available'}
                      </p>
                    </div>
                  ) : (
                    filteredUsers
                      .filter(user => user.id !== currentUser?.id) // Exclude current user
                      .map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedReviewers.includes(user.id)
                              ? 'border-purple-200 bg-purple-50'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => handleReviewerToggle(user.id)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                              {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                          </div>
                          {selectedReviewers.includes(user.id) && (
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs">
                            CU
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddComment}
                      variant="outline"
                      size="sm"
                      className="self-start"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Document Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{originalSOP.version}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Author:</span>
                  <span className="font-medium">{getAuthorName(originalSOP.author)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{originalSOP.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{originalSOP.department}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}