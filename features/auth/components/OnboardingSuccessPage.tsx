import React from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { CheckCircle, Users, FileText, Settings, ArrowRight } from 'lucide-react';

interface OnboardingSuccessPageProps {
  companyName: string;
  onGoToDashboard: () => void;
}

export function OnboardingSuccessPage({ companyName, onGoToDashboard }: OnboardingSuccessPageProps) {
  const quickActions = [
    {
      icon: FileText,
      title: 'Create Your First SOP',
      description: 'Start with our templates or create from scratch',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Users,
      title: 'Invite More Team Members',
      description: 'Add employees and assign roles',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Settings,
      title: 'Configure Settings',
      description: 'Customize workflows and notifications',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-0">
        <CardContent className="p-12 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 You're all set!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            <strong>{companyName}</strong> is now live on Rafton.<br />
            Start managing compliance with confidence.
          </p>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              );
            })}
          </div>

          {/* Dashboard Button */}
          <Button 
            onClick={onGoToDashboard}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-medium px-8 py-3 text-lg shadow-md"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help getting started? Check out our{' '}
              <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">
                Quick Start Guide
              </a>{' '}
              or{' '}
              <a href="#" className="text-purple-600 hover:text-purple-800 font-medium">
                contact support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}