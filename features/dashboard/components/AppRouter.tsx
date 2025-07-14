import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useApp } from '../../../shared/context/AppContext';
import { useData } from '../../../shared/context/DataContext';
import { useSOPs } from '../../../shared/hooks/useSOPs';
import { useUsers } from '../../../shared/hooks/useUsers';
import { useEmployeeDashboard } from '../../../shared/hooks/useEmployeeDashboard';

// Import auth components
import { LoginPage } from '../../../features/auth/components/LoginPage';
import { CompanySignupPage } from '../../../features/auth/components/CompanySignupPage';
import { OnboardingFlow } from '../../../features/auth/components/OnboardingFlow';

// Import other page components
import { Dashboard } from './Dashboard';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Settings } from './Settings';
import { Sidebar } from './Sidebar';
import { NotificationsPage } from './NotificationsPage';
import { HelpFAQPage } from './HelpFAQPage';
import { UserManagement } from './UserManagement';

// Import SOP components
import { SOPsPage } from '../../../features/sops/components/SOPsPage';
import { SOPTemplateSelector } from '../../../features/sops/components/SOPTemplateSelector';
import { SOPEditor } from '../../../features/sops/components/SOPEditor';
import { SOPViewer } from '../../../features/sops/components/SOPViewer';
import { SOPVersionControl } from '../../../features/sops/components/SOPVersionControl';
import { ReviewApproval } from '../../../features/sops/components/ReviewApproval';
import { SOPReviewPage } from '../../../features/sops/components/SOPReviewPage';
import { SOPSubmitReviewPage } from '../../../features/sops/components/SOPSubmitReviewPage';
import { AcknowledgmentModule } from '../../../features/sops/components/AcknowledgmentModule';
import { AllDocumentsPage } from '../../../features/sops/components/AllDocumentsPage';

// Import compliance components
import { AssignedToMePage } from '../../../features/compliance/components/AssignedToMePage';
import { AuditorSidebar } from '../../../features/compliance/components/AuditorSidebar';
import { AuditorComplianceOverview } from '../../../features/compliance/components/AuditorComplianceOverview';
import { AuditorDocumentCompliance } from '../../../features/compliance/components/AuditorDocumentCompliance';
import { AuditorUserCompliance } from '../../../features/compliance/components/AuditorUserCompliance';
import { AuditorAuditLogs } from '../../../features/compliance/components/AuditorAuditLogs';
import { AuditorExportReports } from '../../../features/compliance/components/AuditorExportReports';

// Import reports components
import { Reports } from '../../../features/reports/components/Reports';
import { HistoryPage } from '../../../features/reports/components/HistoryPage';

