import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Switch } from "../../../shared/components/ui/switch";
import { Separator } from "../../../shared/components/ui/separator";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { 
  User,
  Bell,
  Lock,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  Clock,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSettings } from '../../../shared/hooks/useSettings';
import { UserService } from '../../../shared/services/userService';

interface EmployeeSettingsProps {
  currentUser: any;
  onNavigate: (page: string) => void;
}

type SettingsSection = 'profile' | 'notifications' | 'preferences' | 'password';

export function EmployeeSettings({ currentUser, onNavigate }: EmployeeSettingsProps) {
  const { updateUser } = useAuth();
  const { userPreferences, updateUserPreferences, loadUserPreferences } = useSettings();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  // Notification preferences state
  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    documentUpdates: true,
    weeklyDigest: true,
    overdueReminders: true
  });

  // General preferences state
  const [preferencesForm, setPreferencesForm] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light'
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load user data on mount
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        position: currentUser.position || ''
      });

      // Load user preferences
      loadUserPreferences();
    }
  }, [currentUser, loadUserPreferences]);

  // Update forms when preferences are loaded
  useEffect(() => {
    if (userPreferences) {
      setNotificationForm({
        emailNotifications: userPreferences.emailNotifications ?? true,
        pushNotifications: userPreferences.pushNotifications ?? true,
        assignmentReminders: userPreferences.assignmentReminders ?? true,
        documentUpdates: userPreferences.documentUpdates ?? true,
        weeklyDigest: userPreferences.weeklyDigest ?? true,
        overdueReminders: userPreferences.overdueReminders ?? true
      });

      setPreferencesForm({
        language: userPreferences.language || 'en',
        timezone: userPreferences.timezone || 'America/New_York',
        dateFormat: userPreferences.dateFormat || 'MM/DD/YYYY',
        theme: userPreferences.theme || 'light'
      });
    }
  }, [userPreferences]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeSection === 'profile') {
        await UserService.updateProfile(currentUser.id, {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
          department: profileForm.department,
          position: profileForm.position
        });
      } else if (activeSection === 'notifications') {
        await updateUserPreferences(notificationForm);
      } else if (activeSection === 'preferences') {
        await updateUserPreferences(preferencesForm);
      } else if (activeSection === 'password') {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (passwordForm.newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        
        await UserService.changePassword(currentUser.id, {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });

        // Clear password form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving settings');
    } finally {
      setLoading(false);
    }
  };

  const settingsSections = [
    { key: 'profile', label: 'Profile', icon: UserCircle },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'preferences', label: 'Preferences', icon: Globe },
    { key: 'password', label: 'Password', icon: Lock }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Settings</h2>
              <p className="text-gray-600 mb-6">Update your personal information and contact details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed. Contact your administrator.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profileForm.department}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Department is managed by your administrator.</p>
                </div>

                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profileForm.position}
                    onChange={(e) => setProfileForm({...profileForm, position: e.target.value})}
                    placeholder="Enter your position/title"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Settings</h2>
              <p className="text-gray-600 mb-6">Manage how and when you receive notifications.</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationForm.emailNotifications}
                      onCheckedChange={(checked) => setNotificationForm({...notificationForm, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Assignment Reminders</p>
                      <p className="text-sm text-gray-600">Get reminded about pending assignments</p>
                    </div>
                    <Switch
                      checked={notificationForm.assignmentReminders}
                      onCheckedChange={(checked) => setNotificationForm({...notificationForm, assignmentReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Document Updates</p>
                      <p className="text-sm text-gray-600">Notifications when documents are updated</p>
                    </div>
                    <Switch
                      checked={notificationForm.documentUpdates}
                      onCheckedChange={(checked) => setNotificationForm({...notificationForm, documentUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-gray-600">Weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={notificationForm.weeklyDigest}
                      onCheckedChange={(checked) => setNotificationForm({...notificationForm, weeklyDigest: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Overdue Reminders</p>
                      <p className="text-sm text-gray-600">Urgent notifications for overdue items</p>
                    </div>
                    <Switch
                      checked={notificationForm.overdueReminders}
                      onCheckedChange={(checked) => setNotificationForm({...notificationForm, overdueReminders: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Push Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Browser Notifications</p>
                      <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notificationForm.pushNotifications}
                      onCheckedChange={(checked) => setNotificationForm({...notificationForm, pushNotifications: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">General Preferences</h2>
              <p className="text-gray-600 mb-6">Customize your experience and regional settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferencesForm.language}
                    onValueChange={(value) => setPreferencesForm({...preferencesForm, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferencesForm.timezone}
                    onValueChange={(value) => setPreferencesForm({...preferencesForm, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (EST/EDT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CST/CDT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MST/MDT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PST/PDT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin (CET/CEST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={preferencesForm.dateFormat}
                    onValueChange={(value) => setPreferencesForm({...preferencesForm, dateFormat: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferencesForm.theme}
                    onValueChange={(value) => setPreferencesForm({...preferencesForm, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Change Password</h2>
              <p className="text-gray-600 mb-6">Update your account password for security.</p>
            </div>

            <div className="max-w-md space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Settings Navigation Sidebar */}
      <div className="fixed left-0 top-0 h-full bg-white border-r border-purple-200 z-50 transition-all duration-200 shadow-lg w-64">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Settings</span>
                  <div className="text-xs text-purple-600 font-medium">Employee Portal</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="p-1.5 hover:bg-purple-100 text-purple-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Navigation */}
          <div className="flex-1 p-4 space-y-1">
            {settingsSections.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              
              return (
                <Button
                  key={item.key}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => setActiveSection(item.key as SettingsSection)}
                  className={`w-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md hover:from-purple-700 hover:to-violet-700' 
                      : 'text-gray-700 hover:bg-purple-100 hover:text-gray-900'
                  } justify-start px-3 h-10`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 mr-2" />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-medium">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {currentUser?.firstName} {currentUser?.lastName}
                </p>
                <p className="text-sm text-gray-600 truncate">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Success/Error Messages */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Settings saved successfully!
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderSectionContent()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={() => onNavigate('dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 