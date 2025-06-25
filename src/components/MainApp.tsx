import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Dashboard from './dashboard/Dashboard';
import DailyJournal from './journal/DailyJournal';
import TradesView from './trades/TradesView';
import SettingsPage from './settings/SettingsPage';
import PlaceholderTab from './PlaceholderTab';
import AIInsightsPage from '../pages/AIInsightsPage';
import AccountsPage from '../pages/accounts/index';
import NewAccountPage from '../pages/accounts/new';
import EditAccountPage from '../pages/accounts/edit';
import ChallengeDashboardPage from '../pages/challenges/[id]';
import AccountSelector from './layout/AccountSelector';
import LanguageSwitcher from './ui/LanguageSwitcher';
import { useAccounts } from '../context/AccountsContext';
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
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { syncWithDatabase } = useAccounts();
  
  // Sincroniza as contas quando o componente é montado
  useEffect(() => {
    const syncAccounts = async () => {
      try {
        console.log('🔄 MainApp: Sincronizando contas ao montar o componente...');
        await syncWithDatabase();
        console.log('✅ MainApp: Contas sincronizadas com sucesso');
        
        // Mostrar uma notificação discreta informando sobre a sincronização automática
        toast.success('Sincronização automática ativada', {
          icon: '🔄'
        });
      } catch (error) {
        console.error('❌ MainApp: Erro ao sincronizar contas', error);
        toast.error('Erro ao sincronizar contas', {
          icon: '❌'
        });
      }
    };
    
    syncAccounts();
    
    // Configurar sincronização automática a cada 5 minutos (300000 ms)
    const autoSyncInterval = setInterval(async () => {
      try {
        console.log('🔄 MainApp: Sincronização automática iniciada...');
        await syncWithDatabase();
        console.log('✅ MainApp: Sincronização automática concluída');
      } catch (error) {
        console.error('❌ MainApp: Erro na sincronização automática', error);
        toast.error('Erro na sincronização automática', {
          icon: '❌'
        });
      }
    }, 300000);
    
    // Limpar intervalo quando o componente for desmontado
    return () => {
      clearInterval(autoSyncInterval);
    };
  }, [syncWithDatabase]);
  
  // Atualiza a aba ativa com base na rota atual
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/' || path === '') {
      setActiveTab('dashboard');
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
        {/* Header com seletor de conta e seletor de idioma */}
        <div className="max-w-screen-2xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
            {activeTab === 'dashboard' ? (
              <div>
                <div className="text-lg font-bold text-neutral-900 dark:text-white">
                  Dashboard - Todas as Contas
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Última atualização: {new Date().toLocaleDateString('pt-BR', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'journal' && t('sidebar.daily_journal')}
                {activeTab === 'trades' && t('sidebar.trades')}
                {activeTab === 'notebook' && t('sidebar.notebook')}
                {activeTab === 'accounts' && t('sidebar.accounts')}
                {activeTab === 'ai-insights' && t('sidebar.ai_insights')}
                {activeTab === 'settings' && t('sidebar.settings')}
              </>
            )}
          </h1>
          <div className="flex items-center space-x-4">
            {/* Seletor de idioma sempre visível */}
            <LanguageSwitcher />
            
            {/* Não mostrar o seletor de conta na página de contas ou configurações */}
            {activeTab !== 'accounts' && activeTab !== 'settings' && (
              <AccountSelector />
            )}
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto">
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
            
            {/* Rotas de Contas */}
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/new" element={<NewAccountPage />} />
            <Route path="/accounts/:accountId/edit" element={<EditAccountPage />} />
            <Route path="/accounts/:id" element={<ChallengeDashboardPage />} />
            
            {/* Redirecionar rotas de desafios para contas */}
            <Route path="/challenges" element={<AccountsPage />} />
            <Route path="/challenges/:id" element={<ChallengeDashboardPage />} />
            
            {/* Rota padrão */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default MainApp;