import React from 'react';
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
  Activity
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

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
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'journal', label: 'Daily Journal', icon: Calendar },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'notebook', label: 'Notebook', icon: FileText },
    { id: 'backtesting', label: 'Backtesting', icon: TestTube, badge: 'NEW' },
    { id: 'replay', label: 'Trade Replay', icon: RotateCcw },
    { id: 'playbook', label: 'Playbooks', icon: BookOpen, badge: 'NEW' },
    { id: 'mentor', label: 'Mentor Mode', icon: GraduationCap },
    { id: 'insights', label: 'Insights', icon: Play }
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
        transition-all duration-300 z-50
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
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5 lg:hidden" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
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
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
              text-neutral-300 hover:bg-neutral-800 hover:text-white
              ${isCollapsed && 'justify-center lg:px-2'}
            `}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!isCollapsed && (
              <span className="font-medium text-sm">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          {!isCollapsed && (
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-neutral-300 hover:bg-neutral-800 hover:text-white">
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">Settings</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;