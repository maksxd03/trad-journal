import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import TradeForm from './TradeForm';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../context/AccountsContext';
import DailyAccordionCard from './DailyAccordionCard';
import { Trade } from '../../types/trade';

interface GroupedTrade {
  date: string;
  trades: Trade[];
  stats: {
    totalPnL: number;
    winRate: number;
    avgTrade: number;
    avgWin: number;
    avgLoss: number;
  };
}

const DailyJournal: React.FC = () => {
  const { t } = useTranslation();
  const { trades, addTrade, loading } = useTrades();
  const { accounts, selectedAccountId, selectAccount, syncWithDatabase } = useAccounts();
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSetup, setFilterSetup] = useState('');
  const dayRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const location = useLocation();

  // Sincronizar contas ao carregar o componente
  useEffect(() => {
    syncWithDatabase();
  }, [syncWithDatabase]);

  // Verificar se deve abrir o modal de adição de trade automaticamente
  // e se há um ID de conta selecionado no state de navegação
  useEffect(() => {
    if (location.state) {
      // Verificar se deve abrir o modal
      if ((location.state as any).openAddTradeModal) {
        setShowTradeForm(true);
      }
      
      // Verificar se há um ID de conta para selecionar
      if ((location.state as any).selectedAccountId) {
        selectAccount((location.state as any).selectedAccountId);
        console.log(`🔍 Selecionando conta ${(location.state as any).selectedAccountId} a partir da navegação`);
      }

      // Limpar o estado para não aplicar novamente se a página for recarregada
      window.history.replaceState({}, document.title);
    }
  }, [location, selectAccount]);

  // Filter trades based on search, setup, and selected account
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = searchTerm === '' || 
                         trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.setup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trade.notes && trade.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trade.tags && trade.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesSetup = filterSetup === '' || trade.setup === filterSetup;
    const matchesAccount = !selectedAccountId || trade.accountId === selectedAccountId;
    
    return matchesSearch && matchesSetup && matchesAccount;
  });

  // Group trades by date with enhanced statistics
  const groupedTradesByDate = React.useMemo(() => {
    const groupedData: Record<string, Trade[]> = {};
    
    filteredTrades.forEach(trade => {
      if (!groupedData[trade.date]) {
        groupedData[trade.date] = [];
      }
      groupedData[trade.date].push(trade);
    });
    
    // Convert to array with statistics and sort by date (newest first)
    return Object.entries(groupedData)
      .map(([date, dayTrades]) => {
        // Calculate statistics for each day
        const totalPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        const winningTrades = dayTrades.filter(trade => trade.pnl > 0);
        const losingTrades = dayTrades.filter(trade => trade.pnl < 0);
        const winRate = dayTrades.length > 0 ? (winningTrades.length / dayTrades.length) * 100 : 0;
        const avgTrade = dayTrades.length > 0 ? totalPnL / dayTrades.length : 0;
        const avgWin = winningTrades.length > 0 
          ? winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length 
          : 0;
        const avgLoss = losingTrades.length > 0 
          ? losingTrades.reduce((sum, trade) => sum + Math.abs(trade.pnl), 0) / losingTrades.length 
          : 0;

        return { 
          date, 
          trades: dayTrades,
          stats: {
            totalPnL,
            winRate,
            avgTrade,
            avgWin,
            avgLoss
          }
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredTrades]);

  const handleAddTrade = async (tradeData: any) => {
    try {
      await addTrade(tradeData);
      setShowTradeForm(false);
    } catch (error) {
      console.error('Failed to add trade:', error);
    }
  };

  const handleTradeClick = (trade: any) => {
    console.log('Viewing trade details:', trade.id);
    // Logic for displaying trade details or navigating to details page
  };

  // Setup options for filter dropdown
  const setupOptions = ['Breakout', 'Pullback', 'Reversal', 'Gap Fill', 'Momentum', 'Support/Resistance'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">{t('journal.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t('journal.title')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            {t('journal.subtitle')}
          </p>
        </div>
        
        <button
          onClick={() => setShowTradeForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>{t('journal.buttons.add_trade')}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder={t('journal.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <select
                value={filterSetup}
                onChange={(e) => setFilterSetup(e.target.value)}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('journal.all_setups')}</option>
                {setupOptions.map(setup => (
                  <option key={setup} value={setup}>{setup}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-neutral-500" />
              <select
                value={selectedAccountId || ''}
                onChange={(e) => selectAccount(e.target.value || null)}
                className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t('all_accounts')}</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feed of Daily Accordion Cards */}
        <div className="space-y-4">
          {groupedTradesByDate.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center shadow-sm">
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {t('journal.no_trades')}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterSetup('');
                  selectAccount(null);
                }}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                {t('journal.buttons.clear_filters')}
              </button>
            </div>
          ) : (
            groupedTradesByDate.map((dayData: GroupedTrade) => (
              <div 
                key={dayData.date} 
                ref={el => dayRefs.current[dayData.date] = el}
              >
                <DailyAccordionCard 
                  date={dayData.date} 
                  trades={dayData.trades}
                  onTradeClick={handleTradeClick}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trade Form Modal */}
      {showTradeForm && (
        <TradeForm
          onSubmit={handleAddTrade}
          onCancel={() => setShowTradeForm(false)}
        />
      )}
    </div>
  );
};

export default DailyJournal;