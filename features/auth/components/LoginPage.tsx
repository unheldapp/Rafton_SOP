import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { useAuth } from '../../../shared/context/AuthContext';

interface LoginPageProps {
  onLogin?: (email: string, password: string) => Promise<void>;
  onNavigateToSignup?: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  
  const { login, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (onLogin) {
        // Use the onLogin prop from AppRouter which includes navigation logic
        await onLogin(email, password);
      } else {
        // Fallback to direct login call (shouldn't happen in normal flow)
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setResetMessage('Password reset instructions have been sent to your email.');
        setShowForgotPassword(false);
        setResetEmail('');
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <CardTitle className="text-2xl text-gray-900">Reset Password</CardTitle>
            <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-2.5 transition-all duration-200 shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <CardTitle className="text-2xl text-gray-900">Welcome to Rafton</CardTitle>
          <p className="text-gray-600 mt-2">Compliance Management Platform</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {resetMessage && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{resetMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium py-2.5 transition-all duration-200 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>
          </form>
          
          {/* Signup Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={onNavigateToSignup}
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                disabled={isLoading}
              >
                Create your company account
              </button>
            </p>
          </div>
          
          <div className="text-center text-xs text-gray-500 pt-2">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
}