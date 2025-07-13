import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Separator } from "../../../shared/components/ui/separator";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { 
  UserPlus,
  Mail,
  MoreHorizontal,
  Shield,
  User as UserIcon,
  Eye,
  Edit,
  Key,
  UserX,
  Activity,
  Trash2,
  UserCheck,
  Settings,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { User } from '../../../shared/types';

interface UserManagementProps {
  users: User[];
  onCreateUser: (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'auditor';
    department?: string;
    position?: string;
    phone?: string;
  }) => Promise<User>;
  onUpdateUser: (userId: string, updates: Partial<{
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'auditor';
    department: string;
    position: string;
    phone: string;
    status: 'active' | 'inactive' | 'pending';
  }>) => Promise<User>;
  onDeleteUser: (userId: string) => Promise<void>;
  loading?: boolean;
}

export function UserManagement({ 
  users, 
  onCreateUser, 
  onUpdateUser, 
  onDeleteUser,
  loading = false
}: UserManagementProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isUserActionOpen, setIsUserActionOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '' as 'admin' | 'employee' | 'auditor',
    department: '',
    position: '',
    phone: ''
  });
  
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee' as 'admin' | 'employee' | 'auditor',
    department: '',
    position: '',
    phone: ''
  });

  const handleUserAction = (user: User) => {
    setSelectedUser(user);
    setIsUserActionOpen(true);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setEditForm({
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      role: selectedUser.role,
      department: selectedUser.department || '',
      position: selectedUser.position || '',
      phone: selectedUser.phone || ''
    });
    setIsEditModalOpen(true);
    setIsUserActionOpen(false);
  };

  const handleDeleteUser = () => {
    setIsDeleteModalOpen(true);
    setIsUserActionOpen(false);
  };

  const confirmEditUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      await onUpdateUser(selectedUser.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        role: editForm.role,
        department: editForm.department,
        position: editForm.position,
        phone: editForm.phone
      });
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      await onDeleteUser(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName) {
      setError('Please fill in all required fields');
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    try {
      await onCreateUser({
        email: inviteForm.email,
        firstName: inviteForm.firstName,
        lastName: inviteForm.lastName,
        role: inviteForm.role,
        department: inviteForm.department,
        position: inviteForm.position,
        phone: inviteForm.phone
      });
      
      setInviteForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'employee',
        department: '',
        position: '',
        phone: ''
      });
      setIsInviteOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = () => {
    console.log('Reset password for user:', selectedUser?.id);
    // Implement password reset logic
    setIsUserActionOpen(false);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    
    const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
    
    setActionLoading(true);
    setError(null);
    
    try {
      await onUpdateUser(selectedUser.id, { status: newStatus });
      setIsUserActionOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewActivity = () => {
    console.log('View activity for user:', selectedUser?.id);
    // Implement activity view logic
    setIsUserActionOpen(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'auditor':
        return <Eye className="w-4 h-4 text-blue-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Admin</Badge>;
      case 'auditor':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Auditor</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Employee</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={inviteForm.firstName}
                      onChange={(e) => setInviteForm({...inviteForm, firstName: e.target.value})}
                      disabled={actionLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={inviteForm.lastName}
                      onChange={(e) => setInviteForm({...inviteForm, lastName: e.target.value})}
                      disabled={actionLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={inviteForm.role} 
                    onValueChange={(value: 'admin' | 'employee' | 'auditor') => 
                      setInviteForm({...inviteForm, role: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({...inviteForm, department: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={inviteForm.position}
                    onChange={(e) => setInviteForm({...inviteForm, position: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({...inviteForm, phone: e.target.value})}
                    disabled={actionLoading}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsInviteOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInviteUser}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invite
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.department || 'Not specified'}</div>
                        <div className="text-gray-500">{user.position || 'Not specified'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isUserActionOpen && selectedUser?.id === user.id} onOpenChange={setIsUserActionOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUserAction(user)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                          <DialogHeader>
                            <DialogTitle>User Actions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleEditUser}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit User
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleToggleStatus}
                            >
                              {selectedUser?.status === 'active' ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleResetPassword}
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </Button>
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleViewActivity}
                            >
                              <Activity className="w-4 h-4 mr-2" />
                              View Activity
                            </Button>
                            <Separator />
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={handleDeleteUser}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  disabled={actionLoading}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  disabled={actionLoading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editForm.email}
                disabled={true}
              />
            </div>
            
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select 
                value={editForm.role} 
                onValueChange={(value: 'admin' | 'employee' | 'auditor') => 
                  setEditForm({...editForm, role: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="editDepartment">Department</Label>
              <Input
                id="editDepartment"
                value={editForm.department}
                onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                disabled={actionLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="editPosition">Position</Label>
              <Input
                id="editPosition"
                value={editForm.position}
                onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                disabled={actionLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="editPhone">Phone</Label>
              <Input
                id="editPhone"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                disabled={actionLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmEditUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-600">
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDeleteUser}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}