export function AppRouter() {
  const { currentUser, isLoading, isAuthenticated, login, signup, signupData, completeOnboarding, logout } = useAuth();
  const { 
    currentPage, 
    selectedSOP, 
    selectedTemplate, 
    selectedWorkingCopy,
    navigateTo,
    setSelectedSOP,
    setSelectedTemplate,
    setSelectedWorkingCopy
  } = useApp();
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isNewReviewRequest, setNewReviewRequest] = useState(false);
  const [pendingReviewData, setPendingReviewData] = useState<{ sop: any; changes: any } | null>(null);

  // Auto-login: Navigate to dashboard if user is authenticated but on login page
  useEffect(() => {
    if (!isLoading && isAuthenticated && currentUser) {
      // Only auto-navigate if we're on auth-related pages
      if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'onboarding') {
        console.log('Auto-navigating authenticated user to dashboard');
        // Navigate based on user role
        if (currentUser.role === 'auditor') {
          navigateTo('compliance-overview');
        } else {
          navigateTo('dashboard');
        }
      }
    }
  }, [isLoading, isAuthenticated, currentUser, currentPage, navigateTo]);

  // Show loading screen during auth initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.success && result.user) {
      // Set default page based on user role
      if (result.user.role === 'auditor') {
        navigateTo('compliance-overview');
      } else {
        navigateTo('dashboard');
      }
    } else if (!result.success) {
      // If login failed, the error should be handled by the LoginPage component
      console.error('Login failed in AppRouter:', result.error);
      throw new Error(result.error || 'Login failed');
    }
  };

  // Handle signup
  const handleSignup = async (signupFormData: {
    companyName: string;
    industryType: string;
    orgEmailDomain: string;
    fullName: string;
    workEmail: string;
    password: string;
  }) => {
    const success = await signup(signupFormData);
    if (success) {
      navigateTo('onboarding');
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      await completeOnboarding(onboardingData);
      navigateTo('dashboard');
    } catch (error) {
      console.error('Onboarding completion failed:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigateTo('login');
  };

  // Create a wrapper function to handle the different navigateTo signatures
  const navigateToWrapper = (page: string, sopOrTemplate?: SOPWithDetails | Template, folderId?: string) => {
    // Handle folderId state
    if (folderId !== undefined) {
      setCurrentFolderId(folderId);
    }
    
    // Use the AppContext's navigateTo function
    navigateTo(page as any, sopOrTemplate as any);
  };

  // Authentication pages
  if (currentPage === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onNavigateToSignup={() => navigateTo('signup')}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <CompanySignupPage 
        onNavigateToLogin={() => navigateTo('login')}
        onSignupSuccess={() => navigateTo('onboarding')}
      />
    );
  }

  if (currentPage === 'onboarding') {
    return (
      <OnboardingFlow 
        companyData={signupData!}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Ensure user is authenticated for protected routes
  if (!isAuthenticated || !currentUser) {
    navigateTo('login');
    return null;
  }

  // Now we know the user is authenticated, we can safely use the hooks
  return <AuthenticatedAppRouter 
    currentUser={currentUser}
    currentPage={currentPage}
    selectedSOP={selectedSOP}
    selectedTemplate={selectedTemplate}
    selectedWorkingCopy={selectedWorkingCopy}
    currentFolderId={currentFolderId}
    isSidebarCollapsed={isSidebarCollapsed}
    isNewReviewRequest={isNewReviewRequest}
    pendingReviewData={pendingReviewData}
    navigateTo={navigateToWrapper}
    setSidebarCollapsed={setSidebarCollapsed}
    setNewReviewRequest={setNewReviewRequest}
    setPendingReviewData={setPendingReviewData}
    onLogout={handleLogout}
  />;
}

// Separate component for authenticated routes to avoid hooks ordering issues
function AuthenticatedAppRouter({ 
  currentUser, 
  currentPage, 
  selectedSOP, 
  selectedTemplate, 
  selectedWorkingCopy, 
  currentFolderId,
  isSidebarCollapsed,
  isNewReviewRequest,
  pendingReviewData,
  navigateTo, 
  setSidebarCollapsed,
  setNewReviewRequest,
  setPendingReviewData,
  onLogout
}: {
  currentUser: any;
  currentPage: string;
  selectedSOP: any;
  selectedTemplate: any;
  selectedWorkingCopy: any;
  currentFolderId: string | null;
  isSidebarCollapsed: boolean;
  isNewReviewRequest: boolean;
  pendingReviewData: any;
  navigateTo: (page: string, sopOrTemplate?: SOPWithDetails | Template, folderId?: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setNewReviewRequest: (isNew: boolean) => void;
  setPendingReviewData: (data: any) => void;
  onLogout: () => void;
}) {
  const { sops, submitSOPForReview } = useSOPs();
  const { users } = useUsers();
  
  // Get dashboard data for employee users (for sidebar statistics)
  const { data: dashboardData } = useEmployeeDashboard();

  // Handle submit for review
  const handlePrepareSubmitForReview = (sopId: string, changes: { title: string; content: string; department: string }) => {
    const sop = sops.find(s => s.id === sopId);
    if (sop) {
      setPendingReviewData({ sop, changes });
      navigateTo('submit-review');
    }
  };

  // Handle working copy submit for review
  const handlePrepareWorkingCopySubmitForReview = (originalSOP: any, workingCopy: any) => {
    setPendingReviewData({ sop: originalSOP, workingCopy });
    navigateTo('submit-review');
  };

  // Handle final submit for review
  const handleFinalSubmitForReview = async (
    sopId: string, 
    changes: { title: string; content: string; department: string }, 
    reviewers: string[], 
    summary: string
  ) => {
    await submitSOPForReview(sopId, changes, reviewers, summary);
    setPendingReviewData(null);
  };

  // Full-screen layout pages (no sidebar)
  if (currentPage === 'editor') {
    return (
      <div className="min-h-screen bg-gray-50">
        {currentUser.role === 'employee' ? (
          <SOPViewer 
            sop={selectedSOP?.id && selectedSOP?.title ? selectedSOP : null}
            sopId={selectedSOP?.id}
            currentUser={currentUser}
            onNavigate={navigateTo}
            onBack={() => navigateTo('documents')}
            showAcknowledgment={true}
          />
        ) : (
          <SOPEditor 
            sop={selectedSOP}
            template={selectedTemplate}
            onNavigate={navigateTo}
            onSubmitForReview={handlePrepareSubmitForReview}
            onWorkingCopySubmitForReview={handlePrepareWorkingCopySubmitForReview}
            currentUser={currentUser}
            currentFolderId={currentFolderId}
          />
        )}
      </div>
    );
  }

  if (currentPage === 'template-selector') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SOPTemplateSelector 
          onNavigate={(page: string, template?: any) => {
            navigateTo(page, template, currentFolderId);
          }} 
          currentFolderId={currentFolderId}
        />
      </div>
    );
  }

  if (currentPage === 'version-control') {
    const originalSOP = sops.find(sop => sop.id === selectedWorkingCopy?.originalSOPId);
    return (
      <div className="min-h-screen bg-gray-50">
        <SOPVersionControl 
          workingCopy={selectedWorkingCopy!}
          originalSOP={originalSOP!}
          onNavigate={navigateTo}
        />
      </div>
    );
  }

  if (currentPage === 'submit-review') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SOPSubmitReviewPage 
          originalSOP={pendingReviewData!.sop}
          workingCopy={pendingReviewData!.workingCopy}
          users={users}
          onNavigate={navigateTo}
          onSubmitForReview={(workingCopyId, reviewers, summary, version) => {
            // Handle working copy submission
            console.log('Submitting working copy for review:', { workingCopyId, reviewers, summary, version });
            // For now, navigate back to SOPs page
            navigateTo('sops');
          }}
        />
      </div>
    );
  }

  if (currentPage === 'sop-review') {
    return (
      <SOPReviewPage 
        sop={selectedSOP}
        currentUser={currentUser}
        users={users}
        onNavigate={navigateTo}
        isNewlyCreated={isNewReviewRequest}
        onSubmitReview={(reviewData) => {
          console.log('Review submitted:', reviewData);
          setNewReviewRequest(false);
        }}
      />
    );
  }

  if (currentPage === 'sops') {
    return (
      <div className="min-h-screen bg-gray-50">
        <SOPsPage 
          onNavigate={(page: string, sop?: SOPWithDetails, folderId?: string) => {
            navigateTo(page, sop, folderId);
          }}
          currentUser={currentUser}
        />
      </div>
    );
  }

  if (currentPage === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Settings 
          onNavigate={navigateTo}
        />
      </div>
    );
  }

  // Layout with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional sidebar based on user role */}
      {currentUser.role === 'auditor' ? (
        <AuditorSidebar 
          currentPage={currentPage}
          onNavigate={navigateTo}
          onLogout={onLogout}
          currentUser={currentUser}
          onCollapseChange={setSidebarCollapsed}
        />
      ) : (
        <Sidebar 
          currentUser={currentUser} 
          currentPage={currentPage}
          onNavigate={navigateTo}
          onLogout={onLogout}
          onCollapseChange={setSidebarCollapsed}
          pendingAcknowledgments={dashboardData?.stats?.pendingAssignments || 0}
          unreadNotifications={dashboardData?.stats?.unreadNotifications || 0}
          // Pass additional stats for the Quick Summary section
          completedAssignments={dashboardData?.stats?.acknowledgedThisMonth || 0}
          overdueAssignments={dashboardData?.stats?.overdueAssignments || 0}
        />
      )}
      
      <main className={`transition-all duration-200 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Dashboard pages */}
        {currentPage === 'dashboard' && (
          currentUser.role === 'employee' ? (
            <EmployeeDashboard 
              currentUser={currentUser}
              onNavigate={navigateTo}
            />
          ) : (
            <Dashboard 
              user={currentUser} 
              sops={sops}
              onNavigate={navigateTo}
            />
          )
        )}
        
        {/* Review and acknowledgment pages */}
        {currentPage === 'review' && (
          <ReviewApproval 
            sop={selectedSOP}
            onNavigate={navigateTo}
          />
        )}
        
        {currentPage === 'acknowledgments' && (
          <AcknowledgmentModule 
            sops={sops}
            users={users}
            onNavigate={navigateTo}
          />
        )}
        
        {currentPage === 'reports' && (
          <Reports 
            sops={sops}
            users={users}
          />
        )}
        
        {/* Employee-specific pages */}
        {currentPage === 'assigned' && (
          <AssignedToMePage currentUser={currentUser} onNavigate={navigateTo} />
        )}
        
        {currentPage === 'documents' && (
          <AllDocumentsPage currentUser={currentUser} onNavigate={navigateTo} />
        )}
        
        {currentPage === 'history' && (
          <HistoryPage />
        )}
        
        {currentPage === 'notifications' && (
          <NotificationsPage />
        )}
        
        {currentPage === 'help' && (
          <HelpFAQPage currentUser={currentUser} />
        )}

        {/* Auditor-specific pages */}
        {currentPage === 'compliance-overview' && (
          <AuditorComplianceOverview 
            onNavigateToDocuments={(filters) => {
              navigateTo('document-compliance');
            }}
          />
        )}
        
        {currentPage === 'document-compliance' && (
          <AuditorDocumentCompliance />
        )}
        
        {currentPage === 'user-compliance' && (
          <AuditorUserCompliance />
        )}
        
        {currentPage === 'audit-logs' && (
          <AuditorAuditLogs />
        )}
        
        {currentPage === 'export-reports' && (
          <AuditorExportReports />
        )}
      </main>
    </div>
  );
}