import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Avatar, Avatar as AvatarComponent } from "../../../shared/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../shared/components/ui/tabs";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { Separator } from "../../../shared/components/ui/separator";
import {
  GitPullRequest,
  User,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  GitBranch,
  FileText,
  Plus,
  Minus,
  Edit3,
  Send,
  Users,
  ChevronRight,
  History,
  Star,
  Flag
} from 'lucide-react';
import { SOP } from '../App';

interface SOPReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOP | null;
  currentUser: { name: string; role: string; avatar?: string };
  users: Array<{ id: string; name: string; role: string; avatar?: string }>;
  onSubmitReview?: (reviewData: any) => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  content: string;
  lineNumber?: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'general' | 'inline';
  lineNumber?: number;
}

export function SOPReviewModal({ 
  isOpen, 
  onClose, 
  sop, 
  currentUser, 
  users, 
  onSubmitReview 
}: SOPReviewModalProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | 'request-changes' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [activeTab, setActiveTab] = useState('diff');
  const [newComment, setNewComment] = useState('');

  // Mock diff data - in real app this would come from version control
  const mockDiff: DiffLine[] = [
    { type: 'unchanged', content: '# Chemical Handling Procedures', lineNumber: 1 },
    { type: 'unchanged', content: '## Overview', lineNumber: 2 },
    { type: 'removed', content: 'This document outlines basic safety procedures for chemical handling.', lineNumber: 3 },
    { type: 'added', content: 'This document outlines comprehensive safety procedures for chemical handling and storage.', lineNumber: 3 },
    { type: 'unchanged', content: '', lineNumber: 4 },
    { type: 'unchanged', content: '## Safety Requirements', lineNumber: 5 },
    { type: 'added', content: '### Personal Protective Equipment (PPE)', lineNumber: 6 },
    { type: 'added', content: '- Safety goggles must be worn at all times', lineNumber: 7 },
    { type: 'added', content: '- Chemical-resistant gloves are mandatory', lineNumber: 8 },
    { type: 'unchanged', content: '- Proper ventilation must be ensured', lineNumber: 9 },
    { type: 'modified', content: '- Emergency shower and eyewash stations must be accessible within 30 seconds', lineNumber: 10 },
    { type: 'unchanged', content: '', lineNumber: 11 },
    { type: 'unchanged', content: '## Emergency Procedures', lineNumber: 12 }
  ];

  // Mock comments
  const mockComments: Comment[] = [
    {
      id: '1',
      author: 'Sarah Johnson',
      content: 'Great additions to the PPE section! This addresses the safety concerns raised in the last audit.',
      timestamp: '2025-07-09T10:30:00Z',
      type: 'general'
    },
    {
      id: '2', 
      author: 'Mike Chen',
      content: 'Should we specify the type of chemical-resistant gloves? Different chemicals require different materials.',
      timestamp: '2025-07-09T11:15:00Z',
      type: 'inline',
      lineNumber: 8
    }
  ];

  const handleReviewerToggle = (userId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmitReview = () => {
    if (!reviewDecision) return;
    
    const reviewData = {
      decision: reviewDecision,
      comment: reviewComment,
      reviewers: selectedReviewers,
      timestamp: new Date().toISOString()
    };
    
    onSubmitReview?.(reviewData);
    onClose();
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approve': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'reject': return 'text-red-600 bg-red-50 border-red-200';
      case 'request-changes': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approve': return <CheckCircle className="w-4 h-4" />;
      case 'reject': return <XCircle className="w-4 h-4" />;
      case 'request-changes': return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (!sop) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl flex items-center justify-center">
                  <GitPullRequest className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Review SOP Changes
                  </DialogTitle>
                  <h2 className="text-lg font-medium text-gray-800 mb-3">{sop.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>by {sop.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      <span>v{sop.version} → v{parseFloat(sop.version) + 0.1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{sop.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b px-6">
                  <TabsList className="bg-transparent h-12 p-0">
                    <TabsTrigger 
                      value="diff" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-4 py-3"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Changes (12)
                    </TabsTrigger>
                    <TabsTrigger 
                      value="comments" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-4 py-3"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Comments ({mockComments.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="history" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-4 py-3"
                    >
                      <History className="w-4 h-4 mr-2" />
                      History
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="diff" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        <div className="bg-white border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">
                            Chemical Handling Procedures.md
                          </div>
                          <div className="font-mono text-sm">
                            {mockDiff.map((line, index) => (
                              <div
                                key={index}
                                className={`flex items-start px-4 py-1 ${
                                  line.type === 'added' ? 'bg-emerald-50 border-l-4 border-emerald-500' :
                                  line.type === 'removed' ? 'bg-red-50 border-l-4 border-red-500' :
                                  line.type === 'modified' ? 'bg-amber-50 border-l-4 border-amber-500' :
                                  'hover:bg-gray-50'
                                }`}
                              >
                                <span className="w-12 text-gray-400 text-right pr-4 select-none">
                                  {line.lineNumber}
                                </span>
                                <span className="w-6 text-center">
                                  {line.type === 'added' && <Plus className="w-4 h-4 text-emerald-600" />}
                                  {line.type === 'removed' && <Minus className="w-4 h-4 text-red-600" />}
                                  {line.type === 'modified' && <Edit3 className="w-4 h-4 text-amber-600" />}
                                </span>
                                <span className="flex-1 whitespace-pre-wrap">{line.content}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="comments" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6 space-y-4">
                        {mockComments.map((comment) => (
                          <div key={comment.id} className="bg-white border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {comment.author.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{comment.author}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              {comment.type === 'inline' && (
                                <Badge variant="outline" className="text-xs">
                                  Line {comment.lineNumber}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="mb-3"
                          />
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <Send className="w-3 h-3 mr-1" />
                            Comment
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="history" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <Plus className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Created working copy</p>
                              <p className="text-sm text-gray-500">Sarah Johnson • 2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Edit3 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Updated PPE requirements</p>
                              <p className="text-sm text-gray-500">Sarah Johnson • 1 hour ago</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                              <Send className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Submitted for review</p>
                              <p className="text-sm text-gray-500">Sarah Johnson • 30 minutes ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l bg-gray-50/50 flex flex-col">
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Assign Reviewers */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assign Reviewers
                    </h3>
                    <div className="space-y-2">
                      {users.filter(u => u.name !== sop.author).map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedReviewers.includes(user.id)
                              ? 'border-purple-200 bg-purple-50'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => handleReviewerToggle(user.id)}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                          {selectedReviewers.includes(user.id) && (
                            <CheckCircle className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Review Decision */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Your Review</h3>
                    <div className="space-y-3">
                      {(['approve', 'request-changes', 'reject'] as const).map((decision) => (
                        <div
                          key={decision}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            reviewDecision === decision
                              ? getDecisionColor(decision)
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => setReviewDecision(decision)}
                        >
                          {getDecisionIcon(decision)}
                          <span className="font-medium capitalize">
                            {decision.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Textarea
                      placeholder="Add your review comments..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="mt-3"
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* SOP Metadata */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Department</span>
                        <Badge variant="outline">{sop.department}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Version</span>
                        <span className="font-medium">v{sop.version}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                          {sop.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">{sop.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="p-6 border-t bg-white">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={!reviewDecision || selectedReviewers.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                  >
                    Submit Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}