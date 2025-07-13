import { supabase } from './supabase';
import { User } from '../types';

export interface CompanySettings {
  name: string;
  logo_url: string | null;
  industry: string | null;
  size: string | null;
  domain: string | null;
  settings: {
    timezone?: string;
    dateFormat?: string;
    fiscalYearStart?: string;
    primaryEmail?: string;
    address?: string;
    // Organization-specific settings
    defaultRole?: 'admin' | 'employee' | 'auditor';
    passwordMinLength?: number;
    requireSpecialChars?: boolean;
    requireUppercase?: boolean;
    userDeactivationPolicy?: string;
    // Acknowledgment settings
    defaultDuration?: number;
    mandatoryForCritical?: boolean;
    reminderFrequency?: string;
    autoExpireUnacknowledged?: boolean;
    escalationPolicy?: string[];
    // SOP policy settings
    defaultReviewCycle?: string;
    allowedFormats?: string[];
    versioningMethod?: string;
    maxFolderDepth?: number;
    approvalWorkflowType?: string;
    // Audit settings
    complianceStandards?: string[];
    autoTagAudit?: boolean;
    exportFormat?: string;
    dataRetentionMonths?: number;
    // Notification settings
    globalNotifications?: boolean;
    dailyDigest?: boolean;
    reminderTemplate?: string;
    escalationEmails?: string[];
    // Integration settings
    slackConnected?: boolean;
    teamsConnected?: boolean;
    smtpHost?: string;
    smtpPort?: number;
    smtpEmail?: string;
    smtpPassword?: string;
    webhookUrl?: string;
    // Security settings
    enable2FA?: boolean;
    ipWhitelist?: string[];
    sessionTimeout?: string;
    ssoEnabled?: boolean;
    idpUrl?: string;
    metadataFile?: string;
    // Custom fields
    customFields?: CustomField[];
    // API tokens
    apiTokens?: APIToken[];
  };
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly';
  };
  dashboard?: {
    layout?: 'grid' | 'list';
    showWelcome?: boolean;
    defaultView?: string;
  };
  editor?: {
    fontSize?: number;
    lineHeight?: number;
    tabSize?: number;
    wordWrap?: boolean;
  };
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  required: boolean;
  options?: string[];
}

export interface APIToken {
  id: string;
  name: string;
  token: string;
  created: string;
  lastUsed?: string;
  permissions?: string[];
}

export interface BillingInfo {
  currentPlan: string;
  activeUsers: number;
  storageUsed: string;
  storageLimit: string;
  nextBillingDate: string;
  paymentMethod?: string;
  billingHistory?: Array<{
    date: string;
    amount: number;
    description: string;
    status: string;
  }>;
}

