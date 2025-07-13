import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Switch } from "../../../shared/components/ui/switch";
import { Label } from "../../../shared/components/ui/label";
import { 
  CheckCircle,
  XCircle,
  ArrowLeft,
  Eye,
  MessageSquare,
  GitCompare
} from 'lucide-react';
import { SOP } from '../App';

interface ReviewApprovalProps {
  sop?: SOP | null;
  onNavigate: (page: any) => void;
}

export function ReviewApproval({ sop, onNavigate }: ReviewApprovalProps) {
  const [showChanges, setShowChanges] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  // Mock previous version for diff comparison
  const previousVersion = {
    content: `Standard procedure for handling chemicals in the laboratory environment.

1. Personal Protective Equipment
- Always wear safety goggles
- Use chemical-resistant gloves
- Wear lab coat at all times

2. Storage Requirements
- Store chemicals in designated areas
- Keep incompatible chemicals separated
- Maintain proper temperature controls

3. Disposal Procedures
- Follow local regulations for chemical disposal
- Use appropriate containers for waste
- Label all waste containers clearly`
  };

  const currentVersion = sop?.content || '';

  const handleApprove = () => {
    console.log('Approving SOP with comment:', reviewComment);
    onNavigate('dashboard');
  };

  const handleRequestChanges = () => {
    console.log('Requesting changes with comment:', reviewComment);
    onNavigate('dashboard');
  };

  const renderDiffView = () => {
    // Simple diff simulation - in a real app, you'd use a proper diff library
    const lines = currentVersion.split('\n');
    const prevLines = previousVersion.content.split('\n');
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm text-gray-600 mb-2">Previous Version (v{(sop?.version || 1) - 1})</h4>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
            <pre className="whitespace-pre-wrap text-red-800">{previousVersion.content}</pre>
          </div>
        </div>
        <div>
          <h4 className="text-sm text-gray-600 mb-2">Current Version (v{sop?.version || 1})</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <pre className="whitespace-pre-wrap text-green-800">{currentVersion}</pre>
          </div>
        </div>
      </div>
    );
  };

  if (!sop) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-900 mb-2">No SOP Selected for Review</h2>
          <p className="text-gray-600 mb-6">Please select an SOP from the dashboard to review.</p>
          <Button onClick={() => onNavigate('dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => onNavigate('dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl text-gray-900">Review SOP</h1>
            <p className="text-gray-600">Review and approve changes to this SOP</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-changes"
              checked={showChanges}
              onCheckedChange={setShowChanges}
            />
            <Label htmlFor="show-changes" className="text-sm">
              Show changes
            </Label>
          </div>
          <GitCompare className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* SOP Details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{sop.title}</CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline">{sop.department}</Badge>
                <Badge variant="secondary">Version {sop.version}</Badge>
                <span className="text-sm text-gray-500">by {sop.author}</span>
                <span className="text-sm text-gray-500">Updated {sop.lastUpdated}</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Pending Review
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Content Review */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>SOP Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showChanges ? (
            renderDiffView()
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-lg">
                {sop.content}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Review Decision</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="review-comment">Review Comments</Label>
            <Textarea
              id="review-comment"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Add your review comments here..."
              className="mt-2"
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-4 pt-4">
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve &amp; Publish
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleRequestChanges}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Request Changes
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 pt-2">
            Once approved, this SOP will be published and automatically assigned to relevant team members for acknowledgment.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}