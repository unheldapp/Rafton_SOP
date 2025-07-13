import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, SignupData, OnboardingData, AuthResult } from '../types';
import { AuthService } from '../services/authService';
import { supabase } from '../services/supabase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (signupData: SignupData) => Promise<AuthResult>;
  completeOnboarding: (onboardingData: OnboardingData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  setSignupData: (data: Partial<SignupData>) => void;
  clearSignupData: () => void;
  refreshUser: () => Promise<void>;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_SIGNUP_DATA'; payload: Partial<SignupData> }
  | { type: 'CLEAR_SIGNUP_DATA' }
  | { type: 'LOGOUT' }
  | { type: 'INIT_AUTH'; payload: { user: User | null; isAuthenticated: boolean } };

const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  signupData: null,
  isLoading: true
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: !!action.payload
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload
      };
    case 'SET_SIGNUP_DATA':
      return {
        ...state,
        signupData: { ...state.signupData, ...action.payload }
      };
    case 'CLEAR_SIGNUP_DATA':
      return {
        ...state,
        signupData: null
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        signupData: null,
        isLoading: false
      };
    case 'INIT_AUTH':
      return {
        ...state,
        currentUser: action.payload.user,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Wrap async operations in setTimeout to prevent deadlocks
        setTimeout(async () => {
          if (event === 'SIGNED_IN' && session) {
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'INIT_AUTH', payload: { user, isAuthenticated: true } });
          } else if (event === 'SIGNED_OUT') {
            dispatch({ type: 'LOGOUT' });
          } else if (event === 'TOKEN_REFRESHED' && session) {
            const user = await AuthService.getCurrentUser();
            dispatch({ type: 'SET_USER', payload: user });
          }
        }, 0);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if there's a current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      const authPromise = (async () => {
        const user = await AuthService.getCurrentUser();
        
        if (user) {
          return { user, isAuthenticated: true };
        } else {
          return { user: null, isAuthenticated: false };
        }
      })();

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
      });

      const result = await Promise.race([authPromise, timeoutPromise]) as { user: User | null; isAuthenticated: boolean };
      dispatch({ type: 'INIT_AUTH', payload: result });
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'INIT_AUTH', payload: { user: null, isAuthenticated: false } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await AuthService.login(email, password);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (signupData: SignupData): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await AuthService.signup(signupData);
      
      if (result.success) {
        dispatch({ 
          type: 'SET_SIGNUP_DATA', 
          payload: {
            companyName: signupData.companyName,
            fullName: signupData.fullName,
            workEmail: signupData.workEmail,
            orgEmailDomain: signupData.orgEmailDomain,
            industryType: signupData.industryType
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const completeOnboarding = async (onboardingData: OnboardingData): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await AuthService.completeOnboarding(onboardingData);
      
      if (result.success && result.user) {
        dispatch({ type: 'SET_USER', payload: result.user });
        dispatch({ type: 'CLEAR_SIGNUP_DATA' });
      }
      
      return result;
    } catch (error) {
      console.error('Onboarding error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AuthService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout on error
      dispatch({ type: 'LOGOUT' });
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      return await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      return await AuthService.updatePassword(password);
    } catch (error) {
      console.error('Password update error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const setSignupData = (data: Partial<SignupData>): void => {
    dispatch({ type: 'SET_SIGNUP_DATA', payload: data });
  };

  const clearSignupData = (): void => {
    dispatch({ type: 'CLEAR_SIGNUP_DATA' });
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const user = await AuthService.getCurrentUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('User refresh error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      completeOnboarding,
      logout,
      resetPassword,
      updatePassword,
      setSignupData,
      clearSignupData,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function  useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}