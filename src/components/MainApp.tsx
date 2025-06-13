import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from './dashboard/Dashboard';
import DailyJournal from './journal/DailyJournal';
import TradesView from './trades/TradesView';
import SettingsPage from './settings/SettingsPage';
import PlaceholderTab from './PlaceholderTab';
import AIInsightsPage from '../pages/AIInsightsPage';
import ChallengesPage from '../pages/challenges';
import NewChallengePage from '../pages/challenges/new';
import ChallengeDashboardPage from '../pages/challenges/[id]';
import AccountsPage from '../pages/AccountsPage';
import NewAccountPage from '../pages/accounts/new';
import { 
  Calendar, 
  TrendingUp, 
  FileText, 
  TestTube, 
  RotateCcw, 
  BookOpen, 
  GraduationCap, 
  Play,
  Brain,
  Trophy,
  Wallet
} from 'lucide-react';

interface MainAppProps {
  initialTab?: string;
}

const MainApp: React.FC<MainAppProps> = ({ initialTab = 'dashboard' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Atualiza a aba ativa com base na rota atual
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '') {
      setActiveTab('dashboard');
    } else if (path.startsWith('/challenges')) {
      setActiveTab('challenges');
    } else if (path.startsWith('/accounts')) {
      setActiveTab('accounts');
    } else if (path === '/journal') {
      setActiveTab('journal');
    } else if (path === '/trades') {
      setActiveTab('trades');
    } else if (path === '/notebook') {
      setActiveTab('notebook');
    } else if (path === '/ai-insights') {
      setActiveTab('ai-insights');
    } else if (path === '/settings') {
      setActiveTab('settings');
    }
  }, [location.pathname]);

  // Função para renderizar o conteúdo placeholder para abas não implementadas
  const renderPlaceholder = (title: string, icon: any, description: string, features: string[]) => {
    return (
      <PlaceholderTab
        title={title}
        description={description}
        icon={icon}
        features={features}
      />
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          
          // Navegação baseada na aba selecionada
          switch (tab) {
            case 'dashboard':
              navigate('/');
              break;
            case 'journal':
              navigate('/journal');
              break;
            case 'trades':
              navigate('/trades');
              break;
            case 'notebook':
              navigate('/notebook');
              break;
            case 'challenges':
              navigate('/challenges');
              break;
            case 'accounts':
              navigate('/accounts');
              break;
            case 'ai-insights':
              navigate('/ai-insights');
              break;
            case 'settings':
              navigate('/settings');
              break;
            default:
              navigate('/');
          }
        }}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        p-4 lg:p-8
      `}>
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<DailyJournal />} />
            <Route path="/trades" element={<TradesView />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/notebook" element={renderPlaceholder(
              "Trading Notebook",
              FileText,
              "Document your trading strategies, market observations, and learning progress in an organized notebook.",
              [
                'Markdown-based note taking',
                'Strategy documentation',
                'Market analysis notes',
                'Image and chart attachments',
                'Tag-based organization',
                'Search and filter notes'
              ]
            )} />
            
            {/* Rotas de Desafios */}
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/challenges/new" element={<NewChallengePage />} />
            <Route path="/challenges/:id" element={<ChallengeDashboardPage />} />
            
            {/* Rotas de Contas */}
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/new" element={<NewAccountPage />} />
            
            {/* Rota padrão */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainApp;