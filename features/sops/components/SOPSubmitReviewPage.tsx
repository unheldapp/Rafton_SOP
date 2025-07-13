import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Badge } from "../../../shared/components/ui/badge";
import { Separator } from "../../../shared/components/ui/separator";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
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
  Home
} from 'lucide-react';
import { SOP } from '../App';

interface SOPSubmitReviewPageProps {
  sop: SOP;
  changes: {
    title: string;
    content: string;
    department: string;
  };
  users: Array<{ id: string; name: string; role: string; avatar?: string }>;
  onNavigate: (page: any) => void;
  onSubmitForReview: (sopId: string, changes: any, reviewers: string[], summary: string) => void;
}

export function SOPSubmitReviewPage({ 
  sop, 
  changes, 
  users, 
  onNavigate, 
  onSubmitForReview 
}: SOPSubmitReviewPageProps) {
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [reviewSummary, setReviewSummary] = useState('');

  // Calculate changes
  const hasChanges = sop.title !== changes.title || 
                    sop.content !== changes.content || 
                    sop.department !== changes.department;

  const newVersion = `${parseFloat(sop.version) + 0.1}`;

  const handleReviewerToggle = (userId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmitForReview = () => {
    if (selectedReviewers.length === 0) {
      toast.error("Please select at least one reviewer");
      return;
    }

    // Show success notification
    toast.success("Review request created!", {
      description: "Your changes have been submitted for review. Selected reviewers will be notified.",
      duration: 5000,
    });

    // Submit for review with all the data
    onSubmitForReview(sop.id, changes, selectedReviewers, reviewSummary);

    // Navigate back to SOPs page
    setTimeout(() => {
      onNavigate('sops');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => onNavigate('editor')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Submit for Review</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleSubmitForReview}
                disabled={selectedReviewers.length === 0}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send for Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Changes Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Review Summary</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Summary of Changes (Optional)</Label>
                  <Textarea
                    placeholder="Describe what you changed and why reviewers should approve this..."
                    value={reviewSummary}
                    onChange={(e) => setReviewSummary(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Version Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Version Changes</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="outline" className="bg-gray-100">
                      Current: v{sop.version}
                    </Badge>
                    <span className="text-gray-400">→</span>
                    <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                      New: v{newVersion}
                    </Badge>
                  </div>
                </div>

                {/* Changes Preview */}
                {hasChanges && (
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Changes Made
                    </h3>
                    
                    {sop.title !== changes.title && (
                      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="text-sm font-medium text-blue-900 mb-1">Title Changed</div>
                        <div className="text-sm text-red-600 line-through">- {sop.title}</div>
                        <div className="text-sm text-green-600">+ {changes.title}</div>
                      </div>
                    )}

                    {sop.department !== changes.department && (
                      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="text-sm font-medium text-blue-900 mb-1">Department Changed</div>
                        <div className="text-sm text-red-600 line-through">- {sop.department}</div>
                        <div className="text-sm text-green-600">+ {changes.department}</div>
                      </div>
                    )}

                    {sop.content !== changes.content && (
                      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <div className="text-sm font-medium text-blue-900 mb-1">Content Modified</div>
                        <div className="text-sm text-gray-600">
                          Content has been updated ({Math.abs(changes.content.length - sop.content.length)} character difference)
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!hasChanges && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm text-amber-800">No changes detected from the original version</span>
                  </div>
                )}
              </div>
            </div>

            {/* SOP Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                SOP Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Title</Label>
                  <Input value={changes.title} readOnly className="mt-1 bg-gray-50" />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <Input value={changes.department} readOnly className="mt-1 bg-gray-50" />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Author</Label>
                  <Input value={sop.author} readOnly className="mt-1 bg-gray-50" />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Current Status</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-gray-50">
                      {sop.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              
              {/* Select Reviewers */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Select Reviewers</h3>
                  <Badge variant="secondary" className="text-xs">
                    {selectedReviewers.length} selected
                  </Badge>
                </div>
                
                {selectedReviewers.length === 0 && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please select at least one reviewer</span>
                    </div>
                  </div>
                )}

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

              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  What happens next?
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full border-2 border-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reviewers notified</p>
                      <p className="text-xs text-gray-500">Selected reviewers will receive notifications</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Review & feedback</p>
                      <p className="text-xs text-gray-500">Reviewers examine changes and provide feedback</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Approval & merge</p>
                      <p className="text-xs text-gray-500">Once approved, changes go live</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Version</span>
                    <span className="font-medium">v{sop.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Version</span>
                    <span className="font-medium text-purple-600">v{newVersion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-medium">{sop.lastUpdated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Department</span>
                    <Badge variant="outline">{changes.department}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}