import React, { useState } from 'react';
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
  Flag,
  ArrowLeft,
  Home
} from 'lucide-react';
import { SOP } from '../App';

interface SOPReviewPageProps {
  sop: SOP | null;
  currentUser: { name: string; role: string };
  users: Array<{ id: string; name: string; role: string; avatar?: string }>;
  onNavigate: (page: any) => void;
  onSubmitReview?: (reviewData: any) => void;
  isNewlyCreated?: boolean;
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

export function SOPReviewPage({ 
  sop, 
  currentUser, 
  users, 
  onNavigate, 
  onSubmitReview,
  isNewlyCreated = false 
}: SOPReviewPageProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | 'request-changes' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [activeTab, setActiveTab] = useState('diff');
  const [newComment, setNewComment] = useState('');

  // Check if current user is the author (who submitted for review)
  const isAuthor = currentUser.name === sop?.author;
  const isReviewer = !isAuthor; // Everyone else can be a reviewer

  // Mock diff data - in real app this would come from version control
  const mockDiff: DiffLine[] = [
    { type: 'unchanged', content: '# Equipment Maintenance Protocol', lineNumber: 1 },
    { type: 'unchanged', content: '## 1. Purpose and Scope', lineNumber: 2 },
    { type: 'removed', content: 'This SOP defines the procedures for routine maintenance, inspection, and repair of manufacturing equipment.', lineNumber: 3 },
    { type: 'added', content: 'This SOP defines comprehensive procedures for routine maintenance, inspection, repair, and safety protocols for all manufacturing equipment.', lineNumber: 3 },
    { type: 'unchanged', content: '', lineNumber: 4 },
    { type: 'unchanged', content: '## 2. Pre-maintenance Safety Check', lineNumber: 5 },
    { type: 'added', content: '### Required PPE for Maintenance:', lineNumber: 6 },
    { type: 'added', content: '- Safety glasses with side shields', lineNumber: 7 },
    { type: 'added', content: '- Steel-toed safety boots', lineNumber: 8 },
    { type: 'added', content: '- Cut-resistant gloves (Level 3 minimum)', lineNumber: 9 },
    { type: 'added', content: '- Hard hat when working overhead', lineNumber: 10 },
    { type: 'unchanged', content: '', lineNumber: 11 },
    { type: 'unchanged', content: '1. Power down equipment completely', lineNumber: 12 },
    { type: 'unchanged', content: '2. Implement Lock Out/Tag Out (LOTO) procedures', lineNumber: 13 },
    { type: 'unchanged', content: '3. Verify zero energy state', lineNumber: 14 },
    { type: 'modified', content: '4. Ensure proper PPE is worn and documented', lineNumber: 15 },
    { type: 'added', content: '5. Obtain maintenance work permit from supervisor', lineNumber: 16 },
    { type: 'unchanged', content: '', lineNumber: 17 },
    { type: 'unchanged', content: '## 3. Inspection Checklist', lineNumber: 18 },
    { type: 'unchanged', content: '### Daily Inspections:', lineNumber: 19 },
    { type: 'unchanged', content: '- Visual inspection of wear components', lineNumber: 20 },
    { type: 'unchanged', content: '- Check for unusual noises or vibrations', lineNumber: 21 },
    { type: 'unchanged', content: '- Verify proper operation of safety systems', lineNumber: 22 },
    { type: 'added', content: '- Document all findings in maintenance log', lineNumber: 23 },
    { type: 'added', content: '- Report any abnormalities immediately', lineNumber: 24 },
    { type: 'unchanged', content: '', lineNumber: 25 },
    { type: 'unchanged', content: '## 4. Documentation', lineNumber: 26 },
    { type: 'unchanged', content: '- Complete maintenance logs for each task', lineNumber: 27 },
    { type: 'unchanged', content: '- Record all findings and actions taken', lineNumber: 28 },
    { type: 'modified', content: '- Schedule next maintenance cycle and set calendar reminders', lineNumber: 29 },
    { type: 'added', content: '- Submit completed forms to maintenance supervisor within 24 hours', lineNumber: 30 }
  ];

  // Mock comments
  const mockComments: Comment[] = [
    {
      id: '1',
      author: 'Mike Chen',
      content: 'Great improvements to the PPE section! This addresses the safety concerns from our last audit. The specific requirements for cut-resistant gloves will help prevent workplace injuries.',
      timestamp: '2025-07-09T10:30:00Z',
      type: 'general'
    },
    {
      id: '2', 
      author: 'Emily Davis',
      content: 'Should we specify the minimum cut resistance level? ANSI A3 might not be sufficient for all equipment types. Consider requiring A4 or A5 for high-risk machinery.',
      timestamp: '2025-07-09T11:15:00Z',
      type: 'inline',
      lineNumber: 9
    },
    {
      id: '3',
      author: 'James Wilson',
      content: 'The work permit requirement is excellent - this will help track who performed maintenance and when. Will improve our compliance significantly.',
      timestamp: '2025-07-09T12:45:00Z',
      type: 'inline',
      lineNumber: 16
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
    onNavigate('sops');
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

  if (!sop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No SOP Selected</h2>
          <p className="text-gray-600 mb-4">Please select an SOP to review.</p>
          <Button onClick={() => onNavigate('sops')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SOPs
          </Button>
        </div>
      </div>
    );
  }

  // If author just submitted for review, show confirmation and redirect to SOPs
  if (isAuthor && isNewlyCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-sm border p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Review Request Created!</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your changes to "<strong>{sop.title}</strong>" have been submitted for review. 
            Team members will be notified and can now review your updates.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <GitBranch className="w-4 h-4" />
              <span>Version {parseFloat(sop.version) - 0.1} → {sop.version}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>Author: {sop.author}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Submitted: Just now</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => onNavigate('sops')} 
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to SOPs
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onNavigate('dashboard')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If author tries to access review page (not newly created), redirect them
  if (isAuthor && !isNewlyCreated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-sm border p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Review In Progress</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your SOP "<strong>{sop.title}</strong>" is currently under review. 
            You'll be notified when reviewers provide feedback.
          </p>
          
          <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left border border-amber-200">
            <div className="flex items-center gap-3 text-sm text-amber-800 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Status: Pending Review</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-amber-700">
              <GitBranch className="w-4 h-4" />
              <span>Version {sop.version} awaiting approval</span>
            </div>
          </div>

          <Button 
            onClick={() => onNavigate('sops')} 
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to SOPs
          </Button>
        </div>
      </div>
    );
  }

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
                  <h1 className="text-xl font-semibold text-gray-900">Review SOP Changes</h1>
                  <p className="text-sm text-gray-600">
                    {sop.department} • Version {sop.version} • by {sop.author}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                Pending Review
              </Badge>
              
              {isReviewer && (
                <Button 
                  onClick={handleSubmitReview}
                  disabled={!reviewDecision || selectedReviewers.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                >
                  Submit Review
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* SOP Title Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          {isNewlyCreated && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Review request created successfully!</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">
                Your changes have been submitted for review. Team members can now review and approve your updates.
              </p>
            </div>
          )}
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{sop.title}</h2>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>v{parseFloat(sop.version) - 0.1} → v{sop.version}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {sop.lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Author: {sop.author}</span>
            </div>
            {isNewlyCreated && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-emerald-600 font-medium">Just submitted</span>
              </div>
            )}
          </div>
        </div>

        <div className={`grid grid-cols-1 ${isReviewer ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-6`}>
          {/* Main Content */}
          <div className={isReviewer ? "lg:col-span-3" : "lg:col-span-1"}>
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b px-6">
                  <TabsList className="bg-transparent h-12 p-0">
                    <TabsTrigger 
                      value="diff" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none px-4 py-3"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Changes ({mockDiff.filter(d => d.type !== 'unchanged').length})
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
                <TabsContent value="diff" className="p-0">
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg overflow-hidden border">
                      <div className="bg-gray-100 px-4 py-2 border-b text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {sop.title.replace(/\s+/g, '_')}.md
                        <Badge variant="secondary" className="ml-auto text-xs">
                          +{mockDiff.filter(d => d.type === 'added').length} 
                          -{mockDiff.filter(d => d.type === 'removed').length}
                        </Badge>
                      </div>
                      <div className="font-mono text-sm max-h-96 overflow-y-auto">
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
                            <span className="w-12 text-gray-400 text-right pr-4 select-none flex-shrink-0">
                              {line.lineNumber}
                            </span>
                            <span className="w-6 text-center flex-shrink-0">
                              {line.type === 'added' && <Plus className="w-4 h-4 text-emerald-600" />}
                              {line.type === 'removed' && <Minus className="w-4 h-4 text-red-600" />}
                              {line.type === 'modified' && <Edit3 className="w-4 h-4 text-amber-600" />}
                            </span>
                            <span className="flex-1 whitespace-pre-wrap break-words min-w-0">{line.content}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="p-0">
                  <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
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
                        <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3 bg-white"
                      />
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Send className="w-3 h-3 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="p-0">
                  <div className="p-6">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Plus className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Created working copy</p>
                          <p className="text-sm text-gray-500">{sop.author} • 3 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Edit3 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Updated PPE requirements and safety protocols</p>
                          <p className="text-sm text-gray-500">{sop.author} • 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <Send className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Submitted for review</p>
                          <p className="text-sm text-gray-500">{sop.author} • 1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar - Only for Reviewers */}
          {isReviewer && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.role}</p>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}