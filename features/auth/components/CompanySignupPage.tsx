import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { ArrowLeft, Eye, EyeOff, Building2, Mail, User, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';

interface CompanySignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess?: () => void;
}

export function CompanySignupPage({ onNavigateToLogin, onSignupSuccess }: CompanySignupPageProps) {
  const { signup, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    companyName: '',
    industryType: '',
    orgEmailDomain: '',
    fullName: '',
    workEmail: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const industries = [
    { value: 'biotechnology', label: 'Biotechnology' },
    { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
    { value: 'medical-devices', label: 'Medical Devices' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'chemical', label: 'Chemical' },
    { value: 'food-beverage', label: 'Food & Beverage' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'aerospace', label: 'Aerospace' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'energy', label: 'Energy' },
    { value: 'financial-services', label: 'Financial Services' },
    { value: 'technology', label: 'Technology' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Minimal validation - only check if fields are completely empty
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.workEmail.trim()) {
      newErrors.workEmail = 'Work email is required';
    } else if (!formData.workEmail.includes('@')) {
      newErrors.workEmail = 'Please enter a valid email address';
    }

    // Email domain validation removed as requested

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setGlobalError('');
    setSuccessMessage('');

    try {
      const signupData = {
        companyName: formData.companyName,
        industryType: formData.industryType,
        orgEmailDomain: formData.orgEmailDomain.startsWith('@') ? formData.orgEmailDomain : `@${formData.orgEmailDomain}`,
        fullName: formData.fullName,
        workEmail: formData.workEmail,
        password: formData.password
      };

      console.log('Calling signup with data:', signupData);
      const result = await signup(signupData);
      console.log('Signup result:', result);
      
      if (result.success) {
        console.log('Signup successful, showing success message');
        if (result.requiresVerification) {
          setSuccessMessage('Account created successfully! Please check your email to verify your account before continuing.');
        } else {
          setSuccessMessage('Account created successfully! You can now continue with onboarding.');
        }
        // Navigate to onboarding in both cases
        console.log('Setting timeout for navigation to onboarding...');
        setTimeout(() => {
          console.log('Navigating to onboarding...');
          onSignupSuccess?.();
        }, 2000); // Give user time to see the success message
      } else {
        console.log('Signup failed with error:', result.error);
        setGlobalError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      setGlobalError('An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setGlobalError('');
  };

  const formatDomain = (domain: string) => {
    if (!domain) return '';
    return domain.startsWith('@') ? domain : `@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-0">
        <CardHeader className="text-center pb-8">
          {/* Back to Login */}
          <button
            onClick={onNavigateToLogin}
            className="absolute top-6 left-6 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <CardTitle className="text-2xl text-gray-900">Create Your Company Account</CardTitle>
          <p className="text-gray-600 mt-2">Set up your organization on Rafton and become the admin</p>
        </CardHeader>
        
        <CardContent>
          {globalError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-purple-600" />
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-700 font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="e.g., Acme Biotech Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className={`border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                      errors.companyName ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {errors.companyName && <p className="text-sm text-red-600">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industryType" className="text-gray-700 font-medium">
                    Industry Type
                  </Label>
                  <Select 
                    value={formData.industryType} 
                    onValueChange={(value) => handleInputChange('industryType', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgEmailDomain" className="text-gray-700 font-medium">
                  Organization Email Domain (Optional)
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="orgEmailDomain"
                    type="text"
                    placeholder="e.g., acme.com or @acme.com"
                    value={formData.orgEmailDomain}
                    onChange={(e) => handleInputChange('orgEmailDomain', e.target.value)}
                    className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Used for auto-joining team members with matching email domains
                  {formData.orgEmailDomain && (
                    <span className="font-medium text-purple-600">
                      {' '}(will be: {formatDomain(formData.orgEmailDomain)})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Admin Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Admin Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">
                    Your Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                      errors.fullName ? 'border-red-500' : ''
                    }`}
                    disabled={isLoading}
                  />
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workEmail" className="text-gray-700 font-medium">
                    Work Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="workEmail"
                      type="email"
                      placeholder="your.email@company.com"
                      value={formData.workEmail}
                      onChange={(e) => handleInputChange('workEmail', e.target.value)}
                      className={`pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                        errors.workEmail ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.workEmail && <p className="text-sm text-red-600">{errors.workEmail}</p>}
                  <p className="text-xs text-gray-500">This will become your admin login</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  <p className="text-xs text-gray-500">Must contain uppercase, lowercase, and number</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => {
                    setAgreeToTerms(checked as boolean);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  className="mt-0.5"
                  disabled={isLoading}
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-5">
                  I agree to Rafton's{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-3 transition-all duration-200 shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Creating Company...
                  </>
                ) : (
                  'Create Company & Continue'
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <button 
              onClick={onNavigateToLogin}
              className="text-purple-600 hover:text-purple-800 font-medium"
              disabled={isLoading}
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}