class SettingsService {
  // Company Settings
  async getCompanySettings(companyId: string): Promise<CompanySettings> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching company settings:', error);
      throw new Error('Failed to fetch company settings');
    }

    return data;
  }

  async updateCompanySettings(
    companyId: string,
    updates: Partial<CompanySettings>
  ): Promise<CompanySettings> {
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating company settings:', error);
      throw new Error('Failed to update company settings');
    }

    return data;
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferences:', error);
      throw new Error('Failed to fetch user preferences');
    }

    return data.preferences || {};
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const { data: currentData, error: fetchError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching current preferences:', fetchError);
      throw new Error('Failed to fetch current preferences');
    }

    const updatedPreferences = {
      ...currentData.preferences,
      ...preferences
    };

    const { data, error } = await supabase
      .from('users')
      .update({
        preferences: updatedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('preferences')
      .single();

    if (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }

    return data.preferences;
  }

  // Users Management
  async getCompanyUsers(companyId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        department,
        position,
        phone,
        avatar_url,
        status,
        preferences,
        last_login,
        email_verified,
        two_factor_enabled,
        created_at,
        updated_at
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company users:', error);
      throw new Error('Failed to fetch company users');
    }

    return data.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      status: user.status,
      preferences: user.preferences,
      lastLogin: user.last_login,
      emailVerified: user.email_verified,
      twoFactorEnabled: user.two_factor_enabled,
      company: null,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }

  async createUser(
    companyId: string,
    userData: {
      email: string;
      firstName: string;
      lastName: string;
      role: 'admin' | 'employee' | 'auditor';
      department?: string;
      position?: string;
      phone?: string;
    }
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        company_id: companyId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        phone: userData.phone,
        status: 'pending',
        preferences: {},
        email_verified: false,
        two_factor_enabled: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      department: data.department,
      position: data.position,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      status: data.status,
      preferences: data.preferences,
      lastLogin: data.last_login,
      emailVerified: data.email_verified,
      twoFactorEnabled: data.two_factor_enabled,
      company: null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async updateUser(
    userId: string,
    updates: Partial<{
      firstName: string;
      lastName: string;
      role: 'admin' | 'employee' | 'auditor';
      department: string;
      position: string;
      phone: string;
      status: 'active' | 'inactive' | 'pending';
    }>
  ): Promise<User> {
    const dbUpdates: any = {};
    
    if (updates.firstName) dbUpdates.first_name = updates.firstName;
    if (updates.lastName) dbUpdates.last_name = updates.lastName;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.department) dbUpdates.department = updates.department;
    if (updates.position) dbUpdates.position = updates.position;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.status) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('users')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      department: data.department,
      position: data.position,
      phone: data.phone,
      avatarUrl: data.avatar_url,
      status: data.status,
      preferences: data.preferences,
      lastLogin: data.last_login,
      emailVerified: data.email_verified,
      twoFactorEnabled: data.two_factor_enabled,
      company: null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Billing Information
  async getBillingInfo(companyId: string): Promise<BillingInfo> {
    const { data: company, error } = await supabase
      .from('companies')
      .select('subscription_plan, subscription_status, created_at')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching billing info:', error);
      throw new Error('Failed to fetch billing information');
    }

    // Get user count
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .is('deleted_at', null);

    if (userCountError) {
      console.error('Error fetching user count:', userCountError);
    }

    // Mock billing data (in real app, this would come from payment provider)
    return {
      currentPlan: company.subscription_plan,
      activeUsers: userCount || 0,
      storageUsed: '2.3 GB', // This would be calculated from actual usage
      storageLimit: company.subscription_plan === 'enterprise' ? '100 GB' : '10 GB',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentMethod: 'Credit Card ending in 4242',
      billingHistory: [
        {
          date: '2024-12-01',
          amount: 49.99,
          description: 'Monthly subscription',
          status: 'paid'
        },
        {
          date: '2024-11-01',
          amount: 49.99,
          description: 'Monthly subscription',
          status: 'paid'
        }
      ]
    };
  }

  // Custom Fields Management
  async getCustomFields(companyId: string): Promise<CustomField[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching custom fields:', error);
      throw new Error('Failed to fetch custom fields');
    }

    return data.settings?.customFields || [];
  }

  async updateCustomFields(companyId: string, customFields: CustomField[]): Promise<CustomField[]> {
    const { data: currentData, error: fetchError } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', companyId)
      .single();

    if (fetchError) {
      console.error('Error fetching current settings:', fetchError);
      throw new Error('Failed to fetch current settings');
    }

    const updatedSettings = {
      ...currentData.settings,
      customFields
    };

    const { data, error } = await supabase
      .from('companies')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select('settings')
      .single();

    if (error) {
      console.error('Error updating custom fields:', error);
      throw new Error('Failed to update custom fields');
    }

    return data.settings?.customFields || [];
  }

  // API Tokens Management
  async getAPITokens(companyId: string): Promise<APIToken[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', companyId)
      .single();

    if (error) {
      console.error('Error fetching API tokens:', error);
      throw new Error('Failed to fetch API tokens');
    }

    return data.settings?.apiTokens || [];
  }

  async createAPIToken(
    companyId: string,
    tokenData: {
      name: string;
      permissions?: string[];
    }
  ): Promise<APIToken> {
    const { data: currentData, error: fetchError } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', companyId)
      .single();

    if (fetchError) {
      console.error('Error fetching current settings:', fetchError);
      throw new Error('Failed to fetch current settings');
    }

    const newToken: APIToken = {
      id: Date.now().toString(),
      name: tokenData.name,
      token: `rtk_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substr(2, 8)}`,
      created: new Date().toISOString().split('T')[0],
      permissions: tokenData.permissions || []
    };

    const currentTokens = currentData.settings?.apiTokens || [];
    const updatedTokens = [...currentTokens, newToken];

    const updatedSettings = {
      ...currentData.settings,
      apiTokens: updatedTokens
    };

    const { error } = await supabase
      .from('companies')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) {
      console.error('Error creating API token:', error);
      throw new Error('Failed to create API token');
    }

    return newToken;
  }

  async deleteAPIToken(companyId: string, tokenId: string): Promise<void> {
    const { data: currentData, error: fetchError } = await supabase
      .from('companies')
      .select('settings')
      .eq('id', companyId)
      .single();

    if (fetchError) {
      console.error('Error fetching current settings:', fetchError);
      throw new Error('Failed to fetch current settings');
    }

    const currentTokens = currentData.settings?.apiTokens || [];
    const updatedTokens = currentTokens.filter((token: APIToken) => token.id !== tokenId);

    const updatedSettings = {
      ...currentData.settings,
      apiTokens: updatedTokens
    };

    const { error } = await supabase
      .from('companies')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId);

    if (error) {
      console.error('Error deleting API token:', error);
      throw new Error('Failed to delete API token');
    }
  }

  // Audit Logs
  async getAuditLogs(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      action?: string;
      resourceType?: string;
      userId?: string;
    } = {}
  ) {
    const { page = 1, limit = 50, action, resourceType, userId } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        metadata,
        created_at,
        user:users(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (action) {
      query = query.eq('action', action);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error('Failed to fetch audit logs');
    }

    return data;
  }
}

export { SettingsService };
export const settingsService = new SettingsService(); 