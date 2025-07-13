import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Calendar } from "../../../shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  Calendar as CalendarIcon,
  Eye,
  Filter,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

interface AuditorComplianceOverviewProps {
  onNavigateToDocuments?: (filters?: any) => void;
}

export function AuditorComplianceOverview({ onNavigateToDocuments }: AuditorComplianceOverviewProps) {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');

  // Mock data for KPIs
  const kpiData = {
    acknowledged: { value: 87, count: 272, total: 312 },
    pending: { value: 102, percentage: 32.7 },
    overdue: { value: 16, percentage: 5.1 },
    totalDocuments: { value: 312, active: 298, published: 289 }
  };

  // Mock data for department compliance
  const departmentData = [
    { department: 'Safety', acknowledged: 92, pending: 6, overdue: 2, total: 45 },
    { department: 'HR', acknowledged: 89, pending: 8, overdue: 3, total: 38 },
    { department: 'Operations', acknowledged: 85, pending: 12, overdue: 3, total: 67 },
    { department: 'IT', acknowledged: 94, pending: 4, overdue: 2, total: 32 },
    { department: 'QA', acknowledged: 78, pending: 15, overdue: 7, total: 43 },
    { department: 'Finance', acknowledged: 91, pending: 7, overdue: 2, total: 28 }
  ];

  // Mock data for 6-month trend
  const trendData = [
    { month: 'Feb', acknowledged: 89, pending: 23 },
    { month: 'Mar', acknowledged: 94, pending: 18 },
    { month: 'Apr', acknowledged: 87, pending: 25 },
    { month: 'May', acknowledged: 102, pending: 21 },
    { month: 'Jun', acknowledged: 96, pending: 19 },
    { month: 'Jul', acknowledged: 108, pending: 16 }
  ];

  // Mock data for overdue items
  const overdueItems = [
    {
      id: '1',
      document: 'Fire Safety SOP',
      assignedTo: 'QA Team',
      department: 'Operations',
      dueDate: '2025-06-20',
      daysOverdue: 19,
      assignees: 8
    },
    {
      id: '2',
      document: 'Chemical Handling Update',
      assignedTo: 'Safety Team',
      department: 'Safety',
      dueDate: '2025-06-25',
      daysOverdue: 14,
      assignees: 12
    },
    {
      id: '3',
      document: 'Data Privacy Policy',
      assignedTo: 'IT Department',
      department: 'IT',
      dueDate: '2025-06-28',
      daysOverdue: 11,
      assignees: 25
    },
    {
      id: '4',
      document: 'Equipment Maintenance',
      assignedTo: 'Operations',
      department: 'Operations',
      dueDate: '2025-07-01',
      daysOverdue: 8,
      assignees: 15
    },
    {
      id: '5',
      document: 'HR Guidelines',
      assignedTo: 'HR Team',
      department: 'HR',
      dueDate: '2025-07-03',
      daysOverdue: 6,
      assignees: 18
    }
  ];

  const handleKpiCardClick = (type: string) => {
    const filters = {
      acknowledged: { status: 'acknowledged' },
      pending: { status: 'pending' },
      overdue: { status: 'overdue' },
      totalDocuments: {}
    };
    
    onNavigateToDocuments?.(filters[type as keyof typeof filters]);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Compliance Overview</h1>
          <p className="text-gray-600">Organization-wide compliance monitoring and audit insights</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Filter className="w-5 h-5 text-gray-600" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                        ) : (
                          dateRange.from.toLocaleDateString()
                        )
                      ) : (
                        'Last 30 days'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Document Type</label>
                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sop">SOP</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="guideline">Guideline</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Summary Strip - 4 Compact KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-emerald-200 bg-emerald-50/50" 
            onClick={() => handleKpiCardClick('acknowledged')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-600">Acknowledged</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-600">{kpiData.acknowledged.value}%</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kpiData.acknowledged.count} of {kpiData.acknowledged.total} documents
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-amber-200 bg-amber-50/50" 
            onClick={() => handleKpiCardClick('pending')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-medium text-gray-600">Pending</span>
                  </div>
                  <div className="text-3xl font-bold text-amber-600">{kpiData.pending.value}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kpiData.pending.percentage}% of total documents
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-red-200 bg-red-50/50" 
            onClick={() => handleKpiCardClick('overdue')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-gray-600">Overdue</span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{kpiData.overdue.value}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kpiData.overdue.percentage}% past due date
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-blue-200 bg-blue-50/50" 
            onClick={() => handleKpiCardClick('totalDocuments')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total Documents</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{kpiData.totalDocuments.value}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {kpiData.totalDocuments.published} published SOPs & policies
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Compliance by Department Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <span>Compliance by Department</span>
              </CardTitle>
              <CardDescription>Acknowledgment percentage across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="department" 
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="acknowledged" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <span>Acknowledgment Trend (6 Months)</span>
              </CardTitle>
              <CardDescription>Monthly acknowledgment activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="acknowledged" 
                      stroke="#7c3aed" 
                      fill="#a855f7" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Overdue Risk Table</span>
            </CardTitle>
            <CardDescription>Documents requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{item.document}</div>
                        <div className="text-sm text-gray-500">{item.assignees} assignees</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.assignedTo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(item.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="text-xs">
                        {item.daysOverdue} days
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}