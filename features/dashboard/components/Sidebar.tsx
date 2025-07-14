import React, { useState } from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  CheckSquare,
  LogOut,
  ChevronDown,
  Menu,
  Library,
  History,
  Bell,
  HelpCircle,
  Clock,
  AlertCircle,
  Home,
  Users
} from 'lucide-react';
import { User, UserRole, Page } from '../../../shared/types';

// Keep local type for backward compatibility
type LocalPage = 'dashboard' | 'sops' | 'acknowledgments' | 'reports' | 'settings' | 'assigned' | 'documents' | 'history' | 'notifications' | 'help';

interface SidebarProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: LocalPage) => void;
  onLogout: () => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  pendingAcknowledgments?: number;
  unreadNotifications?: number;
  completedAssignments?: number;
  overdueAssignments?: number;
}

export function Sidebar({ 
  currentUser, 
  currentPage, 
  onNavigate, 
  onLogout, 
  onCollapseChange,
  pendingAcknowledgments = 0,
  unreadNotifications = 0,
  completedAssignments = 0,
  overdueAssignments = 0
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const getNavItems = (role: UserRole) => {
    if (role === 'admin') {
      return [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'sops', label: 'SOPs', icon: FileText },
        { key: 'acknowledgments', label: 'Acknowledgments', icon: CheckSquare },
        { key: 'reports', label: 'Reports', icon: BarChart3 },
        { key: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'employee') {
      return [
        { 
          key: 'dashboard', 
          label: 'Dashboard', 
          icon: Home,
          description: 'Overview & quick actions'
        },
        { 
          key: 'assigned', 
          label: 'Assigned to Me', 
          icon: FileText,
          badge: pendingAcknowledgments,
          description: 'Documents requiring acknowledgment'
        },
        { 
          key: 'documents', 
          label: 'All Documents', 
          icon: Library,
          description: 'Browse document library'
        },
        { 
          key: 'history', 
          label: 'My History', 
          icon: History,
          description: 'Compliance log & activity'
        },
        { 
          key: 'notifications', 
          label: 'Notifications', 
          icon: Bell,
          badge: unreadNotifications,
          description: 'Updates & reminders'
        },
        { 
          key: 'help', 
          label: 'Help & FAQ', 
          icon: HelpCircle,
          description: 'Support & guidance'
        }
      ];
    }

    return [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'sops', label: 'SOPs', icon: FileText },
      { key: 'reports', label: 'Reports', icon: BarChart3 },
    ];
  };

  const navItems = getNavItems(currentUser.role);

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
                  {currentUser.role === 'employee' && (
                    <div className="text-xs text-purple-600 font-medium">Employee Portal</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Collapse button positioned absolutely in collapsed mode */}
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
                  onClick={() => onNavigate(item.key as LocalPage)}
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
                          <div className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {item.badge}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-medium">{item.label}</div>
                    {item.description && (
                      <div className="text-gray-300">{item.description}</div>
                    )}
                    {item.badge && item.badge > 0 && (
                      <div className="text-red-300 font-medium">{item.badge} pending</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats Summary (for employees when expanded) */}
        {!isCollapsed && currentUser.role === 'employee' && (
          <div className="p-4 border-t border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-3">Quick Summary</div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-3 h-3 text-emerald-500" />
                  <span className="text-gray-600">Completed</span>
                </div>
                <span className="font-medium text-emerald-600">{completedAssignments}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span className="text-gray-600">Pending</span>
                </div>
                <span className="font-medium text-amber-600">{pendingAcknowledgments}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-gray-600">Overdue</span>
                </div>
                <span className="font-medium text-red-600">{overdueAssignments}</span>
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
                    {(currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="ml-3 text-left flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{currentUser.firstName} {currentUser.lastName}</div>
                      <div className="text-xs text-gray-600 capitalize">{currentUser.role}</div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-2" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-48 border-purple-200 z-[100] bg-white shadow-lg"
              sideOffset={8}
            >
              <div className="px-2 py-1.5 text-sm text-gray-900">
                <div className="font-medium">{currentUser.firstName} {currentUser.lastName}</div>
                <div className="text-gray-600">{currentUser.email}</div>
              </div>
              
              <DropdownMenuSeparator className="bg-purple-200" />
              
              <DropdownMenuItem 
                onClick={() => onNavigate('settings')}
                className="text-gray-700 hover:bg-purple-50 focus:bg-purple-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              
              {currentUser.role === 'employee' && (
                <DropdownMenuItem 
                  onClick={() => onNavigate('help')}
                  className="text-gray-700 hover:bg-purple-50 focus:bg-purple-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
              )}
              
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