import { supabase } from './supabase';
import { User } from '../types';

export class UserService {
  // Get all users
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            industry,
            logo_url,
            subscription_plan
          )
        `)
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (error) throw error;

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
        preferences: user.preferences || {},
        lastLogin: user.last_login,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        company: user.companies ? {
          id: user.companies.id,
          name: user.companies.name,
          domain: user.companies.domain,
          industry: user.companies.industry,
          size: null, // Will be filled if needed
          logoUrl: user.companies.logo_url,
          subscriptionPlan: user.companies.subscription_plan,
          subscriptionStatus: 'active', // Default
          settings: {},
          createdAt: '',
          updatedAt: ''
        } : null,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUser(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            industry,
            logo_url,
            subscription_plan
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

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
        preferences: data.preferences || {},
        lastLogin: data.last_login,
        emailVerified: data.email_verified,
        twoFactorEnabled: data.two_factor_enabled,
        company: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          domain: data.companies.domain,
          industry: data.companies.industry,
          size: null,
          logoUrl: data.companies.logo_url,
          subscriptionPlan: data.companies.subscription_plan,
          subscriptionStatus: 'active',
          settings: {},
          createdAt: '',
          updatedAt: ''
        } : null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            industry,
            logo_url,
            subscription_plan
          )
        `)
        .eq('email', email)
        .single();

      if (error) throw error;
      if (!data) return null;

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
        preferences: data.preferences || {},
        lastLogin: data.last_login,
        emailVerified: data.email_verified,
        twoFactorEnabled: data.two_factor_enabled,
        company: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          domain: data.companies.domain,
          industry: data.companies.industry,
          size: null,
          logoUrl: data.companies.logo_url,
          subscriptionPlan: data.companies.subscription_plan,
          subscriptionStatus: 'active',
          settings: {},
          createdAt: '',
          updatedAt: ''
        } : null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          department: userData.department,
          position: userData.position,
          phone: userData.phone,
          avatar_url: userData.avatarUrl,
          status: userData.status,
          preferences: userData.preferences,
          email_verified: userData.emailVerified,
          two_factor_enabled: userData.twoFactorEnabled
        })
        .select()
        .single();

      if (error) throw error;

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
        preferences: data.preferences || {},
        lastLogin: data.last_login,
        emailVerified: data.email_verified,
        twoFactorEnabled: data.two_factor_enabled,
        company: null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const updateData: any = {};
      
      if (updates.email) updateData.email = updates.email;
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.role) updateData.role = updates.role;
      if (updates.department !== undefined) updateData.department = updates.department;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
      if (updates.status) updateData.status = updates.status;
      if (updates.preferences) updateData.preferences = updates.preferences;
      if (updates.emailVerified !== undefined) updateData.email_verified = updates.emailVerified;
      if (updates.twoFactorEnabled !== undefined) updateData.two_factor_enabled = updates.twoFactorEnabled;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            industry,
            logo_url,
            subscription_plan
          )
        `)
        .single();

      if (error) throw error;
      if (!data) return null;

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
        preferences: data.preferences || {},
        lastLogin: data.last_login,
        emailVerified: data.email_verified,
        twoFactorEnabled: data.two_factor_enabled,
        company: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          domain: data.companies.domain,
          industry: data.companies.industry,
          size: null,
          logoUrl: data.companies.logo_url,
          subscriptionPlan: data.companies.subscription_plan,
          subscriptionStatus: 'active',
          settings: {},
          createdAt: '',
          updatedAt: ''
        } : null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role: User['role']): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            industry,
            logo_url,
            subscription_plan
          )
        `)
        .eq('role', role)
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (error) throw error;

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
        preferences: user.preferences || {},
        lastLogin: user.last_login,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        company: user.companies ? {
          id: user.companies.id,
          name: user.companies.name,
          domain: user.companies.domain,
          industry: user.companies.industry,
          size: null,
          logoUrl: user.companies.logo_url,
          subscriptionPlan: user.companies.subscription_plan,
          subscriptionStatus: 'active',
          settings: {},
          createdAt: '',
          updatedAt: ''
        } : null,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  // Get users by department
  static async getUsersByDepartment(department: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          companies (
            id,
            name,
            domain,
            industry,
            logo_url,
            subscription_plan
          )
        `)
        .eq('department', department)
        .eq('status', 'active')
        .order('first_name', { ascending: true });

      if (error) throw error;

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
        preferences: user.preferences || {},
        lastLogin: user.last_login,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        company: user.companies ? {
          id: user.companies.id,
          name: user.companies.name,
          domain: user.companies.domain,
          industry: user.companies.industry,
          size: null,
          logoUrl: user.companies.logo_url,
          subscriptionPlan: user.companies.subscription_plan,
          subscriptionStatus: 'active',
          settings: {},
          createdAt: '',
          updatedAt: ''
        } : null,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }));
    } catch (error) {
      console.error('Error fetching users by department:', error);
      throw error;
    }
  }
}