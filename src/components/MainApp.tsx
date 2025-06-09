import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './dashboard/Dashboard';
import DailyJournal from './journal/DailyJournal';
import TradesView from './trades/TradesView';
import PlaceholderTab from './PlaceholderTab';
import { 
  Calendar, 
  TrendingUp, 
  FileText, 
  TestTube, 
  RotateCcw, 
  BookOpen, 
  GraduationCap, 
  Play 
} from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'journal':
        return <DailyJournal />;
      case 'trades':
        return <TradesView />;
      case 'notebook':
        return (
          <PlaceholderTab
            title="Trading Notebook"
            description="Document your trading strategies, market observations, and learning progress in an organized notebook."
            icon={FileText}
            features={[
              'Markdown-based note taking',
              'Strategy documentation',
              'Market analysis notes',
              'Image and chart attachments',
              'Tag-based organization',
              'Search and filter notes'
            ]}
          />
        );
      case 'backtesting':
        return (
          <PlaceholderTab
            title="Backtesting Engine"
            description="Test your trading strategies against historical data to validate performance and optimize parameters."
            icon={TestTube}
            features={[
              'Historical data backtesting',
              'Strategy parameter optimization',
              'Monte Carlo simulation',
              'Risk metrics calculation',
              'Performance comparison',
              'Strategy validation reports'
            ]}
          />
        );
      case 'replay':
        return (
          <PlaceholderTab
            title="Trade Replay"
            description="Visualize and replay your trades with market context to analyze decision-making and improve performance."
            icon={RotateCcw}
            features={[
              'Visual trade replay with charts',
              'Market context analysis',
              'Entry/exit point visualization',
              'Trade timeline reconstruction',
              'Decision point analysis',
              'Performance attribution'
            ]}
          />
        );
      case 'playbook':
        return (
          <PlaceholderTab
            title="Trading Playbook"
            description="Create and manage your trading playbook with setup documentation, rules, and strategy guides."
            icon={BookOpen}
            features={[
              'Setup documentation with images',
              'Trading rules and checklists',
              'Strategy performance tracking',
              'Setup success rate analysis',
              'Risk management rules',
              'Playbook sharing and export'
            ]}
          />
        );
      case 'mentor':
        return (
          <PlaceholderTab
            title="Mentor Mode"
            description="AI-powered trading mentor that provides personalized insights, suggestions, and learning recommendations."
            icon={GraduationCap}
            features={[
              'Personalized trading insights',
              'Performance improvement suggestions',
              'Risk management recommendations',
              'Learning path guidance',
              'Market education content',
              'Progress tracking and goals'
            ]}
          />
        );
      case 'insights':
        return (
          <PlaceholderTab
            title="Insights & Reports"
            description="Advanced analytics and reporting tools to gain deep insights into your trading performance and patterns."
            icon={Play}
            features={[
              'Advanced performance analytics',
              'Custom report generation',
              'Trading pattern analysis',
              'Risk assessment reports',
              'Performance benchmarking',
              'Automated insights generation'
            ]}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        p-4 lg:p-8
      `}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default MainApp;