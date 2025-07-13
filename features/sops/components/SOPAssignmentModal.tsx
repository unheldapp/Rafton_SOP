import React, { useState, useEffect } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../shared/components/ui/dialog";
import { Badge } from "../../../shared/components/ui/badge";
import { ScrollArea } from "../../../shared/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  Search, 
  X, 
  UserCheck,
  Building2,
  Briefcase
} from 'lucide-react';
import { SOPWithDetails } from '../../../shared/services/sopService';
import { User } from '../../../shared/types';
import { useUsers } from '../../../shared/hooks/useUsers';
import { useAssignments } from '../../../shared/hooks/useSOPs';

interface SOPAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sop: SOPWithDetails;
  currentUser: User;
}

export function SOPAssignmentModal({ 
  isOpen, 
  onClose, 
  sop, 
  currentUser 
}: SOPAssignmentModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [isAssigning, setIsAssigning] = useState(false);

  const { users, loading: usersLoading } = useUsers();
  const { assignSOPToUsers } = useAssignments();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUsers(new Set());
      setDueDate('');
      setPriority('medium');
      setNotes('');
      setSearchTerm('');
      setFilterDepartment('all');
      setFilterRole('all');
    }
  }, [isOpen]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    // Don't show current user
    if (user.id === currentUser.id) return false;
    
    // Search filter
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Department filter
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    
    // Role filter (using user.role if available, otherwise show all)
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // Get unique departments and roles for filters
  const departments = [...new Set(users.map(u => u.department).filter(Boolean))];
  const roles = [...new Set(users.map(u => u.role).filter(Boolean))];

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    const allUserIds = filteredUsers.map(u => u.id);
    setSelectedUsers(new Set(allUserIds));
  };

  const handleClearAll = () => {
    setSelectedUsers(new Set());
  };

  const handleAssign = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    console.log('SOPAssignmentModal: Starting assignment process');
    console.log('SOPAssignmentModal: SOP ID:', sop.id);
    console.log('SOPAssignmentModal: Selected users:', Array.from(selectedUsers));
    console.log('SOPAssignmentModal: Assignment options:', { dueDate, priority, notes });

    setIsAssigning(true);
    try {
      await assignSOPToUsers(
        sop.id,
        Array.from(selectedUsers),
        {
          dueDate,
          priority,
          notes: notes || undefined
        }
      );
      
      console.log('SOPAssignmentModal: Assignment successful!');
      toast.success(`SOP assigned to ${selectedUsers.size} user(s) successfully!`);
      onClose();
    } catch (error) {
      console.error('SOPAssignmentModal: Assignment failed:', error);
      console.error('SOPAssignmentModal: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      toast.error('Failed to assign SOP. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Set default due date to 1 week from now
  useEffect(() => {
    if (isOpen && !dueDate) {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      setDueDate(weekFromNow.toISOString().split('T')[0]);
    }
  }, [isOpen, dueDate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Assign SOP to Users
          </DialogTitle>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">{sop.title}</span> • {sop.department}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 min-h-0">
          {/* Assignment Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date *
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Priority
              </Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Selected Users
              </Label>
              <div className="p-2 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-700">
                  {selectedUsers.size} user(s) selected
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any instructions or context for this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-gray-300"
              rows={2}
            />
          </div>

          {/* User Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Select Users</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredUsers.length === 0}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={selectedUsers.size === 0}
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Users
                </Label>
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Department
                </Label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Role
                </Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-64 border rounded-lg">
                {usersLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No users found matching the current filters.
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                          selectedUsers.has(user.id) ? 'bg-purple-50 border-purple-200' : 'border-gray-200'
                        }`}
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </span>
                            {user.department && (
                              <Badge variant="secondary" className="text-xs">
                                {user.department}
                              </Badge>
                            )}
                            {user.role && (
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={isAssigning || selectedUsers.size === 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAssigning ? 'Assigning...' : `Assign to ${selectedUsers.size} User(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 