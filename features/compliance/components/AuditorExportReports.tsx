import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Input } from "../../../shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Calendar } from "../../../shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Switch } from "../../../shared/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Users, 
  BarChart3, 
  FileSpreadsheet,
  Clock,
  Settings,
  Mail,
  RefreshCw,
  Eye,
  Plus,
  Edit,
  Pause,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';

interface ReportPreviewData {
  columns: string[];
  rows: (string | number)[][];
}

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  recipients: string[];
  format: 'csv' | 'xlsx' | 'pdf';
  isActive: boolean;
}

export function AuditorExportReports() {
  // Filter/Config states
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [department, setDepartment] = useState('all');
  const [documentType, setDocumentType] = useState('all');
  const [format, setFormat] = useState('csv');
  
  // UI states
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ReportPreviewData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string>('');
  const [emailReport, setEmailReport] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  // Mock scheduled reports
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Compliance Summary',
      reportType: 'document-compliance',
      frequency: 'weekly',
      nextRun: '2025-07-14',
      recipients: ['audit@company.com', 'compliance@company.com'],
      format: 'xlsx',
      isActive: true
    },
    {
      id: '2',
      name: 'Monthly User Report',
      reportType: 'user-compliance',
      frequency: 'monthly',
      nextRun: '2025-08-01',
      recipients: ['hr@company.com'],
      format: 'pdf',
      isActive: true
    },
    {
      id: '3',
      name: 'Daily Overdue Report',
      reportType: 'overdue-report',
      frequency: 'daily',
      nextRun: '2025-07-12',
      recipients: ['manager@company.com'],
      format: 'csv',
      isActive: false
    }
  ]);

  // Report type definitions
  const reportTypes = [
    {
      id: 'acknowledgment-log',
      title: 'Acknowledgment Log',
      description: 'Each document + user + status + acknowledgment date',
      icon: CheckCircle,
      estimatedRows: 1250
    },
    {
      id: 'document-compliance',
      title: 'Document-wise Compliance',
      description: 'Document-wise summary: assigned, acknowledged, pending, overdue',
      icon: FileText,
      estimatedRows: 87
    },
    {
      id: 'user-compliance',
      title: 'User-wise Compliance',
      description: 'User-wise summary: assigned, acknowledged, pending counts',
      icon: Users,
      estimatedRows: 156
    },
    {
      id: 'overdue-report',
      title: 'Overdue Report',
      description: 'List of overdue acknowledgments with details',
      icon: AlertCircle,
      estimatedRows: 23
    },
    {
      id: 'version-history',
      title: 'Version History',
      description: 'Document version log with update details',
      icon: Clock,
      estimatedRows: 342
    }
  ];

  // Mock preview data for each report type
  const getPreviewData = (reportType: string): ReportPreviewData => {
    switch (reportType) {
      case 'acknowledgment-log':
        return {
          columns: ['Document', 'Assigned To', 'Status', 'Acknowledged On', 'Version', 'Department'],
          rows: [
            ['Fire Safety SOP', 'John Doe', 'Acknowledged', '2025-07-09', 'v2.1', 'Safety'],
            ['Chemical Handling', 'Sarah Johnson', 'Acknowledged', '2025-07-08', 'v1.4', 'Operations'],
            ['Data Privacy Policy', 'Mike Brown', 'Pending', '-', 'v4.1', 'IT'],
            ['Emergency Response', 'Emily Davis', 'Acknowledged', '2025-07-10', 'v3.0', 'Safety'],
            ['Quality Guidelines', 'James Wilson', 'Overdue', '-', 'v1.2', 'QA']
          ]
        };
      
      case 'document-compliance':
        return {
          columns: ['Document', 'Type', 'Assigned', 'Acknowledged', 'Pending', 'Overdue', 'Compliance Rate'],
          rows: [
            ['Fire Safety SOP', 'SOP', 24, 18, 4, 2, '75%'],
            ['Code of Conduct', 'Policy', 45, 45, 0, 0, '100%'],
            ['Equipment Handling', 'SOP', 10, 5, 3, 2, '50%'],
            ['Data Privacy Policy', 'Policy', 25, 22, 1, 2, '88%'],
            ['Quality Guidelines', 'Guideline', 18, 16, 2, 0, '89%']
          ]
        };
      
      case 'user-compliance':
        return {
          columns: ['User Name', 'Email', 'Department', 'Assigned', 'Acknowledged', 'Pending', 'Overdue', 'Compliance Rate'],
          rows: [
            ['John Doe', 'john@company.com', 'Safety', 12, 10, 1, 1, '83%'],
            ['Sarah Johnson', 'sarah@company.com', 'Operations', 8, 8, 0, 0, '100%'],
            ['Mike Brown', 'mike@company.com', 'QA', 15, 12, 2, 1, '80%'],
            ['Emily Davis', 'emily@company.com', 'HR', 6, 5, 1, 0, '83%'],
            ['James Wilson', 'james@company.com', 'IT', 9, 7, 1, 1, '78%']
          ]
        };
      
      case 'overdue-report':
        return {
          columns: ['Document', 'Assigned To', 'Department', 'Due Date', 'Days Overdue', 'Reminders Sent'],
          rows: [
            ['Fire Safety SOP', 'John Doe', 'Safety', '2025-06-20', 19, 2],
            ['Chemical Handling', 'Sarah Johnson', 'Operations', '2025-06-25', 14, 1],
            ['Data Privacy Policy', 'Mike Brown', 'IT', '2025-06-28', 11, 2],
            ['Equipment Handling', 'Emily Davis', 'Operations', '2025-07-01', 8, 1],
            ['Quality Guidelines', 'James Wilson', 'QA', '2025-07-03', 6, 1]
          ]
        };
      
      case 'version-history':
        return {
          columns: ['Document', 'Version', 'Updated By', 'Update Date', 'Change Type', 'Status'],
          rows: [
            ['Fire Safety SOP', 'v2.1', 'John Smith', '2025-07-09', 'Content Update', 'Published'],
            ['Data Privacy Policy', 'v4.1', 'Sarah Johnson', '2025-07-08', 'Major Revision', 'Published'],
            ['Chemical Handling', 'v1.4', 'Mike Brown', '2025-07-07', 'Minor Edit', 'Published'],
            ['Equipment Handling', 'v1.3', 'Emily Davis', '2025-07-06', 'Safety Update', 'Draft'],
            ['Quality Guidelines', 'v1.2', 'James Wilson', '2025-07-05', 'Procedure Change', 'Review']
          ]
        };
      
      default:
        return { columns: [], rows: [] };
    }
  };

  const handleGenerateReport = async () => {
    if (!reportType) return;
    
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const preview = getPreviewData(reportType);
    setPreviewData(preview);
    setShowPreview(true);
    setLastGenerated(new Date().toLocaleString());
    setIsGenerating(false);
  };

  const handleDownloadReport = () => {
    if (!previewData) return;
    
    const headers = previewData.columns.join(',');
    const rows = previewData.rows.map(row => row.join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailReport = () => {
    console.log('Sending report via email to:', emailAddress);
    // Mock email sending logic
  };

  const resetFilters = () => {
    setReportType('');
    setDateRange({});
    setDepartment('all');
    setDocumentType('all');
    setFormat('csv');
    setShowPreview(false);
    setPreviewData(null);
    setEmailReport(false);
    setEmailAddress('');
  };

  const getReportTypeInfo = (type: string) => {
    return reportTypes.find(rt => rt.id === type);
  };

  const toggleScheduledReport = (id: string) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, isActive: !report.isActive } : report
      )
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Export Reports</h1>
          <p className="text-gray-600">Generate structured compliance reports for audit and analysis</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Report Generation */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filter/Config Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <span>Report Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your compliance report parameters and filters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Type Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            reportType === type.id
                              ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500 ring-opacity-20'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setReportType(type.id)}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <Icon className={`w-5 h-5 ${reportType === type.id ? 'text-purple-600' : 'text-gray-400'}`} />
                            <h4 className="font-medium text-gray-900">{type.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                          <div className="text-xs text-gray-500">
                            ~{type.estimatedRows} records
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
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

                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="qa">QA</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Document Type */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Document Type</label>
                    <Select value={documentType} onValueChange={setDocumentType}>
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

                  {/* Format */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">XLSX</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!reportType || isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate Report
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" onClick={resetFilters}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Preview Table */}
            {showPreview && previewData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <span>Report Preview</span>
                  </CardTitle>
                  <CardDescription>
                    Showing first 5 rows of {getReportTypeInfo(reportType)?.title} 
                    • {previewData.rows.length} sample records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewData.columns.map((column, index) => (
                            <TableHead key={index}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {typeof cell === 'string' && cell.includes('%') ? (
                                  <Badge variant="outline" className="text-xs">
                                    {cell}
                                  </Badge>
                                ) : typeof cell === 'string' && (cell === 'Acknowledged' || cell === 'Published') ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                    {cell}
                                  </Badge>
                                ) : typeof cell === 'string' && (cell === 'Pending' || cell === 'Review') ? (
                                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                                    {cell}
                                  </Badge>
                                ) : typeof cell === 'string' && (cell === 'Overdue' || cell === 'Draft') ? (
                                  <Badge variant="destructive" className="text-xs">
                                    {cell}
                                  </Badge>
                                ) : (
                                  cell
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Download Section */}
            {showPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-green-600" />
                    <span>Download Report</span>
                  </CardTitle>
                  <CardDescription>
                    Your report is ready for download
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Download Options */}
                  <div className="flex items-center space-x-4">
                    <Button onClick={handleDownloadReport} className="bg-green-600 hover:bg-green-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Download Now
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email-report"
                        checked={emailReport}
                        onCheckedChange={setEmailReport}
                      />
                      <label htmlFor="email-report" className="text-sm font-medium text-gray-700">
                        Email to me
                      </label>
                    </div>
                  </div>

                  {/* Email Input */}
                  {emailReport && (
                    <div className="flex items-center space-x-4">
                      <Input
                        type="email"
                        placeholder="Enter email address..."
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleEmailReport}
                        disabled={!emailAddress}
                        variant="outline"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  )}

                  {/* Last Generated Timestamp */}
                  {lastGenerated && (
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Last generated at {lastGenerated}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scheduled Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Scheduled Reports</span>
                  </div>
                  <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule New Report</DialogTitle>
                        <DialogDescription>
                          Create a recurring report schedule
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Report Name</label>
                          <Input placeholder="Enter report name..." />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Report Type</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                            <SelectContent>
                              {reportTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>{type.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Frequency</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Recipients</label>
                          <Input placeholder="Enter email addresses..." />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                            Cancel
                          </Button>
                          <Button>Create Schedule</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  Automated report generation and delivery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div key={report.id} className={`p-3 border rounded-lg ${
                      report.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={report.isActive ? "default" : "secondary"} className="text-xs">
                            {report.frequency}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleScheduledReport(report.id)}
                            >
                              {report.isActive ? <Pause className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Next run: {new Date(report.nextRun).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{report.recipients.length} recipient(s)</span>
                        </div>
                        <span className="uppercase">{report.format}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Generate common reports instantly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setReportType('overdue-report');
                      setDateRange({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() });
                      handleGenerateReport();
                    }}
                  >
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                    Current Overdue Items
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setReportType('document-compliance');
                      setDateRange({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
                      handleGenerateReport();
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-500" />
                    Monthly Compliance Summary
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setReportType('user-compliance');
                      setDateRange({ from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() });
                      handleGenerateReport();
                    }}
                  >
                    <Users className="w-4 h-4 mr-2 text-green-500" />
                    User Compliance Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Report Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reports Generated</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Scheduled Active</span>
                    <span className="font-medium">
                      {scheduledReports.filter(r => r.isActive).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Data Points</span>
                    <span className="font-medium">1,247</span>
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