import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  settingsService, 
  CompanySettings, 
  UserPreferences, 
  CustomField, 
  APIToken, 
  BillingInfo 
} from '../services/settingsService';
import { User } from '../types';

export interface SettingsState {
  // Data
  companySettings: CompanySettings | null;
  userPreferences: UserPreferences | null;
  companyUsers: User[];
  customFields: CustomField[];
  apiTokens: APIToken[];
  billingInfo: BillingInfo | null;
  auditLogs: any[];
  
  // Loading states
  loading: boolean;
  loadingCompanySettings: boolean;
  loadingUserPreferences: boolean;
  loadingUsers: boolean;
  loadingCustomFields: boolean;
  loadingApiTokens: boolean;
  loadingBillingInfo: boolean;
  loadingAuditLogs: boolean;
  
  // Error states
  error: string | null;
  settingsError: string | null;
  preferencesError: string | null;
  usersError: string | null;
  customFieldsError: string | null;
  apiTokensError: string | null;
  billingError: string | null;
  auditLogsError: string | null;
  
  // Success states
  saveSuccess: boolean;
  updateSuccess: boolean;
}

export interface SettingsActions {
  // Company Settings
  loadCompanySettings: () => Promise<void>;
  updateCompanySettings: (updates: Partial<CompanySettings>) => Promise<void>;
  
  // User Preferences
  loadUserPreferences: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Users Management
  loadCompanyUsers: () => Promise<void>;
  createUser: (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'auditor';
    department?: string;
    position?: string;
    phone?: string;
  }) => Promise<User>;
  updateUser: (userId: string, updates: Partial<{
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'auditor';
    department: string;
    position: string;
    phone: string;
    status: 'active' | 'inactive' | 'pending';
  }>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Custom Fields
  loadCustomFields: () => Promise<void>;
  updateCustomFields: (customFields: CustomField[]) => Promise<void>;
  addCustomField: (field: Omit<CustomField, 'id'>) => Promise<void>;
  removeCustomField: (fieldId: string) => Promise<void>;
  
  // API Tokens
  loadAPITokens: () => Promise<void>;
  createAPIToken: (tokenData: { name: string; permissions?: string[] }) => Promise<APIToken>;
  deleteAPIToken: (tokenId: string) => Promise<void>;
  
  // Billing
  loadBillingInfo: () => Promise<void>;
  
  // Audit Logs
  loadAuditLogs: (options?: {
    page?: number;
    limit?: number;
    action?: string;
    resourceType?: string;
    userId?: string;
  }) => Promise<void>;
  
  // Utility functions
  clearErrors: () => void;
  clearSuccess: () => void;
  refresh: () => Promise<void>;
}

