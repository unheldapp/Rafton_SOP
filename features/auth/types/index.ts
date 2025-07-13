// Auth feature types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  companyName: string;
  role: 'admin' | 'employee' | 'auditor';
  department: string;
  position: string;
  agreeToTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileUpdateFormData {
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: File;
}

export interface OnboardingData {
  step: number;
  userData: Partial<RegisterFormData>;
  companyData: {
    name: string;
    industry: string;
    size: string;
    address: string;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark';
  };
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: AuthError | null;
  onboardingData: OnboardingData | null;
}

export interface InvitationData {
  token: string;
  email: string;
  role: string;
  department: string;
  companyName: string;
  invitedBy: string;
  expiresAt: string;
} 