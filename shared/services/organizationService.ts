import { supabase } from './supabase';
import { DatabaseTeam, DatabaseSopCategory, DatabaseUser } from '../types/database';

export interface OrganizationData {
  departments: string[];
  teams: DatabaseTeam[];
  categories: DatabaseSopCategory[];
  users: DatabaseUser[];
}

export class OrganizationService {
  /**
   * Get all departments for the current company (distinct from users)
   */
  static async getDepartments(): Promise<string[]> {
    try {
      const { data: departments, error } = await supabase
        .from('users')
        .select('department')
        .not('department', 'is', null)
        .not('department', 'eq', '');

      if (error) throw error;

      // Get unique departments
      const uniqueDepartments = [...new Set(departments?.map(d => d.department).filter(Boolean))];
      return uniqueDepartments.sort();
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  /**
   * Get all teams for the current company
   */
  static async getTeams(): Promise<DatabaseTeam[]> {
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;

      return teams || [];
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  /**
   * Get all categories for the current company
   */
  static async getCategories(): Promise<DatabaseSopCategory[]> {
    try {
      const { data: categories, error } = await supabase
        .from('sop_categories')
        .select('*')
        .order('sort_order, name');

      if (error) throw error;

      return categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get all users for the current company (for collaborators)
   */
  static async getCompanyUsers(): Promise<DatabaseUser[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
        .order('first_name, last_name');

      if (error) throw error;

      return users || [];
    } catch (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
  }

  /**
   * Get all organizational data in one call
   */
  static async getOrganizationData(): Promise<OrganizationData> {
    try {
      const [departments, teams, categories, users] = await Promise.all([
        this.getDepartments(),
        this.getTeams(),
        this.getCategories(),
        this.getCompanyUsers()
      ]);

      return {
        departments,
        teams,
        categories,
        users
      };
    } catch (error) {
      console.error('Error fetching organization data:', error);
      throw error;
    }
  }

  /**
   * Get users by department
   */
  static async getUsersByDepartment(department: string): Promise<DatabaseUser[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('department', department)
        .eq('status', 'active')
        .order('first_name, last_name');

      if (error) throw error;

      return users || [];
    } catch (error) {
      console.error('Error fetching users by department:', error);
      throw error;
    }
  }

  /**
   * Get team members for a specific team
   */
  static async getTeamMembers(teamId: string): Promise<DatabaseUser[]> {
    try {
      const { data: teamMembers, error } = await supabase
        .from('team_members')
        .select(`
          users!inner (
            id,
            first_name,
            last_name,
            email,
            department,
            position,
            avatar_url,
            status
          )
        `)
        .eq('team_id', teamId);

      if (error) throw error;

      return teamMembers?.map((tm: any) => tm.users).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }
} 