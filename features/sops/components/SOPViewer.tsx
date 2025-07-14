import React, { useState, useEffect } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Separator } from "../../../shared/components/ui/separator";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Textarea } from "../../../shared/components/ui/textarea";
import { 
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Building2,
  Hash,
  Eye,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  BookOpen,
  Users,
  Star,
  Share2,
  Printer
} from 'lucide-react';
import { SOPWithDetails, SOPService } from '../../../shared/services/sopService';
import { User as UserType } from '../../../shared/types';
import { AssignmentService } from '../../../shared/services/assignmentService';
import { toast } from 'sonner';

interface SOPViewerProps {
  sop?: SOPWithDetails | null;
  sopId?: string;
  currentUser: UserType;
  onNavigate: (page: string, sop?: SOPWithDetails) => void;
  onBack?: () => void;
  showAcknowledgment?: boolean;
}

export function SOPViewer({ 
  sop, 
  sopId,
  currentUser, 
  onNavigate, 
  onBack, 
  showAcknowledgment = false 
}: SOPViewerProps) {
  // ALL STATE HOOKS MUST BE DECLARED FIRST - BEFORE ANY EARLY RETURNS
  const [currentSOP, setCurrentSOP] = useState<SOPWithDetails | null>(sop || null);
  const [loading, setLoading] = useState(!sop && !!sopId);
  const [error, setError] = useState<string | null>(null);
  const [acknowledging, setAcknowledging] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [acknowledgmentNotes, setAcknowledgmentNotes] = useState('');
  const [assignment, setAssignment] = useState<any>(null);

  // Fetch SOP data if sopId is provided but sop is not
  useEffect(() => {
    const fetchSOPData = async () => {
      if (sopId && !sop) {
        try {
          setLoading(true);
          setError(null);
          console.log('SOPViewer: Fetching SOP data for ID:', sopId);
          
          const sopData = await SOPService.getSOPById(sopId);
          if (sopData) {
            setCurrentSOP(sopData);
            console.log('SOPViewer: Successfully fetched SOP:', sopData.title);
          } else {
            setError('Document not found');
          }
        } catch (err) {
          console.error('SOPViewer: Error fetching SOP:', err);
          setError('Failed to load document');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSOPData();
  }, [sopId, sop]);

  // Check if user has acknowledged this SOP
  useEffect(() => {
    const checkAcknowledgment = async () => {
      if (currentSOP && showAcknowledgment && currentUser) {
        try {
          const assignments = await AssignmentService.getEmployeeAssignments(currentUser.id);
          const sopAssignment = assignments.find(a => a.sop_id === currentSOP.id);
          
          if (sopAssignment) {
            setAssignment(sopAssignment);
            setHasAcknowledged(sopAssignment.status === 'acknowledged');
          }
        } catch (err) {
          console.error('SOPViewer: Error checking acknowledgment:', err);
        }
      }
    };

    checkAcknowledgment();
  }, [currentSOP, showAcknowledgment, currentUser]);

  // Handle acknowledgment
  const handleAcknowledge = async () => {
    if (!currentSOP || !assignment) return;

    try {
      setAcknowledging(true);
      
      await AssignmentService.acknowledgeAssignment(assignment.id, {
        notes: acknowledgmentNotes,
        acknowledged_at: new Date().toISOString()
      });

      setHasAcknowledged(true);
      toast.success('Document acknowledged successfully');
      
      // Refresh assignment data
      const assignments = await AssignmentService.getEmployeeAssignments(currentUser.id);
      const updatedAssignment = assignments.find(a => a.sop_id === currentSOP.id);
      if (updatedAssignment) {
        setAssignment(updatedAssignment);
      }
    } catch (err) {
      console.error('SOPViewer: Error acknowledging SOP:', err);
      toast.error('Failed to acknowledge document');
    } finally {
      setAcknowledging(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle download
  const handleDownload = () => {
    if (!currentSOP) return;
    
    const content = `
# ${currentSOP.title}

**Department:** ${currentSOP.department}
**Version:** ${currentSOP.version}
**Status:** ${currentSOP.status}
**Priority:** ${currentSOP.priority}
**Created:** ${new Date(currentSOP.created_at).toLocaleDateString()}
**Updated:** ${new Date(currentSOP.updated_at).toLocaleDateString()}

---

${currentSOP.content}
    `;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSOP.title}.md`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format content for display
  const formatContent = (content: string) => {
    if (!content) return '';
    
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  };

  // Early return checks after all hooks are declared
  if (!sop && !sopId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No document specified</p>
          <Button 
            onClick={onBack || (() => onNavigate('sops'))}
            className="mt-4"
            variant="outline"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view documents</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={onBack || (() => onNavigate('sops'))}
            className="mt-4"
            variant="outline"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!currentSOP) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Document not found</p>
          <Button 
            onClick={onBack || (() => onNavigate('sops'))}
            className="mt-4"
            variant="outline"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button 
                onClick={onBack || (() => onNavigate('sops'))}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                <h1 className="text-xl font-semibold text-gray-900">Document Viewer</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handlePrint}
                variant="outline"
                size="sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {currentSOP.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Version {currentSOP.version} • {currentSOP.department}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(currentSOP.status)}>
                      {currentSOP.status}
                    </Badge>
                    <Badge className={getPriorityColor(currentSOP.priority)}>
                      {currentSOP.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatContent(currentSOP.content || '') 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Acknowledgment Section */}
            {showAcknowledgment && assignment && !hasAcknowledged && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Acknowledgment Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      You need to acknowledge that you have read and understood this document.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optional)
                      </label>
                      <Textarea
                        value={acknowledgmentNotes}
                        onChange={(e) => setAcknowledgmentNotes(e.target.value)}
                        placeholder="Add any notes or questions about this document..."
                        className="w-full"
                      />
                    </div>
                    <Button 
                      onClick={handleAcknowledge}
                      disabled={acknowledging}
                      className="w-full"
                    >
                      {acknowledging ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Acknowledging...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Acknowledge Document
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acknowledgment Status */}
            {showAcknowledgment && hasAcknowledged && (
              <Card className="mt-6 bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-900">Document Acknowledged</p>
                      <p className="text-sm text-green-600">
                        You acknowledged this document on {new Date(assignment.acknowledged_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Hash className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Document ID</p>
                    <p className="text-sm text-gray-600">{currentSOP.id.slice(0, 8)}...</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Author</p>
                    <p className="text-sm text-gray-600">{currentSOP.author_name || 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Department</p>
                    <p className="text-sm text-gray-600">{currentSOP.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(currentSOP.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {new Date(currentSOP.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Eye className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Version</p>
                    <p className="text-sm text-gray-600">{currentSOP.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 