import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Separator } from "../../../shared/components/ui/separator";
import { 
  ArrowLeft,
  GitBranch,
  Eye,
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  FileText,
  Send,
  Edit3,
  AlertTriangle,
  Info,
  Sparkles
} from 'lucide-react';

interface WorkingCopy {
  id: string;
  originalSOPId: string;
  title: string;
  content: string;
  author: string;
  createdDate: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewer?: string;
  reviewComments?: string;
}

interface SOPVersionControlProps {
  workingCopy: WorkingCopy;
  originalSOP: any;
  onNavigate: (page: any) => void;
}

export function SOPVersionControl({ workingCopy, originalSOP, onNavigate }: SOPVersionControlProps) {
  const [reviewComment, setReviewComment] = useState('');
  const [showDiff, setShowDiff] = useState(true);

  // Mock function to generate diff - in real implementation, use a proper diff library
  const generateDiff = (original: string, modified: string) => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    const diff = [];
    
    // Simple diff logic for demonstration
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i] || '';
      const modLine = modifiedLines[i] || '';
      
      if (origLine !== modLine) {
        if (origLine && !modLine) {
          diff.push({ type: 'removed', content: origLine, lineNum: i + 1 });
        } else if (!origLine && modLine) {
          diff.push({ type: 'added', content: modLine, lineNum: i + 1 });
        } else {
          diff.push({ type: 'removed', content: origLine, lineNum: i + 1 });
          diff.push({ type: 'added', content: modLine, lineNum: i + 1 });
        }
      } else if (origLine) {
        diff.push({ type: 'unchanged', content: origLine, lineNum: i + 1 });
      }
    }
    
    return diff;
  };

  const diffData = generateDiff(originalSOP.content, workingCopy.content);
  const hasChanges = diffData.some(line => line.type !== 'unchanged');
  const addedLines = diffData.filter(d => d.type === 'added').length;
  const removedLines = diffData.filter(d => d.type === 'removed').length;

  const handleApprove = () => {
    console.log('Approving changes');
  };

  const handleReject = () => {
    console.log('Rejecting changes');
  };

  const getStatusColor = () => {
    switch (workingCopy.status) {
      case 'submitted':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getStatusIcon = () => {
    switch (workingCopy.status) {
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Edit3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      {/* Header */}
      <div className="bg-white border-b border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => onNavigate('sops')}
                className="hover:bg-purple-100 text-purple-600 hover:text-purple-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to SOPs
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{workingCopy.title}</h1>
                  <p className="text-sm text-gray-600">Review Request #{workingCopy.id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className={`${getStatusColor()} font-medium px-3 py-1.5 flex items-center space-x-1.5`}>
                {getStatusIcon()}
                <span>{workingCopy.status.charAt(0).toUpperCase() + workingCopy.status.slice(1)}</span>
              </Badge>
              
              {workingCopy.status === 'submitted' && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleReject}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    onClick={handleApprove} 
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Review Request Info */}
            <Card className="border-purple-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-gray-900">
                      <Edit3 className="w-5 h-5 text-purple-600" />
                      <span>Proposed Changes</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      {workingCopy.description || 'No description provided'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">{workingCopy.author}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{workingCopy.createdDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-sm text-gray-600">
                    Comparing changes between <strong className="text-gray-900">Published Version</strong> and <strong className="text-purple-600">Working Copy</strong>
                  </div>
                  <div className="flex items-center space-x-1 bg-purple-100 rounded-lg p-1">
                    <Button 
                      variant={showDiff ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setShowDiff(true)}
                      className={`${showDiff ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'} transition-all`}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      Show Changes
                    </Button>
                    <Button 
                      variant={!showDiff ? "default" : "ghost"} 
                      size="sm"
                      onClick={() => setShowDiff(false)}
                      className={`${!showDiff ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'} transition-all`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                {showDiff ? (
                  /* Diff View */
                  <div className="border border-purple-200 rounded-xl overflow-hidden bg-white">
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-purple-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-900">Changes Summary</span>
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
                            <Plus className="w-3 h-3" />
                            <span>{addedLines} additions</span>
                          </span>
                          <span className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium">
                            <Minus className="w-3 h-3" />
                            <span>{removedLines} deletions</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {hasChanges ? (
                        <div className="font-mono text-sm">
                          {diffData.map((line, index) => (
                            <div
                              key={index}
                              className={`px-6 py-2 ${
                                line.type === 'added' ? 'bg-emerald-50 border-l-4 border-emerald-400' :
                                line.type === 'removed' ? 'bg-red-50 border-l-4 border-red-400' :
                                'bg-white hover:bg-purple-50'
                              } transition-colors`}
                            >
                              <div className="flex">
                                <span className="w-12 text-gray-400 text-xs mr-4 select-none font-medium">
                                  {line.lineNum}
                                </span>
                                <span className="flex-1 text-gray-700">
                                  {line.type === 'added' && <span className="text-emerald-600 mr-2 font-bold">+</span>}
                                  {line.type === 'removed' && <span className="text-red-600 mr-2 font-bold">-</span>}
                                  {line.content}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center text-gray-500">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-purple-400" />
                          </div>
                          <p className="font-medium">No changes detected</p>
                          <p className="text-sm text-gray-400 mt-1">The working copy is identical to the published version</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Preview View */
                  <div className="border border-purple-200 rounded-xl p-8 bg-white max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                        {workingCopy.content}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="border-purple-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span>Review Comments</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {workingCopy.reviewComments && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                          {workingCopy.reviewer?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">{workingCopy.reviewer}</span>
                        <span className="text-xs text-gray-500 ml-2">reviewed</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{workingCopy.reviewComments}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add your review comments..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="min-h-24 border-purple-200 focus:border-violet-500 focus:ring-violet-500/20"
                  />
                  <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Status Card */}
            <Card className="border-purple-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <CardTitle className="text-base text-gray-900">Review Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={`${getStatusColor()} font-medium`}>
                      {workingCopy.status.charAt(0).toUpperCase() + workingCopy.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Author:</span>
                    <span className="font-medium text-gray-900">{workingCopy.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-gray-700">{workingCopy.createdDate}</span>
                  </div>
                  
                  {workingCopy.reviewer && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Reviewer:</span>
                      <span className="font-medium text-gray-900">{workingCopy.reviewer}</span>
                    </div>
                  )}
                </div>

                {hasChanges && (
                  <div className="pt-4 border-t border-purple-200">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Changes:</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-600">Lines added:</span>
                        <span className="font-medium text-emerald-700">{addedLines}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-600">Lines removed:</span>
                        <span className="font-medium text-red-700">{removedLines}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Version Info */}
            <Card className="border-purple-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <CardTitle className="text-base text-gray-900">Version Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Working Copy</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">Your proposed changes</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Published Version</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">Current official SOP (v{originalSOP.version})</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-purple-200 shadow-sm bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <CardTitle className="text-base text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <Button variant="outline" size="sm" className="w-full justify-start border-purple-200 hover:bg-purple-50 text-gray-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Original SOP
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-purple-200 hover:bg-purple-50 text-gray-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Comparison
                </Button>
                {workingCopy.status === 'draft' && (
                  <Button variant="outline" size="sm" className="w-full justify-start border-violet-200 text-violet-700 hover:bg-violet-50">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Continue Editing
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}