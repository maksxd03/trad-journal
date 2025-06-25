import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Wallet, 
  AlertCircle, 
  Filter,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAccounts } from '../../context/AccountsContext';
import { useTrades } from '../../hooks/useTrades';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useTranslation } from 'react-i18next';
import DeleteAccountModal from '../../components/accounts/DeleteAccountModal';

// Componente de Card para os KPIs
const KPICard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</div>
        {Icon && (
          <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
            <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</div>
    </div>
  );
};

const AccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const { accounts, isLoading, deleteAccount, syncWithDatabase } = useAccounts();
  const { trades } = useTrades();
  const [filter, setFilter] = useState<'all' | 'prop_firm_challenge' | 'personal_live' | 'personal_paper'>('all');
  const navigate = useNavigate();
  
  // Estado para controlar o modal de exclusão
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // Adicionar referência para os botões de menu
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  // Adicionar estado para posição do menu
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  
  // Sincronizar contas apenas quando a página for carregada
  useEffect(() => {
    const sync = async () => {
      await syncWithDatabase();
    };
    sync();
  }, [syncWithDatabase]);

  // Filtra as contas com base no filtro selecionado
  const filteredAccounts = accounts.filter(account => {
    if (filter === 'all') return true;
    return account.type === filter;
  });

  // Calcular os valores para os cards
  const kpiData = useMemo(() => {
    // Saldo Total Consolidado - soma dos saldos de todas as contas
    const totalBalance = accounts.reduce((sum, account) => 
      sum + (account.status?.currentEquity || 0), 0);
    
    // P&L Total (Mês Atual)
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);
    const lastDayOfMonth = endOfMonth(now);
    
    // Filtrar trades do mês atual
    const currentMonthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return isWithinInterval(tradeDate, { start: firstDayOfMonth, end: lastDayOfMonth });
    });
    
    // Calcular P&L total do mês
    const monthlyPnL = currentMonthTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    // Contas Ativas - contar contas que não estão marcadas como concluídas ou falhas
    const activeAccounts = accounts.length;
    
    return {
      totalBalance,
      monthlyPnL,
      activeAccounts
    };
  }, [accounts, trades]);

  // Função para formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Função para obter o rótulo do tipo de conta
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'prop_firm_challenge':
        return t('challenge_account');
      case 'personal_live':
        return t('real_account');
      case 'personal_paper':
        return t('demo_account');
      default:
        return t('unknown');
    }
  };

  // Função para obter a classe de cor com base no tipo de conta
  const getAccountTypeColorClass = (type: string) => {
    switch (type) {
      case 'prop_firm_challenge':
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400';
      case 'personal_live':
        return 'bg-profit-100 dark:bg-profit-900/30 text-profit-700 dark:text-profit-400';
      case 'personal_paper':
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
      default:
        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
    }
  };

  // Estado para controlar o menu de ações
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Função para alternar o menu de ações
  const toggleMenu = (accountId: string) => {
    if (activeMenu === accountId) {
      setActiveMenu(null);
      setMenuPosition(null);
    } else {
      setActiveMenu(accountId);
      
      // Calcular posição do menu com base na posição do botão
      const buttonElement = menuButtonRefs.current[accountId];
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        const menuWidth = 180; // Largura aproximada do menu
        
        // Verificar se o menu ficará fora da tela à direita
        let left = rect.right - menuWidth;
        if (left < 10) {
          // Se ficar muito à esquerda, alinhar com a borda esquerda + margem
          left = 10;
        } else if (left + menuWidth > window.innerWidth - 10) {
          // Se ficar muito à direita, alinhar com a borda direita - largura - margem
          left = window.innerWidth - menuWidth - 10;
        }
        
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: left
        });
      }
    }
  };

  // Função para navegar para o dashboard da conta
  const viewAccount = (accountId: string) => {
    navigate(`/accounts/${accountId}`);
    setActiveMenu(null);
  };

  // Função para editar a conta
  const editAccount = (accountId: string) => {
    navigate(`/accounts/${accountId}/edit`);
    setActiveMenu(null);
  };

  // Função para abrir o modal de exclusão
  const confirmDeleteAccount = (account: { id: string; name: string }) => {
    setAccountToDelete(account);
    setActiveMenu(null);
  };

  // Função para excluir a conta após confirmação
  const handleDeleteConfirmed = async () => {
    if (accountToDelete) {
      try {
        // Mostrar algum indicador de carregamento se necessário
        await deleteAccount(accountToDelete.id);
        setAccountToDelete(null);
        
        // Opcional: Mostrar uma notificação de sucesso
        console.log(`✅ Conta ${accountToDelete.name} excluída com sucesso`);
        // Se você tiver um sistema de notificações, poderia usar aqui
        // toast.success(`Conta ${accountToDelete.name} excluída com sucesso`);
      } catch (error) {
        console.error('Erro ao excluir conta:', error);
        // Opcional: Mostrar uma notificação de erro
        // toast.error('Erro ao excluir conta. Por favor, tente novamente.');
        
        // Fechar o modal mesmo em caso de erro
        setAccountToDelete(null);
      }
    }
  };

  // Adicionar efeito para fechar o menu quando o usuário clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu !== null) {
        // Verificar se o clique foi fora do menu
        const menuElement = document.getElementById(`menu-${activeMenu}`);
        const buttonElement = menuButtonRefs.current[activeMenu];
        
        if (menuElement && 
            !menuElement.contains(event.target as Node) && 
            buttonElement && 
            !buttonElement.contains(event.target as Node)) {
          setActiveMenu(null);
          setMenuPosition(null);
        }
      }
    };
    
    // Adicionar event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Remover event listener ao desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  // Adicionar a animação como um estilo global quando o componente montar
  useEffect(() => {
    // Criar um elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes popoverScale {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
    `;
    
    // Adicionar o elemento de estilo ao head
    document.head.appendChild(styleElement);
    
    // Remover o elemento de estilo quando o componente desmontar
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-primary-500" />
            {t('accounts')}
          </h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative inline-block">
            <button
              onClick={() => navigate('/accounts/new')}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {t('new_account')}
            </button>
          </div>
        </div>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard 
          title={t('total_balance')}
          value={formatCurrency(kpiData.totalBalance)}
          icon={Wallet}
        />
        <KPICard 
          title={t('monthly_pnl')}
          value={formatCurrency(kpiData.monthlyPnL)}
          icon={TrendingUp}
        />
        <KPICard 
          title={t('active_accounts')}
          value={kpiData.activeAccounts}
          icon={Users}
        />
      </div>
      
      {/* Filtros */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          {t('common:all')}
        </button>
        <button
          onClick={() => setFilter('personal_live')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'personal_live' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          {t('real_accounts')}
        </button>
        <button
          onClick={() => setFilter('prop_firm_challenge')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'prop_firm_challenge' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          {t('challenge_accounts')}
        </button>
        <button
          onClick={() => setFilter('personal_paper')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'personal_paper' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          {t('demo_accounts')}
        </button>
      </div>
      
      {/* Estado vazio */}
      {filteredAccounts.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 text-center shadow-sm border border-neutral-200 dark:border-neutral-700">
          <AlertCircle className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {filter === 'all' 
              ? t('no_accounts')
              : filter === 'prop_firm_challenge' 
                ? t('no_challenge_accounts')
                : filter === 'personal_live'
                  ? t('no_real_accounts')
                  : t('no_demo_accounts')
            }
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {filter === 'all' 
              ? t('create_first_account')
              : t('change_filter')
            }
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/accounts/new')}
              className="mt-6 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2 inline-block" />
              {t('create_account')}
            </button>
          )}
        </div>
      )}
      
      {/* Tabela de contas */}
      {filteredAccounts.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('account_name')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('broker_platform')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('balance')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('last_update')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('type')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredAccounts.map((account) => (
                  <tr 
                    key={account.id} 
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                    onClick={() => viewAccount(account.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">
                        {account.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {account.broker}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        account.status.currentEquity > (account.type === 'prop_firm_challenge' && account.rules ? account.rules.accountSize : 0) 
                          ? 'text-profit-600 dark:text-profit-400' 
                          : account.status.currentEquity < (account.type === 'prop_firm_challenge' && account.rules ? account.rules.accountSize : 0)
                            ? 'text-loss-600 dark:text-loss-400'
                            : 'text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {formatCurrency(account.status.currentEquity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {account.trades.length > 0 
                          ? format(new Date(account.trades[account.trades.length - 1].date), 'dd/MM/yyyy')
                          : format(new Date(account.startDate), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs ${getAccountTypeColorClass(account.type)}`}>
                        {getAccountTypeLabel(account.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <div>
                        <button 
                          ref={el => menuButtonRefs.current[account.id] = el}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(account.id);
                          }}
                          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        
                        {activeMenu === account.id && menuPosition && (
                          <div 
                            id={`menu-${account.id}`}
                            className="fixed w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 z-50 origin-top-right transition-all duration-200 ease-out transform scale-100 opacity-100" 
                            style={{
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                              animation: 'popoverScale 0.2s ease-out forwards'
                            }}
                          >
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewAccount(account.id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                role="menuitem"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t('view_dashboard')}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editAccount(account.id);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                role="menuitem"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {t('edit')}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDeleteAccount({ id: account.id, name: account.name });
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-loss-600 dark:text-loss-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                                role="menuitem"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('delete')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {accountToDelete && (
        <DeleteAccountModal
          accountName={accountToDelete.name}
          onClose={() => setAccountToDelete(null)}
          onConfirm={handleDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default AccountsPage; 