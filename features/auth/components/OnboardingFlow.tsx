import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Badge } from "../../../shared/components/ui/badge";
import { Progress } from "../../../shared/components/ui/progress";
import { Alert, AlertDescription } from "../../../shared/components/ui/alert";
import { 
  Building2, 
  Users, 
  Mail, 
  FileText, 
  MapPin, 
  Upload, 
  X, 
  Plus,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { OnboardingData, CompanySize } from '../../../shared/types';

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface Department {
  id: string;
  name: string;
  description: string;
}

interface TeamMember {
  email: string;
  role: 'employee' | 'auditor' | 'admin';
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { currentUser, completeOnboarding, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const totalSteps = 5;

  // Step 1: Organization Basics
  const [orgData, setOrgData] = useState({
    logo: null as File | null,
    industry: '',
    organizationSize: '' as CompanySize | '',
    country: '',
    timezone: 'UTC'
  });

  // Step 2: Department Setup
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'HR', description: 'Human Resources and Personnel Management' },
    { id: '2', name: 'Regulatory Affairs', description: 'Regulatory Affairs and Compliance' },
    { id: '3', name: 'Quality Assurance', description: 'Quality Assurance and Control' },
    { id: '4', name: 'Operations', description: 'Manufacturing and Production Operations' },
    { id: '5', name: 'Safety', description: 'Workplace Safety and Environmental Health' },
    { id: '6', name: 'IT', description: 'Information Technology and Systems' }
  ]);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });

  // Step 3: Team Invites
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<'employee' | 'auditor' | 'admin'>('employee');

  // Step 4: First Document
  const [documentData, setDocumentData] = useState({
    file: null as File | null,
    title: '',
    type: 'SOP' as 'SOP' | 'Policy' | 'Guideline',
    department: '',
    assignToUsers: [] as string[]
  });

  const organizationSizes: { value: CompanySize; label: string }[] = [
    { value: 'small', label: '1-50 employees' },
    { value: 'medium', label: '51-200 employees' },
    { value: 'large', label: '201-1000 employees' },
    { value: 'enterprise', label: '1000+ employees' }
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Australia', 'India', 'Japan', 'Singapore', 'Switzerland', 'Netherlands',
    'Sweden', 'Norway', 'Denmark', 'Finland', 'Brazil', 'Mexico', 'Other'
  ];

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney', 'America/Toronto', 'America/Sao_Paulo'
  ];

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

  const stepProgress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(totalSteps); // Go to success step
    } else {
      try {
        setError('');
        const onboardingData: OnboardingData = {
          organization: {
            logo: orgData.logo,
            industry: orgData.industry,
            organizationSize: orgData.organizationSize as CompanySize,
            country: orgData.country,
            timezone: orgData.timezone
          },
          departments,
          teamMembers,
          firstDocument: documentData
        };
        
        const result = await completeOnboarding(onboardingData);
        if (result.success) {
          onComplete();
        } else {
          setError(result.error || 'Failed to complete onboarding. Please try again.');
        }
      } catch (error) {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  const addDepartment = () => {
    if (newDepartment.name.trim()) {
      const department: Department = {
        id: Date.now().toString(),
        name: newDepartment.name.trim(),
        description: newDepartment.description.trim()
      };
      setDepartments([...departments, department]);
      setNewDepartment({ name: '', description: '' });
    }
  };

  const removeDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  const addTeamMember = () => {
    if (emailInput.trim() && /\S+@\S+\.\S+/.test(emailInput)) {
      const existingMember = teamMembers.find(member => member.email === emailInput.trim());
      if (!existingMember) {
        const member: TeamMember = {
          email: emailInput.trim(),
          role: selectedRole
        };
        setTeamMembers([...teamMembers, member]);
        setEmailInput('');
      }
    }
  };

  const removeTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter(member => member.email !== email));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocumentData(prev => ({ ...prev, file }));
      if (!documentData.title) {
        // Auto-populate title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setDocumentData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900">Organization Basics</h2>
              <p className="text-gray-600 mt-2">Let's set up your organization profile</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Company Logo (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload your company logo</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setOrgData(prev => ({ ...prev, logo: file }));
                  }}
                  className="hidden"
                  id="logo-upload"
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={isLoading}
                >
                  Choose File
                </Button>
                {orgData.logo && (
                  <p className="text-sm text-green-600 mt-2">✓ {orgData.logo.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Industry</Label>
                <Select 
                  value={orgData.industry} 
                  onValueChange={(value) => setOrgData(prev => ({ ...prev, industry: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Organization Size</Label>
                <Select 
                  value={orgData.organizationSize} 
                  onValueChange={(value: CompanySize) => setOrgData(prev => ({ ...prev, organizationSize: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization size" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationSizes.map(size => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Country/Region</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Select 
                    value={orgData.country} 
                    onValueChange={(value) => setOrgData(prev => ({ ...prev, country: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Timezone</Label>
                <Select 
                  value={orgData.timezone} 
                  onValueChange={(value) => setOrgData(prev => ({ ...prev, timezone: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900">Department Setup</h2>
              <p className="text-gray-600 mt-2">Organize your company structure</p>
            </div>

            {/* Existing Departments */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">Departments</Label>
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {departments.map((dept) => (
                  <div key={dept.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{dept.name}</h4>
                      <p className="text-sm text-gray-600">{dept.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDepartment(dept.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Department */}
            <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-medium text-gray-900">Add New Department</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Department name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={addDepartment} 
                variant="outline" 
                className="w-full"
                disabled={isLoading || !newDepartment.name.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900">Invite Your Team</h2>
              <p className="text-gray-600 mt-2">Add team members to get started</p>
            </div>

            {/* Add Team Member */}
            <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <h4 className="font-medium text-gray-900">Add Team Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="email"
                  placeholder="email@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                  disabled={isLoading}
                />
                <Select 
                  value={selectedRole} 
                  onValueChange={(value: 'employee' | 'auditor' | 'admin') => setSelectedRole(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={addTeamMember}
                  disabled={isLoading || !emailInput.trim() || !/\S+@\S+\.\S+/.test(emailInput)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Team Members List */}
            {teamMembers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Team Members ({teamMembers.length})</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-sm font-medium">
                            {member.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.email}</p>
                          <Badge variant="outline" className="text-xs">
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(member.email)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center">
              <Button variant="outline" onClick={handleNext} disabled={isLoading}>
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FileText className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900">Upload First Document</h2>
              <p className="text-gray-600 mt-2">Get started with your first SOP or policy</p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Upload Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload PDF, DOCX, or other document</p>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="document-upload"
                  disabled={isLoading}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('document-upload')?.click()}
                  disabled={isLoading}
                >
                  Choose File
                </Button>
                {documentData.file && (
                  <p className="text-sm text-green-600 mt-2">✓ {documentData.file.name}</p>
                )}
              </div>
            </div>

            {/* Document Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Document Title</Label>
                <Input
                  placeholder="e.g., Safety Procedures Manual"
                  value={documentData.title}
                  onChange={(e) => setDocumentData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Document Type</Label>
                <Select 
                  value={documentData.type} 
                  onValueChange={(value: 'SOP' | 'Policy' | 'Guideline') => 
                    setDocumentData(prev => ({ ...prev, type: value }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOP">SOP</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                    <SelectItem value="Guideline">Guideline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Department</Label>
              <Select 
                value={documentData.department} 
                onValueChange={(value) => setDocumentData(prev => ({ ...prev, department: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={handleFinish} disabled={isLoading}>
                Skip document upload
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 You're all set!</h2>
              <p className="text-lg text-gray-600 mb-8">
                <strong>{currentUser?.company?.name}</strong> is now live on Rafton.<br />
                Start managing compliance with confidence.
              </p>

              {/* Quick Actions Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Create Your First SOP</h3>
                  <p className="text-sm text-gray-600">Start with templates or create from scratch</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Invite More Team Members</h3>
                  <p className="text-sm text-gray-600">Add employees and assign roles</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Configure Settings</h3>
                  <p className="text-sm text-gray-600">Customize workflows and notifications</p>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-6">
                Need help getting started? Check out our{' '}
                <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">
                  Quick Start Guide
                </a>{' '}
                or{' '}
                <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">
                  contact support
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome to Rafton, {currentUser?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Let's set up {currentUser?.company?.name} for success
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(stepProgress)}% complete</span>
          </div>
          <Progress value={stepProgress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
          
          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i + 1 <= currentStep ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep === totalSteps ? (
              <Button
                onClick={() => handleFinish()}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </>
                )}
              </Button>
            ) : currentStep === 4 ? (
              <Button
                onClick={handleFinish}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Finishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finish Setup
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                disabled={isLoading}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}