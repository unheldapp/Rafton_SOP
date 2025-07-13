import React from 'react';
import { Button } from "../../../shared/components/ui/button";
import { Avatar, AvatarFallback } from "../../../shared/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  CheckSquare,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../App';

type Page = 'dashboard' | 'sops' | 'acknowledgments' | 'users' | 'reports' | 'settings';

interface NavigationProps {
  currentUser: User;
  currentPage: string;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Navigation({ currentUser, currentPage, onNavigate, onLogout }: NavigationProps) {
  const getNavItems = (role: UserRole) => {
    const baseItems = [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'sops', label: 'SOPs', icon: FileText },
    ];

    if (role === 'admin') {
      return [
        ...baseItems,
        { key: 'acknowledgments', label: 'Acknowledgments', icon: CheckSquare },
        { key: 'users', label: 'Users', icon: Users },
        { key: 'reports', label: 'Reports', icon: BarChart3 },
        { key: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (role === 'employee') {
      return [
        ...baseItems,
        { key: 'acknowledgments', label: 'My Tasks', icon: CheckSquare },
      ];
    }

    // Auditor
    return [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'sops', label: 'SOPs', icon: FileText },
      { key: 'reports', label: 'Reports', icon: BarChart3 },
    ];
  };

  const navItems = getNavItems(currentUser.role);

  return (
    <nav className="glass-effect border-b border-white/20 fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
      <div className="px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">R</span>
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-violet-300 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Rafton
              </span>
            </div>
            
            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.key;
                
                return (
                  <Button
                    key={item.key}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => onNavigate(item.key as Page)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30' 
                        : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 hover:bg-violet-50/80 rounded-xl px-3 py-2">
                <Avatar className="w-9 h-9 ring-2 ring-violet-200">
                  <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white font-semibold">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-violet-600 capitalize font-medium">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 border-violet-200/50 shadow-xl">
              <div className="px-3 py-3 border-b border-violet-100">
                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-violet-600">{currentUser.email}</p>
              </div>
              
              <DropdownMenuItem onClick={() => onNavigate('settings')} className="flex items-center py-2 hover:bg-violet-50">
                <Settings className="w-4 h-4 mr-3 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-violet-100" />
              
              <DropdownMenuItem onClick={onLogout} className="text-red-600 hover:bg-red-50 flex items-center py-2">
                <LogOut className="w-4 h-4 mr-3" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}