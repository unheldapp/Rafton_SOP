import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Switch } from "../../../shared/components/ui/switch";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Badge } from "../../../shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { RadioGroup, RadioGroupItem } from "../../../shared/components/ui/radio-group";
import { Separator } from "../../../shared/components/ui/separator";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { 
  Building2,
  Users,
  CheckSquare,
  FileText,
  Shield,
  Bell,
  Plug,
  Lock,
  CreditCard,
  Tags,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  Download,
  Link,
  Mail,
  Sliders,
  User,
  Save,
  X,
  ArrowLeft,
  LogOut,
  ChevronDown,
  Menu,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { useSettings } from '../../../shared/hooks/useSettings';
import { useAuth } from '../../../shared/context/AuthContext';

type SettingsSection = 
  | 'organization'
  | 'users-roles'
  | 'acknowledgment'
  | 'sop-policy'
  | 'audit-compliance'
  | 'notifications'
  | 'integrations'
  | 'security'
  | 'billing'
  | 'custom-fields';

interface SettingsProps {
  onNavigate: (page: any) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  const { currentUser, isLoading, isAuthenticated } = useAuth();
  const settings = useSettings();
  const [activeSection, setActiveSection] = useState<SettingsSection>('organization');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Show loading screen if auth is still loading, user is not authenticated, or user data is not available
  if (isLoading || !isAuthenticated || !currentUser || !currentUser.company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Local state for organization form
  const [organizationForm, setOrganizationForm] = useState({
    name: '',
    industry: '',
    size: '',
    domain: '',
    primaryEmail: '',
    address: '',
    country: '',
    timezone: '',
    dateFormat: '',
    fiscalYearStart: '',
    notificationPreferences: {
      email: true,
      in_app: true
    }
  });

  // Local state for acknowledgment settings form
  const [acknowledgmentForm, setAcknowledgmentForm] = useState({
    defaultDuration: 7,
    reminderFrequency: 'daily',
    mandatoryForCritical: true,
    autoExpireUnacknowledged: false,
    allowExtensions: true,
    escalationEnabled: false,
    escalationDays: 3
  });

  // Local state for custom fields
  const [newCustomField, setNewCustomField] = useState({
    name: '',
    type: 'text',
    required: false,
    options: []
  });

  // Load data into form when settings are loaded
  useEffect(() => {
    if (settings.companySettings) {
      console.log('Loading company settings into form:', settings.companySettings);
      
      const company = settings.companySettings;
      const companySettings = company.settings as any; // Use any to access additional fields
      
      setOrganizationForm({
        name: company.name || '',
        industry: company.industry || '',
        size: company.size || '',
        domain: company.domain || '',
        primaryEmail: companySettings?.primaryEmail || '',
        address: companySettings?.address || '',
        country: companySettings?.country || '',
        timezone: companySettings?.timezone || 'UTC',
        dateFormat: companySettings?.dateFormat || 'MM/dd/yyyy',
        fiscalYearStart: companySettings?.fiscalYearStart || 'January',
        notificationPreferences: companySettings?.notification_preferences || { email: true, in_app: true }
      });

      // Note: Acknowledgment settings will use default values for now
      // They can be loaded from database once the schema is extended
    }
  }, [settings.companySettings]);

  const settingsSections = [
    { key: 'organization', label: 'Organization', icon: Building2 },
    { key: 'users-roles', label: 'Users & Roles', icon: Users },
    { key: 'acknowledgment', label: 'Acknowledgment Settings', icon: CheckSquare },
    { key: 'sop-policy', label: 'SOP/Policy Settings', icon: FileText },
    { key: 'audit-compliance', label: 'Audit & Compliance', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'integrations', label: 'Integrations', icon: Plug },
    { key: 'security', label: 'Security & Access', icon: Lock },
    { key: 'billing', label: 'Billing', icon: CreditCard },
    { key: 'custom-fields', label: 'Custom Fields & Tags', icon: Tags }
  ];

  const handleSaveChanges = async () => {
    if (!settings.companySettings) return;

    console.log('Saving organization settings:', organizationForm);

    try {
      let updateData: any = {};

      if (activeSection === 'organization') {
        updateData = {
          name: organizationForm.name,
          industry: organizationForm.industry,
          size: organizationForm.size,
          domain: organizationForm.domain,
          settings: {
            primaryEmail: organizationForm.primaryEmail,
            address: organizationForm.address,
            country: organizationForm.country,
            timezone: organizationForm.timezone,
            dateFormat: organizationForm.dateFormat,
            fiscalYearStart: organizationForm.fiscalYearStart,
            notification_preferences: organizationForm.notificationPreferences
          }
        };
      }

      console.log('Updating company settings with data:', updateData);
      await settings.updateCompanySettings(updateData);
      setHasUnsavedChanges(false);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleDiscardChanges = () => {
    console.log('Discarding changes');
    // Reset form to original values
    if (settings.companySettings) {
      const company = settings.companySettings;
      const companySettings = company.settings as any; // Use any to access additional fields
      setOrganizationForm({
        name: company.name || '',
        industry: company.industry || '',
        size: company.size || '',
        domain: company.domain || '',
        primaryEmail: companySettings?.primaryEmail || '',
        address: companySettings?.address || '',
        country: companySettings?.country || '',
        timezone: companySettings?.timezone || 'America/New_York',
        dateFormat: companySettings?.dateFormat || 'MM/DD/YYYY',
        fiscalYearStart: companySettings?.fiscalYearStart || 'January',
        notificationPreferences: companySettings?.notification_preferences || { email: true, in_app: true }
      });
    }
    setHasUnsavedChanges(false);
  };

  const handleRefreshSettings = async () => {
    console.log('Refreshing settings...');
    await settings.refresh();
  };

  // Custom field management functions
  const addCustomField = () => {
    if (newCustomField.name.trim()) {
      settings.addCustomField(newCustomField);
      setNewCustomField({
        name: '',
        type: 'text',
        required: false,
        options: []
      });
    }
  };

  const renderSectionContent = () => {
    if (settings.loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }

    switch (activeSection) {
      case 'organization':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Organization Settings</h2>
                <p className="text-gray-600 mb-6">Configure your organization's basic information and preferences.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshSettings}
                disabled={settings.loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${settings.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {settings.settingsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{settings.settingsError}</AlertDescription>
              </Alert>
            )}

            {settings.saveSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
              </Alert>
            )}

            {!settings.companySettings && !settings.loading && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  No company settings found. Please check your company setup.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={organizationForm.name}
                    onChange={(e) => {
                      setOrganizationForm({...organizationForm, name: e.target.value});
                      setHasUnsavedChanges(true);
                    }}
                    disabled={settings.loadingCompanySettings}
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={organizationForm.industry}
                    onValueChange={(value) => {
                      setOrganizationForm({...organizationForm, industry: value});
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size">Organization Size</Label>
                  <Select
                    value={organizationForm.size}
                    onValueChange={(value) => {
                      setOrganizationForm({...organizationForm, size: value});
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-50 employees)</SelectItem>
                      <SelectItem value="medium">Medium (51-250 employees)</SelectItem>
                      <SelectItem value="large">Large (251-1000 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="primary-email">Primary Contact Email</Label>
                  <Input
                    id="primary-email"
                    type="email"
                    value={organizationForm.primaryEmail}
                    onChange={(e) => {
                      setOrganizationForm({...organizationForm, primaryEmail: e.target.value});
                      setHasUnsavedChanges(true);
                    }}
                    disabled={settings.loadingCompanySettings}
                    placeholder="admin@yourcompany.com"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={organizationForm.timezone}
                    onValueChange={(value) => {
                      setOrganizationForm({...organizationForm, timezone: value});
                      setHasUnsavedChanges(true);
                    }}
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

                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select
                    value={organizationForm.dateFormat}
                    onValueChange={(value) => {
                      setOrganizationForm({...organizationForm, dateFormat: value});
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (UK)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (German)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={organizationForm.domain}
                    onChange={(e) => {
                      setOrganizationForm({...organizationForm, domain: e.target.value});
                      setHasUnsavedChanges(true);
                    }}
                    disabled={settings.loadingCompanySettings}
                    placeholder="yourcompany.com"
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Organization Logo</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {settings.companySettings?.logo_url ? (
                        <img 
                          src={settings.companySettings.logo_url} 
                          alt="Logo" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <span className="text-sm text-gray-500">(Coming soon)</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    rows={4}
                    value={organizationForm.address}
                    onChange={(e) => {
                      setOrganizationForm({...organizationForm, address: e.target.value});
                      setHasUnsavedChanges(true);
                    }}
                    disabled={settings.loadingCompanySettings}
                    placeholder="123 Business Street&#10;Suite 100&#10;City, State 12345"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={organizationForm.country}
                    onValueChange={(value) => {
                      setOrganizationForm({...organizationForm, country: value});
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                  <Select
                    value={organizationForm.fiscalYearStart}
                    onValueChange={(value) => {
                      setOrganizationForm({...organizationForm, fiscalYearStart: value});
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="January">January</SelectItem>
                      <SelectItem value="February">February</SelectItem>
                      <SelectItem value="March">March</SelectItem>
                      <SelectItem value="April">April</SelectItem>
                      <SelectItem value="May">May</SelectItem>
                      <SelectItem value="June">June</SelectItem>
                      <SelectItem value="July">July</SelectItem>
                      <SelectItem value="August">August</SelectItem>
                      <SelectItem value="September">September</SelectItem>
                      <SelectItem value="October">October</SelectItem>
                      <SelectItem value="November">November</SelectItem>
                      <SelectItem value="December">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notification-preferences">Notification Preferences</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email-notifications"
                        checked={organizationForm.notificationPreferences.email}
                        onCheckedChange={(checked) => {
                          setOrganizationForm({...organizationForm, notificationPreferences: { ...organizationForm.notificationPreferences, email: checked }});
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <Label htmlFor="email-notifications">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="in-app-notifications"
                        checked={organizationForm.notificationPreferences.in_app}
                        onCheckedChange={(checked) => {
                          setOrganizationForm({...organizationForm, notificationPreferences: { ...organizationForm.notificationPreferences, in_app: checked }});
                          setHasUnsavedChanges(true);
                        }}
                      />
                      <Label htmlFor="in-app-notifications">In-App</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Settings Summary */}
            {settings.companySettings && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Current Settings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Plan:</strong> {settings.companySettings.subscription_plan}
                    </div>
                    <div>
                      <strong>Status:</strong> {settings.companySettings.subscription_status}
                    </div>
                    <div>
                      <strong>Created:</strong> {new Date(settings.companySettings.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Last Updated:</strong> {new Date(settings.companySettings.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'users-roles':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Users & Roles</h2>
              <p className="text-gray-600 mb-6">Manage user accounts, roles, and access permissions.</p>
            </div>

            {settings.usersError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{settings.usersError}</AlertDescription>
              </Alert>
            )}

            {settings.loadingUsers ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <UserManagement 
                users={settings.companyUsers} 
                onCreateUser={settings.createUser}
                onUpdateUser={settings.updateUser}
                onDeleteUser={settings.deleteUser}
                loading={settings.loadingUsers}
              />
            )}
          </div>
        );

      case 'acknowledgment':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acknowledgment Settings</h2>
              <p className="text-gray-600 mb-6">Configure how document acknowledgments are handled.</p>
            </div>

            {settings.settingsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{settings.settingsError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ack-duration">Default Acknowledgment Duration (days)</Label>
                  <Input
                    id="ack-duration"
                    type="number"
                    value={acknowledgmentForm.defaultDuration}
                    onChange={(e) => {
                      setAcknowledgmentForm({...acknowledgmentForm, defaultDuration: parseInt(e.target.value)});
                      setHasUnsavedChanges(true);
                    }}
                    min={1}
                    max={365}
                  />
                </div>

                <div>
                  <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                  <Select
                    value={acknowledgmentForm.reminderFrequency}
                    onValueChange={(value) => {
                      setAcknowledgmentForm({...acknowledgmentForm, reminderFrequency: value});
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every-3-days">Every 3 days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mandatory-critical"
                    checked={acknowledgmentForm.mandatoryForCritical}
                    onCheckedChange={(checked) => {
                      setAcknowledgmentForm({...acknowledgmentForm, mandatoryForCritical: checked});
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="mandatory-critical">Mandatory for Critical Documents</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-expire"
                    checked={acknowledgmentForm.autoExpireUnacknowledged}
                    onCheckedChange={(checked) => {
                      setAcknowledgmentForm({...acknowledgmentForm, autoExpireUnacknowledged: checked});
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <Label htmlFor="auto-expire">Auto-expire Unacknowledged Documents</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing & Subscription</h2>
              <p className="text-gray-600 mb-6">Manage your subscription and billing information.</p>
            </div>

            {settings.billingError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{settings.billingError}</AlertDescription>
              </Alert>
            )}

            {settings.loadingBillingInfo ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : settings.billingInfo ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Plan</div>
                        <div className="text-lg font-semibold">{settings.billingInfo.currentPlan}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Active Users</div>
                        <div className="text-lg font-semibold">{settings.billingInfo.activeUsers}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Storage Used</div>
                        <div className="text-lg font-semibold">{settings.billingInfo.storageUsed} / {settings.billingInfo.storageLimit}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Next Billing Date</div>
                        <div className="text-lg font-semibold">{settings.billingInfo.nextBillingDate}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {settings.billingInfo.billingHistory?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b">
                          <div>
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-gray-600">{item.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${item.amount}</div>
                            <Badge variant={item.status === 'paid' ? 'secondary' : 'destructive'}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No billing information available</p>
              </div>
            )}
          </div>
        );

      case 'custom-fields':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Fields & Tags</h2>
              <p className="text-gray-600 mb-6">Create custom fields for your documents and configure tags.</p>
            </div>

            {settings.customFieldsError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{settings.customFieldsError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custom Fields</h3>
                <Button onClick={addCustomField} disabled={settings.loadingCustomFields}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Field name"
                  value={newCustomField.name}
                  onChange={(e) => setNewCustomField({...newCustomField, name: e.target.value})}
                />
                <Select
                  value={newCustomField.type}
                  onValueChange={(value: 'text' | 'number' | 'select' | 'checkbox' | 'date') => 
                    setNewCustomField({...newCustomField, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="new-field-required"
                    checked={newCustomField.required}
                    onCheckedChange={(checked) => setNewCustomField({...newCustomField, required: checked})}
                  />
                  <Label htmlFor="new-field-required">Required</Label>
                </div>
                <Button onClick={addCustomField} disabled={!newCustomField.name}>
                  Add
                </Button>
              </div>

              {settings.loadingCustomFields ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : settings.customFields.length > 0 ? (
                <div className="space-y-2">
                  {settings.customFields.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="font-medium">{field.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{field.type}</div>
                        </div>
                        {field.required && (
                          <Badge variant="secondary">Required</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No custom fields created yet</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">API Tokens</h3>
                <Button onClick={createAPIToken} disabled={settings.loadingApiTokens}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Token
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Token name"
                  value={newAPIToken.name}
                  onChange={(e) => setNewAPIToken({...newAPIToken, name: e.target.value})}
                />
                <Button onClick={createAPIToken} disabled={!newAPIToken.name}>
                  Generate
                </Button>
              </div>

              {settings.loadingApiTokens ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : settings.apiTokens.length > 0 ? (
                <div className="space-y-2">
                  {settings.apiTokens.map((token) => (
                    <div key={token.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-gray-600 font-mono">{token.token}</div>
                        <div className="text-xs text-gray-500">
                          Created: {token.created} {token.lastUsed && `• Last used: ${token.lastUsed}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAPIToken(token.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No API tokens generated yet</p>
                </div>
              )}
            </div>
          </div>
        );

      // Add other sections as needed
      case 'sop-policy':
      case 'audit-compliance':
      case 'notifications':
      case 'integrations':
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {settingsSections.find(s => s.key === activeSection)?.label}
              </h2>
              <p className="text-gray-600 mb-6">This section is under development.</p>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">Configuration options coming soon...</p>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
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
                <span className="font-semibold text-gray-900">Rafton</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="p-1.5 hover:bg-purple-100 text-purple-600 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
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
          
          {/* User Menu */}
          <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full transition-all duration-200 hover:bg-purple-100 text-gray-700 hover:text-gray-900 justify-start px-3 h-12"
                >
                  <Avatar className="flex-shrink-0 w-7 h-7">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs font-medium">
                      {currentUser ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 text-left flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">{currentUser?.role || 'user'}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48 border-purple-200">
                <div className="px-2 py-1.5 text-sm text-gray-900">
                  <div className="font-medium">{currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'User'}</div>
                  <div className="text-gray-600">{currentUser?.email || 'user@example.com'}</div>
                </div>
                
                <DropdownMenuSeparator className="bg-purple-200" />
                
                <DropdownMenuItem 
                  onClick={() => onNavigate('dashboard')}
                  className="text-gray-700 hover:bg-purple-50 focus:bg-purple-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-purple-200" />
                
                <DropdownMenuItem 
                  onClick={() => console.log('Logout')} 
                  className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {renderSectionContent()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 flex items-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                  Unsaved changes
                </span>
              )}
              {settings.loadingCompanySettings && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <Button variant="outline" onClick={handleDiscardChanges}>
                  Discard Changes
                </Button>
              )}
              <Button 
                onClick={handleSaveChanges} 
                disabled={!hasUnsavedChanges || settings.loadingCompanySettings}
              >
                {settings.loadingCompanySettings ? (
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
    </div>
  );
}