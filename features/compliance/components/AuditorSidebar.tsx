import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { Badge } from "../../../shared/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { 
  Shield,
  FileText,
  Users,
  ScrollText,
  Download,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// Define types locally to avoid import issues
type UserRole = 'admin' | 'employee' | 'auditor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
  status: 'active' | 'pending';
  department?: string;
}

type AuditorPage = 'compliance-overview' | 'document-compliance' | 'user-compliance' | 'audit-logs' | 'export-reports' | 'settings' | 'help';

interface AuditorSidebarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: AuditorPage) => void;
  onLogout: () => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export function AuditorSidebar({ 
  currentUser, 
  currentPage, 
  onNavigate, 
  onLogout, 
  onCollapseChange
}: AuditorSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const navItems = [
    { 
      key: 'compliance-overview', 
      label: 'Compliance Overview', 
      icon: Shield,
      description: 'Overall compliance dashboard'
    },
    { 
      key: 'document-compliance', 
      label: 'Document Compliance', 
      icon: FileText,
      badge: 7, // Mock overdue count
      description: 'Document acknowledgment tracking'
    },
    { 
      key: 'user-compliance', 
      label: 'User Compliance', 
      icon: Users,
      badge: 5, // Mock non-compliant users
      description: 'User-wise compliance records'
    },
    { 
      key: 'audit-logs', 
      label: 'Audit Logs', 
      icon: ScrollText,
      badge: 12, // Mock recent activities
      description: 'System activity logs'
    },
    { 
      key: 'export-reports', 
      label: 'Export Reports', 
      icon: Download,
      description: 'Generate compliance reports'
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-purple-200 z-50 transition-all duration-200 shadow-lg ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              {!isCollapsed && (
                <div>
                  <span className="font-semibold text-gray-900">Rafton</span>
                  <div className="text-xs text-purple-600 font-medium">Auditor Portal</div>
                </div>
              )}
            </div>
            
            {/* Collapse button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseToggle}
              className={`p-1.5 hover:bg-purple-100 text-purple-600 transition-all duration-200 ${
                isCollapsed 
                  ? 'absolute top-4 right-2 w-8 h-8' 
                  : 'relative'
              }`}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.key;
            
            return (
              <div key={item.key} className="relative group">
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.key as AuditorPage)}
                  className={`w-full transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md hover:from-purple-700 hover:to-violet-700' 
                      : 'text-gray-700 hover:bg-purple-100 hover:text-gray-900'
                  } ${
                    isCollapsed 
                      ? 'h-10 w-10 p-0 justify-center mx-auto' 
                      : 'justify-start px-3 h-10'
                  }`}
                >
                  <div className="flex items-center w-full">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge 
                            className={`ml-2 px-1.5 py-0.5 text-xs ${
                              isActive 
                                ? 'bg-white/20 text-white hover:bg-white/30' 
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-gray-300">{item.description}</div>
                    {item.badge && item.badge > 0 && (
                      <div className="text-red-300 font-medium">{item.badge} items</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats Summary (when expanded) */}
        {!isCollapsed && (
          <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-3">Compliance Summary</div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span className="text-gray-600">Compliant</span>
                </div>
                <span className="font-medium text-emerald-600">78%</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span className="text-gray-600">Pending</span>
                </div>
                <span className="font-medium text-amber-600">15</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-gray-600">Overdue</span>
                </div>
                <span className="font-medium text-red-600">7</span>
              </div>
            </div>
          </div>
        )}
        
        {/* User Menu */}
        <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`w-full transition-all duration-200 hover:bg-purple-100 text-gray-700 hover:text-gray-900 ${
                  isCollapsed 
                    ? 'h-10 w-10 p-0 justify-center mx-auto' 
                    : 'justify-start px-3 h-12'
                }`}
              >
                <Avatar className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-7 h-7'}`}>
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs font-medium">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="ml-3 text-left flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</div>
                      <div className="text-xs text-gray-600">Auditor</div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 border-purple-200">
              <div className="px-2 py-1.5 text-sm text-gray-900">
                <div className="font-medium">{currentUser.name}</div>
                <div className="text-gray-600">{currentUser.email}</div>
                <div className="text-xs text-purple-600 font-medium">Auditor</div>
              </div>
              
              <DropdownMenuSeparator className="bg-purple-200" />
              
              <DropdownMenuItem 
                onClick={() => onNavigate('settings')}
                className="text-gray-700 hover:bg-purple-50 focus:bg-purple-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-purple-200" />
              
              <DropdownMenuItem 
                onClick={onLogout} 
                className="text-red-600 hover:bg-red-50 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}