export function useSettings(): SettingsState & SettingsActions {

  const { currentUser, isLoading: authLoading, isAuthenticated } = useAuth();
  const user = currentUser;
  const companyId = user?.company?.id;
  
  // State management
  const [state, setState] = useState<SettingsState>({
    // Data
    companySettings: null,
    userPreferences: null,
    companyUsers: [],
    customFields: [],
    apiTokens: [],
    billingInfo: null,
    auditLogs: [],
    
    // Loading states
    loading: false,
    loadingCompanySettings: false,
    loadingUserPreferences: false,
    loadingUsers: false,
    loadingCustomFields: false,
    loadingApiTokens: false,
    loadingBillingInfo: false,
    loadingAuditLogs: false,
    
    // Error states
    error: null,
    settingsError: null,
    preferencesError: null,
    usersError: null,
    customFieldsError: null,
    apiTokensError: null,
    billingError: null,
    auditLogsError: null,
    
    // Success states
    saveSuccess: false,
    updateSuccess: false
  });

  // Company Settings Actions
  const loadCompanySettings = useCallback(async () => {
    
    if (!companyId) {
      return;
    }
    
    setState(prev => ({ ...prev, loadingCompanySettings: true, settingsError: null }));
    
    try {
      const settings = await settingsService.getCompanySettings(companyId);
      
      setState(prev => ({ 
        ...prev, 
        companySettings: settings, 
        loadingCompanySettings: false 
      }));
    } catch (error) {
      console.error('Error loading company settings:', error);
      setState(prev => ({ 
        ...prev, 
        settingsError: error instanceof Error ? error.message : 'Failed to load company settings',
        loadingCompanySettings: false 
      }));
    }
  }, [companyId]);

  const updateCompanySettings = useCallback(async (updates: Partial<CompanySettings>) => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingCompanySettings: true, settingsError: null }));
    
    try {
      const updatedSettings = await settingsService.updateCompanySettings(companyId, updates);
      setState(prev => ({ 
        ...prev, 
        companySettings: updatedSettings,
        loadingCompanySettings: false,
        saveSuccess: true
      }));
    } catch (error) {
      console.error('Error updating company settings:', error);
      setState(prev => ({ 
        ...prev, 
        settingsError: error instanceof Error ? error.message : 'Failed to update company settings',
        loadingCompanySettings: false 
      }));
    }
  }, [companyId]);

  // User Preferences Actions
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    setState(prev => ({ ...prev, loadingUserPreferences: true, preferencesError: null }));
    
    try {
      const preferences = await settingsService.getUserPreferences(user.id);
      setState(prev => ({ 
        ...prev, 
        userPreferences: preferences, 
        loadingUserPreferences: false 
      }));
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setState(prev => ({ 
        ...prev, 
        preferencesError: error instanceof Error ? error.message : 'Failed to load user preferences',
        loadingUserPreferences: false 
      }));
    }
  }, [user?.id]);

  const updateUserPreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!user?.id) return;
    
    setState(prev => ({ ...prev, loadingUserPreferences: true, preferencesError: null }));
    
    try {
      const updatedPreferences = await settingsService.updateUserPreferences(user.id, preferences);
      setState(prev => ({ 
        ...prev, 
        userPreferences: updatedPreferences,
        loadingUserPreferences: false,
        updateSuccess: true
      }));
    } catch (error) {
      console.error('Error updating user preferences:', error);
      setState(prev => ({ 
        ...prev, 
        preferencesError: error instanceof Error ? error.message : 'Failed to update user preferences',
        loadingUserPreferences: false 
      }));
    }
  }, [user?.id]);

  // Users Management Actions
  const loadCompanyUsers = useCallback(async () => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingUsers: true, usersError: null }));
    
    try {
      const users = await settingsService.getCompanyUsers(companyId);
      setState(prev => ({ 
        ...prev, 
        companyUsers: users, 
        loadingUsers: false 
      }));
    } catch (error) {
      console.error('Error loading company users:', error);
      setState(prev => ({ 
        ...prev, 
        usersError: error instanceof Error ? error.message : 'Failed to load company users',
        loadingUsers: false 
      }));
    }
  }, [companyId]);

  const createUser = useCallback(async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'auditor';
    department?: string;
    position?: string;
    phone?: string;
  }) => {
    if (!companyId) throw new Error('Company ID is required');
    
    setState(prev => ({ ...prev, loadingUsers: true, usersError: null }));
    
    try {
      const newUser = await settingsService.createUser(companyId, userData);
      setState(prev => ({ 
        ...prev, 
        companyUsers: [...prev.companyUsers, newUser],
        loadingUsers: false,
        updateSuccess: true
      }));
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      setState(prev => ({ 
        ...prev, 
        usersError: error instanceof Error ? error.message : 'Failed to create user',
        loadingUsers: false 
      }));
      throw error;
    }
  }, [companyId]);

  const updateUser = useCallback(async (userId: string, updates: Partial<{
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'auditor';
    department: string;
    position: string;
    phone: string;
    status: 'active' | 'inactive' | 'pending';
  }>) => {
    setState(prev => ({ ...prev, loadingUsers: true, usersError: null }));
    
    try {
      const updatedUser = await settingsService.updateUser(userId, updates);
      setState(prev => ({ 
        ...prev, 
        companyUsers: prev.companyUsers.map(user => 
          user.id === userId ? updatedUser : user
        ),
        loadingUsers: false,
        updateSuccess: true
      }));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      setState(prev => ({ 
        ...prev, 
        usersError: error instanceof Error ? error.message : 'Failed to update user',
        loadingUsers: false 
      }));
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, loadingUsers: true, usersError: null }));
    
    try {
      await settingsService.deleteUser(userId);
      setState(prev => ({ 
        ...prev, 
        companyUsers: prev.companyUsers.filter(user => user.id !== userId),
        loadingUsers: false,
        updateSuccess: true
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      setState(prev => ({ 
        ...prev, 
        usersError: error instanceof Error ? error.message : 'Failed to delete user',
        loadingUsers: false 
      }));
      throw error;
    }
  }, []);

  // Custom Fields Actions
  const loadCustomFields = useCallback(async () => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingCustomFields: true, customFieldsError: null }));
    
    try {
      const fields = await settingsService.getCustomFields(companyId);
      setState(prev => ({ 
        ...prev, 
        customFields: fields, 
        loadingCustomFields: false 
      }));
    } catch (error) {
      console.error('Error loading custom fields:', error);
      setState(prev => ({ 
        ...prev, 
        customFieldsError: error instanceof Error ? error.message : 'Failed to load custom fields',
        loadingCustomFields: false 
      }));
    }
  }, [companyId]);

  const updateCustomFields = useCallback(async (customFields: CustomField[]) => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingCustomFields: true, customFieldsError: null }));
    
    try {
      const updatedFields = await settingsService.updateCustomFields(companyId, customFields);
      setState(prev => ({ 
        ...prev, 
        customFields: updatedFields,
        loadingCustomFields: false,
        updateSuccess: true
      }));
    } catch (error) {
      console.error('Error updating custom fields:', error);
      setState(prev => ({ 
        ...prev, 
        customFieldsError: error instanceof Error ? error.message : 'Failed to update custom fields',
        loadingCustomFields: false 
      }));
    }
  }, [companyId]);

  const addCustomField = useCallback(async (field: Omit<CustomField, 'id'>) => {
    const newField: CustomField = {
      ...field,
      id: Date.now().toString()
    };
    
    const updatedFields = [...state.customFields, newField];
    await updateCustomFields(updatedFields);
  }, [state.customFields, updateCustomFields]);

  const removeCustomField = useCallback(async (fieldId: string) => {
    const updatedFields = state.customFields.filter(field => field.id !== fieldId);
    await updateCustomFields(updatedFields);
  }, [state.customFields, updateCustomFields]);

  // API Tokens Actions
  const loadAPITokens = useCallback(async () => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingApiTokens: true, apiTokensError: null }));
    
    try {
      const tokens = await settingsService.getAPITokens(companyId);
      setState(prev => ({ 
        ...prev, 
        apiTokens: tokens, 
        loadingApiTokens: false 
      }));
    } catch (error) {
      console.error('Error loading API tokens:', error);
      setState(prev => ({ 
        ...prev, 
        apiTokensError: error instanceof Error ? error.message : 'Failed to load API tokens',
        loadingApiTokens: false 
      }));
    }
  }, [companyId]);

  const createAPIToken = useCallback(async (tokenData: { name: string; permissions?: string[] }) => {
    if (!companyId) throw new Error('Company ID is required');
    
    setState(prev => ({ ...prev, loadingApiTokens: true, apiTokensError: null }));
    
    try {
      const newToken = await settingsService.createAPIToken(companyId, tokenData);
      setState(prev => ({ 
        ...prev, 
        apiTokens: [...prev.apiTokens, newToken],
        loadingApiTokens: false,
        updateSuccess: true
      }));
      return newToken;
    } catch (error) {
      console.error('Error creating API token:', error);
      setState(prev => ({ 
        ...prev, 
        apiTokensError: error instanceof Error ? error.message : 'Failed to create API token',
        loadingApiTokens: false 
      }));
      throw error;
    }
  }, [companyId]);

  const deleteAPIToken = useCallback(async (tokenId: string) => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingApiTokens: true, apiTokensError: null }));
    
    try {
      await settingsService.deleteAPIToken(companyId, tokenId);
      setState(prev => ({ 
        ...prev, 
        apiTokens: prev.apiTokens.filter(token => token.id !== tokenId),
        loadingApiTokens: false,
        updateSuccess: true
      }));
    } catch (error) {
      console.error('Error deleting API token:', error);
      setState(prev => ({ 
        ...prev, 
        apiTokensError: error instanceof Error ? error.message : 'Failed to delete API token',
        loadingApiTokens: false 
      }));
    }
  }, [companyId]);

  // Billing Actions
  const loadBillingInfo = useCallback(async () => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingBillingInfo: true, billingError: null }));
    
    try {
      const billing = await settingsService.getBillingInfo(companyId);
      setState(prev => ({ 
        ...prev, 
        billingInfo: billing, 
        loadingBillingInfo: false 
      }));
    } catch (error) {
      console.error('Error loading billing info:', error);
      setState(prev => ({ 
        ...prev, 
        billingError: error instanceof Error ? error.message : 'Failed to load billing information',
        loadingBillingInfo: false 
      }));
    }
  }, [companyId]);

  // Audit Logs Actions
  const loadAuditLogs = useCallback(async (options: {
    page?: number;
    limit?: number;
    action?: string;
    resourceType?: string;
    userId?: string;
  } = {}) => {
    if (!companyId) return;
    
    setState(prev => ({ ...prev, loadingAuditLogs: true, auditLogsError: null }));
    
    try {
      const logs = await settingsService.getAuditLogs(companyId, options);
      setState(prev => ({ 
        ...prev, 
        auditLogs: logs, 
        loadingAuditLogs: false 
      }));
    } catch (error) {
      console.error('Error loading audit logs:', error);
      setState(prev => ({ 
        ...prev, 
        auditLogsError: error instanceof Error ? error.message : 'Failed to load audit logs',
        loadingAuditLogs: false 
      }));
    }
  }, [companyId]);

  // Utility Actions
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      settingsError: null,
      preferencesError: null,
      usersError: null,
      customFieldsError: null,
      apiTokensError: null,
      billingError: null,
      auditLogsError: null,
    }));
  }, []);

  const clearSuccess = useCallback(() => {
    setState(prev => ({
      ...prev,
      saveSuccess: false,
      updateSuccess: false,
    }));
  }, []);

  const refresh = useCallback(async () => {
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const promises = [];
      
      if (companyId) {
        promises.push(
          loadCompanySettings(),
          loadCompanyUsers(),
          loadCustomFields(),
          loadAPITokens(),
          loadBillingInfo(),
          loadAuditLogs()
        );
      } else {
      }
      
      if (user?.id) {
        promises.push(loadUserPreferences());
      } else {
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
      } else {
      }
    } catch (error) {
      console.error('Error refreshing settings:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to refresh settings data' 
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [
    companyId,
    user?.id,
    loadCompanySettings,
    loadUserPreferences,
    loadCompanyUsers,
    loadCustomFields,
    loadAPITokens,
    loadBillingInfo,
    loadAuditLogs
  ]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    if (state.saveSuccess || state.updateSuccess) {
      const timer = setTimeout(() => {
        clearSuccess();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.saveSuccess, state.updateSuccess, clearSuccess]);

  // Initial load
  useEffect(() => {
    
    if (companyId && user?.id) {
      refresh();
    } else {
    }
  }, [companyId, user?.id, refresh]);

  return {
    ...state,
    loadCompanySettings,
    updateCompanySettings,
    loadUserPreferences,
    updateUserPreferences,
    loadCompanyUsers,
    createUser,
    updateUser,
    deleteUser,
    loadCustomFields,
    updateCustomFields,
    addCustomField,
    removeCustomField,
    loadAPITokens,
    createAPIToken,
    deleteAPIToken,
    loadBillingInfo,
    loadAuditLogs,
    clearErrors,
    clearSuccess,
    refresh,
  };
} 