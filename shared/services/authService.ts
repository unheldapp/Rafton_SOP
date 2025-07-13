// filename: authService.ts
import { supabase } from './supabase';
import { DatabaseUser, DatabaseCompany, DatabaseUserInsert, DatabaseCompanyInsert } from '../types/database';
import { User, AuthResult, SignupData, OnboardingData } from '../types';
import { debugRLSState, createCompanyWithRetry, logRLSError } from '../utils/rls-debug';

export class AuthService {
  // Get current session
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  // Get current user with company info
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        throw error;
      }
      
      if (!user) {
        return null;
      }

      console.log('Fetching user profile for auth id:', user.id);

      // Get user details from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          company:company_id (
            id,
            name,
            domain,
            industry,
            size,
            logo_url,
            subscription_plan,
            subscription_status,
            settings,
            created_at,
            updated_at
          )
        `)
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('User query error:', userError);
        throw userError;
      }

      if (!userData) {
        console.error('No user profile found for auth user:', user.id);
        return null;
      }

      console.log('User profile found:', userData.id);

      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        department: userData.department,
        position: userData.position,
        phone: userData.phone,
        avatarUrl: userData.avatar_url,
        status: userData.status,
        preferences: userData.preferences,
        lastLogin: userData.last_login,
        emailVerified: userData.email_verified,
        twoFactorEnabled: userData.two_factor_enabled,
        company: userData.company ? {
          id: userData.company.id,
          name: userData.company.name,
          domain: userData.company.domain,
          industry: userData.company.industry,
          size: userData.company.size || null,
          logoUrl: userData.company.logo_url,
          subscriptionPlan: userData.company.subscription_plan || 'free',
          subscriptionStatus: userData.company.subscription_status || 'active',
          settings: userData.company.settings || {},
          createdAt: userData.company.created_at || new Date().toISOString(),
          updatedAt: userData.company.updated_at || new Date().toISOString()
        } : null,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Login with email and password
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Login successful, updating last login');
        // Update last login
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);

        let user = await this.getCurrentUser();

        if (!user) {
          console.log('No user profile found after login, creating one...');
          // Create company and user profile
          const authUser = data.user;
          const companyId = crypto.randomUUID();
          const emailDomain = authUser.email?.split('@')[1];
          const companyName = `${authUser.email.split('@')[0]}'s Company`;

          const companyData: DatabaseCompanyInsert = {
            id: companyId,
            name: companyName,
            domain: emailDomain,
            industry: 'unknown',
            size: null,
            subscription_plan: 'starter',
            subscription_status: 'active',
            settings: {
              timezone: null,
              country: null,
              date_format: 'YYYY-MM-DD',
              notification_preferences: {
                email: true,
                in_app: true
              }
            }
          };

          const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert([companyData])
            .select()
            .single();

          if (companyError) {
            console.error('Company creation error during login:', companyError);
            return { success: false, error: 'Failed to create company profile' };
          }

          const userData: DatabaseUserInsert = {
            id: authUser.id,
            company_id: company.id,
            email: authUser.email!,
            first_name: 'First',
            last_name: 'Last',
            role: 'admin',
            status: 'active',
            email_verified: true,
            two_factor_enabled: false,
            preferences: {
              theme: 'light',
              notifications: {
                email: true,
                in_app: true
              }
            },
            department: null,
            position: null,
            phone: null,
            avatar_url: null,
            last_login: new Date().toISOString()
          };

          const { error: userError } = await supabase
            .from('users')
            .insert([userData]);

          if (userError) {
            console.error('User creation error during login:', userError);
            await supabase.from('companies').delete().eq('id', company.id);
            return { success: false, error: 'Failed to create user profile' };
          }

          user = await this.getCurrentUser();
        }

        return { success: true, user };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Signup with company creation
  static async signup(signupData: SignupData): Promise<AuthResult> {
    try {
      console.log('Starting signup process for:', signupData.workEmail);

      console.log('Creating auth user...');
      console.log('Email being sent to Supabase:', signupData.workEmail);
      console.log('Email length:', signupData.workEmail.length);
      console.log('Email characters:', signupData.workEmail.split('').map(c => c.charCodeAt(0)));

      console.log('Proceeding directly to signup...');

      // Try to login first to see if user already exists
      console.log('Checking if user can login (already exists)...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: signupData.workEmail.trim(),
        password: signupData.password
      });

      if (loginData.user && !loginError) {
        console.log('User already exists and can login');
        return { success: true, requiresVerification: false };
      }

      console.log('User does not exist or cannot login, proceeding with signup...');

      // Create auth user with longer timeout to handle potential delays
      console.log('Creating new auth user...');
      const signupPromise = supabase.auth.signUp({
        email: signupData.workEmail.trim(),
        password: signupData.password,
        options: {
          data: {
            full_name: signupData.fullName || '',
            company_name: signupData.companyName || '',
            org_email_domain: signupData.orgEmailDomain || '',
            industry_type: signupData.industryType || '',
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout - please try again')), 30000); // Increased to 30 seconds
      });

      let data, error;
      try {
        const result = await Promise.race([signupPromise, timeoutPromise]);
        ({ data, error } = result as any);
      } catch (err) {
        console.error('Signup timed out:', err);
        // Workaround: Since auth user might have been created, try to login
        const loginResult = await supabase.auth.signInWithPassword({
          email: signupData.workEmail.trim(),
          password: signupData.password
        });

        if (loginResult.error) {
          console.error('Post-timeout login failed:', loginResult.error);
          return { success: false, error: 'Signup timed out and login failed: ' + loginResult.error.message };
        }

        data = loginResult.data;
        error = null;
        console.log('Post-timeout login succeeded, proceeding...');
      }

      console.log('Signup response received:', { data: !!data, error: error?.message });

      if (error) {
        console.error('Auth user creation error:', error);
        
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          return { success: false, error: 'An account with this email already exists. Please try logging in instead.' };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user ) {
        console.log('Auth user created successfully:', data.user.id);

        // Check if custom user already exists (in case of retry)
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (checkError) {
          console.error('User existence check error:', checkError);
        }

        if (existingUser) {
          console.log('Custom user already exists, skipping creation');
          const user = await this.getCurrentUser();
          return { success: true, requiresVerification: false, user };
        }

        // Proceed to create company and user profile
        const authUser = data.user;
        const userMetadata = authUser.user_metadata || {};
        const fullName = signupData.fullName || userMetadata.full_name || 'User';
        const companyName = signupData.companyName || userMetadata.company_name || `${fullName}'s Company`;
        const orgEmailDomain = signupData.orgEmailDomain || userMetadata.org_email_domain;
        const industryType = signupData.industryType || userMetadata.industry_type || 'unknown';

        console.log('Creating company and user profile...');

        // Create company first
        const companyId = crypto.randomUUID();
        const emailDomain = authUser.email?.split('@')[1];
        
        let companyDomain = null;
        if (orgEmailDomain && orgEmailDomain.trim() && orgEmailDomain !== '@') {
          companyDomain = orgEmailDomain.replace('@', '');
        } else if (emailDomain && !emailDomain.includes('gmail.com') && !emailDomain.includes('yahoo.com') && !emailDomain.includes('outlook.com')) {
          companyDomain = emailDomain;
        }
        
        const companyData: DatabaseCompanyInsert = {
          id: companyId,
          name: companyName,
          domain: companyDomain,
          industry: industryType,
          size: null,
          subscription_plan: 'starter',
          subscription_status: 'active',
          settings: {
            timezone: null,
            country: null,
            date_format: 'YYYY-MM-DD',
            notification_preferences: {
              email: true,
              in_app: true
            }
          }
        };

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();

        if (companyError) {
          console.error('Company creation error:', companyError);
          await supabase.auth.signOut();
          return { success: false, error: 'Failed to create company: ' + companyError.message };
        }

        // Create user profile (omit last_login to avoid potential trigger issues)
        const userData: DatabaseUserInsert = {
          id: authUser.id,
          company_id: company.id,
          email: authUser.email!,
          first_name: fullName.split(' ')[0],
          last_name: fullName.split(' ').slice(1).join(' ') || '',
          role: 'admin',
          status: 'active',
          email_verified: true,
          two_factor_enabled: false,
          preferences: {
            theme: 'light',
            notifications: {
              email: true,
              in_app: true
            }
          },
          department: null,
          position: null,
          phone: null,
          avatar_url: null
          // last_login omitted; set after insert
        };

        const { error: userError } = await supabase
          .from('users')
          .insert([userData]);

        if (userError) {
          console.error('User creation error:', userError);
          await supabase.from('companies').delete().eq('id', company.id);
          await supabase.auth.signOut();
          return { success: false, error: 'Failed to create user profile: ' + userError.message };
        }

        // Set last_login after insert
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authUser.id);

        if (updateError) {
          console.error('Last login update error:', updateError);
          // Non-fatal; continue
        }

        const updatedUser = await this.getCurrentUser();
        console.log('Signup completed successfully with company and user created');
        return { success: true, requiresVerification: false, user: updatedUser };
      }

      console.log('No user data returned from signup');
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred: ' + (error instanceof Error ? error.message : String(error)) };
    }
  }

  // Complete onboarding process (for additional setup if needed)
  static async completeOnboarding(onboardingData: OnboardingData): Promise<AuthResult> {
    try {
      console.log('Starting onboarding completion...');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'No active session' };
      }

      const authUser = session.user;
      console.log('Current auth user for onboarding:', authUser);

      const { data: existingUser, error: userFetchError } = await supabase
        .from('users')
        .select('id, company_id')
        .eq('id', authUser.id)
        .single();

      if (userFetchError || !existingUser) {
        return { success: false, error: 'User profile not found' };
      }

      const companyId = existingUser.company_id;

      const { data: existingCompany, error: companyFetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyFetchError || !existingCompany) {
        return { success: false, error: 'Company not found' };
      }

      // Update company with additional onboarding data
      const updateCompany: Partial<DatabaseCompany> = {
        size: onboardingData.organization.organizationSize,
        industry: onboardingData.organization.industry || existingCompany.industry,
        settings: {
          ...existingCompany.settings,
          timezone: onboardingData.organization.timezone,
          country: onboardingData.organization.country,
        }
      };

      const { error: companyUpdateError } = await supabase
        .from('companies')
        .update(updateCompany)
        .eq('id', companyId);

      if (companyUpdateError) {
        console.error('Company update error:', companyUpdateError);
        return { success: false, error: 'Failed to update company' };
      }

      // Handle logo upload if provided
      if (onboardingData.organization.logo) {
        const logoPath = `company-logos/${companyId}/${Date.now()}-${onboardingData.organization.logo.name}`;
        const { data: logoData, error: logoError } = await supabase.storage
          .from('company-logos')
          .upload(logoPath, onboardingData.organization.logo);

        if (!logoError && logoData) {
          const { data: { publicUrl } } = supabase.storage
            .from('company-logos')
            .getPublicUrl(logoPath);
          
          await supabase
            .from('companies')
            .update({ logo_url: publicUrl })
            .eq('id', companyId);
        }
      }

      // Create departments
      if (onboardingData.departments && onboardingData.departments.length > 0) {
        const departmentsData = onboardingData.departments.map(dept => ({
          id: crypto.randomUUID(),
          company_id: companyId,
          name: dept.name,
          description: dept.description,
          sort_order: 0
        }));

        const { error: deptError } = await supabase
          .from('sop_categories')
          .insert(departmentsData);

        if (deptError) {
          console.error('Department creation error:', deptError);
        }
      }

      // Send team invitations
      if (onboardingData.teamMembers && onboardingData.teamMembers.length > 0) {
        console.log('Team invitations to be sent:', onboardingData.teamMembers);
      }

      // Handle first document upload
      if (onboardingData.firstDocument?.file) {
        const docPath = `sop-documents/${companyId}/${Date.now()}-${onboardingData.firstDocument.file.name}`;
        const { data: docData, error: docError } = await supabase.storage
          .from('sop-documents')
          .upload(docPath, onboardingData.firstDocument.file);

        if (!docError && docData) {
          const { data: { publicUrl } } = supabase.storage
            .from('sop-documents')
            .getPublicUrl(docPath);

          const sopData = {
            id: crypto.randomUUID(),
            company_id: companyId,
            title: onboardingData.firstDocument.title,
            description: `Initial ${onboardingData.firstDocument.type} uploaded during onboarding`,
            content: `# ${onboardingData.firstDocument.title}\n\nThis document was uploaded during the onboarding process.`,
            version: '1.0',
            status: 'published' as const,
            priority: 'medium' as const,
            department: onboardingData.firstDocument.department,
            document_url: publicUrl,
            document_type: onboardingData.firstDocument.file.type,
            file_size: onboardingData.firstDocument.file.size,
            author_id: authUser.id,
            view_count: 0,
            download_count: 0,
            comments_enabled: true,
            locked: false,
            ai_generated: false
          };

          const { error: sopError } = await supabase
            .from('sops')
            .insert([sopData]);

          if (sopError) {
            console.error('SOP creation error:', sopError);
          }
        }
      }

      const updatedUser = await this.getCurrentUser();
      console.log('Onboarding completed successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Onboarding error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      // Clear any localStorage items that might be cached
      // (Supabase handles its own session storage, but we might have other items)
      localStorage.removeItem('onboardingData');
      localStorage.removeItem('userPreferences');
      localStorage.removeItem('lastVisitedPage');
      
      console.log('Logout successful - all storage cleared');
    } catch (error: unknown) {
      console.error('Logout error:', error);
      throw error instanceof Error ? error : new Error('Logout failed');
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Update password
  static async updatePassword(password: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Verify email (may not be needed with confirmation disabled)
  static async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}