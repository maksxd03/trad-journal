import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  BookOpen, 
  TestTube, 
  RotateCcw, 
  Play, 
  GraduationCap,
  TrendingUp,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  Activity,
  LogOut,
  User,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Brain,
  Trophy,
  Wallet
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserName();
    if (name.includes(' ')) {
      const parts = name.split(' ');
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: BarChart3 },
    { id: 'journal', label: t('sidebar.daily_journal'), icon: Calendar },
    { id: 'trades', label: t('sidebar.trades'), icon: TrendingUp },
    { id: 'notebook', label: t('sidebar.notebook'), icon: FileText },
    { id: 'accounts', label: t('sidebar.accounts'), icon: Wallet },
    { id: 'ai-insights', label: t('sidebar.ai_insights'), icon: Brain },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-800 border-r border-neutral-700
        transition-all duration-300 z-40 flex flex-col
        ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">TraderLog Pro</h1>
                <p className="text-xs text-neutral-400">Professional Trading Journal</p>
              </div>
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault(); // Previne comportamento padrão
              onToggleCollapse();
            }}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault(); // Previne comportamento padrão
                  onTabChange(item.id);
                  if (window.innerWidth < 1024) onToggleCollapse();
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' 
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }
                  ${isCollapsed && 'justify-center lg:px-2'}
                `}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'flex-shrink-0'}`} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 bg-secondary-500 text-white text-xs font-bold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-500 rounded-full"></div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-2 border-t border-neutral-700">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group relative
              text-neutral-300 hover:bg-neutral-800 hover:text-white
              ${isCollapsed && 'justify-center lg:px-2'}
            `}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!isCollapsed && (
              <span className="font-medium text-sm">
                {isDark ? t('sidebar.light_mode') : t('sidebar.dark_mode')}
              </span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {isDark ? t('sidebar.light_mode') : t('sidebar.dark_mode')}
              </div>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors group relative
                text-neutral-300 hover:bg-neutral-800 hover:text-white
                ${isCollapsed && 'justify-center lg:px-2'}
                ${showUserMenu ? 'bg-neutral-800 text-white' : ''}
              `}
            >
              <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                {getUserInitials()}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <span className="font-medium text-sm block truncate">
                      {getUserName()}
                    </span>
                    <span className="text-xs text-neutral-400 block truncate">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {getUserName()}
                </div>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    onTabChange('settings');
                    setShowUserMenu(false);
                    if (window.innerWidth < 1024) onToggleCollapse();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">{t('sidebar.settings')}</span>
                </button>
                
                <div className="border-t border-neutral-700"></div>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-loss-600 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t('sidebar.sign_out')}</span>
                </button>
              </div>
            )}

            {/* Collapsed User Menu */}
            {showUserMenu && isCollapsed && (
              <div className="absolute bottom-full left-full ml-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden min-w-48">
                <div className="px-4 py-3 border-b border-neutral-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate">
                        {getUserName()}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    onTabChange('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">{t('sidebar.settings')}</span>
                </button>
                
                <div className="border-t border-neutral-700"></div>
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-loss-600 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t('sidebar.sign_out')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;