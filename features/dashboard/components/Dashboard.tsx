import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Progress } from "../../../shared/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  Edit,
  TrendingUp,
  AlertTriangle,
  Star,
  Calendar,
  User,
  Plus,
  ArrowRight,
  Target,
  Activity,
  Zap,
  BarChart3,
  Upload,
  UserPlus,
  Settings,
  Eye,
  Send,
  AlertCircle,
  Folder,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { User as UserType } from '../../../shared/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useDashboard } from '../../../shared/hooks/useDashboard';

interface DashboardProps {
  user: UserType;
  onNavigate: (page: any, item?: any) => void;
}

export function Dashboard({ user, onNavigate }: DashboardProps) {
  const { data: dashboardData, loading, error, refreshData } = useDashboard();

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading dashboard data</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!dashboardData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No dashboard data available</p>
            <Button onClick={refreshData} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, recentSOPs, upcomingDeadlines, acknowledgmentTrend, complianceByDepartment, auditLogEvents, sopReviewPipeline } = dashboardData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending-review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'draft':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-violet-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {getGreeting()}, {user.firstName}!
            </h1>
            <p className="text-purple-100">
              Your compliance dashboard - monitor SOPs, track acknowledgments, and manage reviews
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={refreshData} 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <div className="text-right">
              <p className="text-purple-200 text-sm">Today's Date</p>
              <p className="text-white font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onNavigate('acknowledgments')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.acknowledgedCount}</p>
              <p className="text-emerald-700 font-medium">Total Acknowledged</p>
              <p className="text-xs text-emerald-600">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onNavigate('acknowledgments')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.pendingAcknowledgments}</p>
              <p className="text-amber-700 font-medium">Pending Acknowledgments</p>
              <p className="text-xs text-amber-600">Requires attention</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onNavigate('sops')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.publishedSOPs}</p>
              <p className="text-purple-700 font-medium">Active SOPs</p>
              <p className="text-xs text-purple-600">Currently published</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => onNavigate('sops')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{stats.sopsExpiringSoon}</p>
              <p className="text-red-700 font-medium">SOPs Due for Review</p>
              <p className="text-xs text-red-600">Next 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acknowledgment Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Acknowledgment Trends (Last 6 Months)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={acknowledgmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="assigned" stroke="#3b82f6" strokeWidth={2} name="Assigned" />
                <Line type="monotone" dataKey="acknowledged" stroke="#8b5cf6" strokeWidth={3} name="Acknowledged" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Compliance by Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={complianceByDepartment}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {complianceByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {complianceByDepartment.slice(0, 3).map((dept, index) => (
                <div key={dept.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index] }}></div>
                    <span>{dept.name}</span>
                  </div>
                  <span className="font-medium">{dept.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SOP Review Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>SOP Review Pipeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sopReviewPipeline} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="status" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Tables Section */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Recently Updated SOPs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Recently Updated SOPs</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => onNavigate('sops')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSOPs.map((sop) => (
                    <TableRow key={sop.id}>
                      <TableCell className="font-medium">{sop.title}</TableCell>
                      <TableCell>
                        {sop.author 
                          ? `${sop.author.first_name || ''} ${sop.author.last_name || ''}`.trim() 
                          : 'Unknown Author'
                        }
                      </TableCell>
                      <TableCell>{new Date(sop.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(sop.status)}`}>
                          {sop.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => onNavigate('editor', sop)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upcoming Acknowledgment Deadlines */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Upcoming Acknowledgment Deadlines</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => onNavigate('acknowledgments')}>
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingDeadlines.map((deadline, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{deadline.document}</TableCell>
                      <TableCell>{deadline.assignedTo}</TableCell>
                      <TableCell>{new Date(deadline.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getStatusColor(deadline.status)}`}>
                          {deadline.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Audit Log Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <span>Recent Audit Log Events</span>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => onNavigate('reports')}>
                  View Full Log
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Entity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogEvents.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{event.event}</TableCell>
                      <TableCell>{event.user}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.entity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => onNavigate('template-selector')}
                className="w-full justify-start bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New SOP
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate('sops')}
                className="w-full justify-start"
              >
                <Folder className="w-4 h-4 mr-2" />
                Create New Folder
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate('sops')}
                className="w-full justify-start"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate('users')}
                className="w-full justify-start"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate('reports')}
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => onNavigate('settings')}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>

          {/* Urgent Notifications */}
          {(stats.pendingReviewSOPs > 0 || stats.sopsExpiringSoon > 0) && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-amber-900">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Urgent Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.pendingReviewSOPs > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-900">
                      {stats.pendingReviewSOPs} SOPs pending review
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 border-amber-300 text-amber-700">
                      Review Now
                    </Button>
                  </div>
                )}
                
                {stats.sopsExpiringSoon > 0 && (
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-900">
                      {stats.sopsExpiringSoon} SOPs due for review
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 border-amber-300 text-amber-700">
                      Schedule Reviews
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Overall Health</span>
                <Badge className="bg-green-50 text-green-700 border-green-200">Good</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup Status</span>
                <Badge className="bg-green-50 text-green-700 border-green-200">Current</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Users Online</span>
                <span className="text-sm font-medium">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Compliance Rate</span>
                <span className="text-sm font-medium text-green-700">{stats.overallComplianceRate}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}