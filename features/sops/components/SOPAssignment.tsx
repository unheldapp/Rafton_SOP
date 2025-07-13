import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Badge } from "../../../shared/components/ui/badge";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Separator } from "../../../shared/components/ui/separator";
import { Calendar } from "../../../shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../shared/components/ui/popover";
import { format } from 'date-fns';
import {
  Send,
  Users,
  Building,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Bell,
  CheckCircle,
  X,
  Plus,
  Target,
  Mail
} from 'lucide-react';
import { SOP, User } from '../App';

interface SOPAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOP | null;
  users: User[];
}

interface Assignment {
  id: string;
  type: 'user' | 'department';
  targetId: string;
  targetName: string;
  dueDate: Date;
  reviewDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sendNotification: boolean;
  requireAcknowledgment: boolean;
  allowComments: boolean;
  customMessage?: string;
}

export function SOPAssignment({ isOpen, onClose, sop, users }: SOPAssignmentProps) {
  const [assignmentType, setAssignmentType] = useState<'individual' | 'department'>('individual');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date>();
  const [reviewDate, setReviewDate] = useState<Date>();
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [sendNotification, setSendNotification] = useState(true);
  const [requireAcknowledgment, setRequireAcknowledgment] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState<'none' | 'daily' | 'weekly'>('weekly');

  const departments = ['Safety', 'Operations', 'QA', 'HR', 'IT', 'Finance'];

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleDepartmentToggle = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(dept => dept !== department)
        : [...prev, department]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectAllDepartments = () => {
    if (selectedDepartments.length === departments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments([...departments]);
    }
  };

  const handleAssign = () => {
    const assignment: Assignment = {
      id: `assignment-${Date.now()}`,
      type: assignmentType === 'individual' ? 'user' : 'department',
      targetId: assignmentType === 'individual' ? selectedUsers.join(',') : selectedDepartments.join(','),
      targetName: assignmentType === 'individual' 
        ? `${selectedUsers.length} users` 
        : selectedDepartments.join(', '),
      dueDate: dueDate!,
      reviewDate,
      priority,
      sendNotification,
      requireAcknowledgment,
      allowComments,
      customMessage
    };

    console.log('Creating SOP assignment:', assignment);
    onClose();
    
    // Reset form
    setSelectedUsers([]);
    setSelectedDepartments([]);
    setDueDate(undefined);
    setReviewDate(undefined);
    setPriority('medium');
    setCustomMessage('');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const isFormValid = () => {
    const hasTargets = assignmentType === 'individual' ? selectedUsers.length > 0 : selectedDepartments.length > 0;
    return hasTargets && dueDate;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto border-purple-200 p-0">
        <DialogHeader className="p-8 pb-6 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <span>Assign SOP for Acknowledgment</span>
          </DialogTitle>
          {sop && (
            <div className="flex items-center space-x-4 pt-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{sop.title}</p>
                <p className="text-sm text-gray-600">Version {sop.version} • {sop.department} Department</p>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Assignment Type */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-gray-900">Assignment Type</Label>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-2">
              <Button
                variant={assignmentType === 'individual' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setAssignmentType('individual')}
                className={`flex-1 h-12 ${assignmentType === 'individual' 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                } transition-all duration-300`}
              >
                <Users className="w-5 h-5 mr-3" />
                Individual Users
              </Button>
              <Button
                variant={assignmentType === 'department' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setAssignmentType('department')}
                className={`flex-1 h-12 ${assignmentType === 'department' 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                } transition-all duration-300`}
              >
                <Building className="w-5 h-5 mr-3" />
                Departments
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Target Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium text-gray-900">
                  {assignmentType === 'individual' ? 'Select Users' : 'Select Departments'}
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={assignmentType === 'individual' ? handleSelectAllUsers : handleSelectAllDepartments}
                  className="border-purple-200 hover:bg-purple-50 text-purple-600 px-4 py-2"
                >
                  {assignmentType === 'individual' 
                    ? (selectedUsers.length === users.length ? 'Deselect All' : 'Select All')
                    : (selectedDepartments.length === departments.length ? 'Deselect All' : 'Select All')
                  }
                </Button>
              </div>

              <div className="border border-purple-200 rounded-xl p-6 max-h-80 overflow-y-auto bg-white shadow-sm">
                {assignmentType === 'individual' ? (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-4 p-4 hover:bg-purple-50 rounded-xl transition-colors border border-transparent hover:border-purple-200">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                          className="border-purple-300 w-5 h-5"
                        />
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gradient-to-br from-purple-100 to-violet-200 text-purple-700 font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-base">{user.name}</div>
                          <div className="text-sm text-gray-600 truncate">{user.email}</div>
                          {user.department && (
                            <div className="text-xs text-gray-500 mt-1">{user.department} Department</div>
                          )}
                        </div>
                        <Badge className={`${
                          user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          user.role === 'employee' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        } px-3 py-1`}>
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {departments.map((department) => (
                      <div key={department} className="flex items-center space-x-4 p-4 hover:bg-purple-50 rounded-xl transition-colors border border-transparent hover:border-purple-200">
                        <Checkbox
                          checked={selectedDepartments.includes(department)}
                          onCheckedChange={() => handleDepartmentToggle(department)}
                          className="border-purple-300 w-5 h-5"
                        />
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl flex items-center justify-center">
                          <Building className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-base">{department}</div>
                          <div className="text-sm text-gray-600">
                            {users.filter(u => u.department === department).length} members
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected count */}
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <strong>
                  {assignmentType === 'individual' 
                    ? `${selectedUsers.length} of ${users.length} users selected`
                    : `${selectedDepartments.length} of ${departments.length} departments selected`
                  }
                </strong>
              </div>
            </div>

            {/* Assignment Settings */}
            <div className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-900">Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-purple-200 hover:bg-purple-50 h-12 text-base"
                      >
                        <CalendarIcon className="w-5 h-5 mr-3" />
                        {dueDate ? format(dueDate, 'PPP') : 'Select due date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium text-gray-900">Review Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-purple-200 hover:bg-purple-50 h-12 text-base"
                      >
                        <CalendarIcon className="w-5 h-5 mr-3" />
                        {reviewDate ? format(reviewDate, 'PPP') : 'Select review date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={reviewDate}
                        onSelect={setReviewDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-900">Priority Level</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger className="border-purple-200 h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-3 py-1">
                        <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                        <span>Low Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-3 py-1">
                        <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                        <span>Medium Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-3 py-1">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span>High Priority</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center space-x-3 py-1">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Urgent</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reminder Frequency */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-900">Reminder Frequency</Label>
                <Select value={reminderFrequency} onValueChange={(value: any) => setReminderFrequency(value)}>
                  <SelectTrigger className="border-purple-200 h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Reminders</SelectItem>
                    <SelectItem value="daily">Daily Reminders</SelectItem>
                    <SelectItem value="weekly">Weekly Reminders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <Label className="text-base font-medium text-gray-900">Assignment Options</Label>
                <div className="space-y-4 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={sendNotification}
                      onCheckedChange={setSendNotification}
                      className="border-purple-300 w-5 h-5"
                    />
                    <Label className="text-base text-gray-700">Send email notification to recipients</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={requireAcknowledgment}
                      onCheckedChange={setRequireAcknowledgment}
                      className="border-purple-300 w-5 h-5"
                    />
                    <Label className="text-base text-gray-700">Require formal acknowledgment</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={allowComments}
                      onCheckedChange={setAllowComments}
                      className="border-purple-300 w-5 h-5"
                    />
                    <Label className="text-base text-gray-700">Allow recipients to add comments</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-900">Custom Message (Optional)</Label>
            <Textarea
              placeholder="Add a custom message for the recipients about this SOP assignment..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="border-purple-200 focus:border-violet-500 focus:ring-violet-500/20 min-h-24 text-base p-4"
            />
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span>Assignment Summary</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-200 min-h-[80px] flex flex-col justify-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recipients</span>
                <div className="font-semibold text-gray-900 text-sm leading-tight">
                  {assignmentType === 'individual' 
                    ? `${selectedUsers.length} ${selectedUsers.length === 1 ? 'user' : 'users'}`
                    : `${selectedDepartments.length} ${selectedDepartments.length === 1 ? 'department' : 'departments'}`
                  }
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200 min-h-[80px] flex flex-col justify-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Due Date</span>
                <div className="font-semibold text-gray-900 text-sm leading-tight">
                  {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Not set'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200 min-h-[80px] flex flex-col justify-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Priority</span>
                <div className="flex items-center">
                  <Badge className={`${getPriorityColor(priority)} font-medium text-xs px-2 py-1`}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200 min-h-[80px] flex flex-col justify-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Notifications</span>
                <div className="font-semibold text-gray-900 text-sm leading-tight">
                  {sendNotification ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>
            
            {/* Additional Summary Details */}
            {(reviewDate || customMessage.trim()) && (
              <div className="mt-4 pt-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviewDate && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Review Date</span>
                      <div className="font-semibold text-gray-900 text-sm">
                        {format(reviewDate, 'MMM dd, yyyy')}
                      </div>
                    </div>
                  )}
                  {customMessage.trim() && (
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">Custom Message</span>
                      <div className="text-gray-900 text-sm line-clamp-2">
                        {customMessage.length > 50 ? `${customMessage.substring(0, 50)}...` : customMessage}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-purple-200">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-purple-200 hover:bg-purple-50 px-8 py-3 text-base"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!isFormValid()}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-base"
            >
              <Send className="w-5 h-5 mr-2" />
              Assign SOP
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}