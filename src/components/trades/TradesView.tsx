import React, { useMemo } from 'react';
import { Download, Upload, BarChart3, TrendingUp, Target, Calculator, Ratio, ArrowUpCircle, ArrowDownCircle, X, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TradeFilters from './TradeFilters';
import TradeTable from './TradeTable';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../context/AccountsContext';
import { useState, useEffect } from 'react';
import { Trade } from '../../types/trade';
import TradeForm from '../journal/TradeForm';

const TradesView: React.FC = () => {
  const { trades, loading, updateTrade, deleteTrade } = useTrades();
  const { selectedAccountId } = useAccounts();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    symbol: '',
    type: 'all' as 'all' | 'long' | 'short',
    setup: '',
    minPnL: '',
    maxPnL: '',
    tags: [] as string[]
  });
  // States to track which KPI card is active as filter
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | null>(null);
  const [isTableLoading, setIsTableLoading] = useState(false);
  
  // Estado para o modal de detalhes do trade
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  
  // Estados para edição e exclusão de trades
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Simular carregamento da tabela quando os filtros mudam
  useEffect(() => {
    const simulateLoading = () => {
      setIsTableLoading(true);
      setTimeout(() => {
        setIsTableLoading(false);
      }, 800);
    };

    simulateLoading();
  }, [filters, activeKpiFilter]);

  // Primeiro filtrar por conta selecionada
  const accountFilteredTrades = useMemo(() => {
    if (!selectedAccountId) return trades; // Se nenhuma conta selecionada, mostrar todos os trades
    return trades.filter(trade => trade.accountId === selectedAccountId);
  }, [trades, selectedAccountId]);

  const filteredTrades = useMemo(() => {
    return accountFilteredTrades.filter(trade => {
      // Date range filter
      if (filters.dateRange.start && trade.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && trade.date > filters.dateRange.end) return false;
      
      // Symbol filter
      if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) return false;
      
      // Type filter
      if (filters.type !== 'all' && trade.type !== filters.type) return false;
      
      // Setup filter
      if (filters.setup && trade.setup !== filters.setup) return false;
      
      // P&L range filter
      if (filters.minPnL && trade.pnl < parseFloat(filters.minPnL)) return false;
      if (filters.maxPnL && trade.pnl > parseFloat(filters.maxPnL)) return false;
      
      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some(tag => trade.tags.includes(tag))) return false;
      
      // KPI quick filters
      if (activeKpiFilter === 'winRate' && trade.pnl <= 0) return false;
      if (activeKpiFilter === 'lossRate' && trade.pnl >= 0) return false;
      if (activeKpiFilter === 'avgGain' && trade.pnl <= 0) return false;
      if (activeKpiFilter === 'avgLoss' && trade.pnl >= 0) return false;
      if (activeKpiFilter === 'avgRR' && trade.riskRewardRatio <= 0) return false;
      
      return true;
    });
  }, [accountFilteredTrades, filters, activeKpiFilter]);

  const stats = useMemo(() => {
    const totalTrades = filteredTrades.length;
    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
    
    const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;
    const avgTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;
    
    // New calculated KPIs
    const avgRiskReward = totalTrades > 0 
      ? filteredTrades.reduce((sum, trade) => sum + trade.riskRewardRatio, 0) / totalTrades 
      : 0;
    
    const avgWin = winningTrades.length > 0 
      ? totalWinAmount / winningTrades.length 
      : 0;
    
    const avgLoss = losingTrades.length > 0 
      ? totalLossAmount / losingTrades.length 
      : 0;
    
    return {
      totalTrades,
      totalPnL,
      winRate,
      profitFactor,
      avgTrade,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      avgRiskReward,
      avgWin,
      avgLoss
    };
  }, [filteredTrades]);

  const clearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      symbol: '',
      type: 'all',
      setup: '',
      minPnL: '',
      maxPnL: '',
      tags: []
    });
    setActiveKpiFilter(null);
  };

  const handleExport = () => {
    // Create CSV header
    let csvContent = "Date,Symbol,Type,P&L,Notes\n";
    
    // Create CSV rows from filteredTrades
    filteredTrades.forEach(trade => {
      // Format date
      const formattedDate = trade.date;
      
      // Handle notes that might contain commas by wrapping in quotes
      const formattedNotes = trade.notes ? `"${trade.notes}"` : '';
      
      // Create the CSV row
      const row = [
        formattedDate,
        trade.symbol,
        trade.type,
        trade.pnl,
        formattedNotes
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', "traderlog_pro_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    // Navigate to the import page
    navigate('/accounts/new');
  };

  // Handle KPI card click to toggle filters
  const handleKpiCardClick = (kpiType: string) => {
    if (activeKpiFilter === kpiType) {
      setActiveKpiFilter(null);
    } else {
      setActiveKpiFilter(kpiType);
    }
  };

  // Handle tag click from table
  const handleTagClick = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters({
        ...filters,
        tags: [...filters.tags, tag]
      });
    }
  };

  // Handle trade click for details
  const handleTradeClick = (trade: Trade) => {
    console.log('🔄 Visualizando detalhes do trade:', trade.id);
    console.log('📊 Dados do trade:', trade);
    
    if (trade.screenshotUrl) {
      console.log('🖼️ Screenshot URL:', trade.screenshotUrl);
      // Verificar se a URL é válida
      try {
        const url = new URL(trade.screenshotUrl);
        console.log('✅ URL do screenshot é válida:', url.toString());
      } catch (e) {
        console.error('❌ URL do screenshot é inválida:', trade.screenshotUrl);
      }
    } else {
      console.log('⚠️ Este trade não possui screenshot');
    }
    
    setSelectedTrade(trade);
    setShowTradeDetails(true);
  };
  
  // Função para lidar com a edição de trades
  const handleEditTrade = (trade: Trade) => {
    console.log('✏️ Editando trade:', trade.id);
    setTradeToEdit(trade);
    setIsEditModalOpen(true);
  };
  
  // Função para lidar com a exclusão de trades
  const handleDeleteTrade = (trade: Trade) => {
    console.log('🗑️ Solicitação para excluir trade:', trade.id);
    setTradeToDelete(trade);
    setIsDeleteConfirmOpen(true);
  };
  
  // Função para confirmar a exclusão de um trade
  const confirmDeleteTrade = async () => {
    if (!tradeToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('🗑️ Excluindo trade:', tradeToDelete.id);
      await deleteTrade(tradeToDelete.id);
      console.log('✅ Trade excluído com sucesso');
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error('❌ Erro ao excluir trade:', error);
      alert('Erro ao excluir trade. Por favor, tente novamente.');
    } finally {
      setIsDeleting(false);
      setTradeToDelete(null);
    }
  };
  
  // Função para salvar as edições de um trade
  const handleSaveTradeEdit = async (updatedTradeData: Partial<Trade>) => {
    if (!tradeToEdit) return;
    
    try {
      console.log('💾 Salvando edições do trade:', tradeToEdit.id);
      console.log('📊 Dados atualizados:', updatedTradeData);
      
      await updateTrade(tradeToEdit.id, updatedTradeData);
      console.log('✅ Trade atualizado com sucesso');
      
      setIsEditModalOpen(false);
      setTradeToEdit(null);
    } catch (error) {
      console.error('❌ Erro ao atualizar trade:', error);
      alert('Erro ao salvar as alterações. Por favor, tente novamente.');
    }
  };
  
  // Handle screenshot click in the trade details modal
  const handleScreenshotClick = () => {
    if (!selectedTrade?.screenshotUrl) {
      console.error('❌ Tentativa de exibir screenshot, mas a URL não está definida!');
      alert('Não foi possível exibir o screenshot. URL não encontrada.');
      return;
    }
    
    console.log('🖼️ Abrindo screenshot em tamanho completo:', selectedTrade.screenshotUrl);
    setShowScreenshot(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Trade Management
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Comprehensive trade tracking and analysis
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleImport}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Importar por Arquivo</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <Download className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Original KPI Cards */}
        <div 
          onClick={() => handleKpiCardClick('totalTrades')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'totalTrades' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white">
                {stats.totalTrades}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total Trades
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleKpiCardClick('pnl')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'pnl' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              stats.totalPnL >= 0 
                ? 'bg-profit-100 dark:bg-profit-900/30' 
                : 'bg-loss-100 dark:bg-loss-900/30'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                stats.totalPnL >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`} />
            </div>
            <div>
              <div className={`text-xl font-bold ${
                stats.totalPnL >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`}>
                ${stats.totalPnL.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Total P&L
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleKpiCardClick('winRate')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'winRate' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
              <Target className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Win Rate
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleKpiCardClick('profitFactor')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'profitFactor' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Calculator className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white">
                {stats.profitFactor.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Profit Factor
              </div>
            </div>
          </div>
        </div>

        {/* New KPI Cards */}
        <div 
          onClick={() => handleKpiCardClick('avgRR')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'avgRR' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Ratio className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-neutral-900 dark:text-white">
                {stats.avgRiskReward.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                R:R Médio
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleKpiCardClick('avgGain')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'avgGain' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-profit-100 dark:bg-profit-900/30 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-profit-600 dark:text-profit-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-profit-600 dark:text-profit-400">
                ${stats.avgWin.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Ganho Médio
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => handleKpiCardClick('avgLoss')}
          className={`bg-white dark:bg-neutral-900 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
            activeKpiFilter === 'avgLoss' 
              ? 'border-primary-500 ring-2 ring-primary-500/30 shadow-lg' 
              : 'border-neutral-200 dark:border-neutral-700'
          } p-4`}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-loss-100 dark:bg-loss-900/30 rounded-lg">
              <ArrowDownCircle className="w-5 h-5 text-loss-600 dark:text-loss-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-loss-600 dark:text-loss-400">
                ${stats.avgLoss.toFixed(2)}
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Perda Média
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Indicators */}
      <div className="flex flex-wrap gap-2">
        {/* KPI quick filter indicator if active */}
        {activeKpiFilter && (
          <div className="flex items-center bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-lg px-3 py-1.5">
            <span className="text-primary-700 dark:text-primary-300 font-medium text-sm">
              {
                activeKpiFilter === 'winRate' ? 'Only Winning Trades' :
                activeKpiFilter === 'lossRate' ? 'Only Losing Trades' :
                activeKpiFilter === 'avgGain' ? 'Only Profitable Trades' :
                activeKpiFilter === 'avgLoss' ? 'Only Loss Trades' :
                activeKpiFilter === 'avgRR' ? 'Only Positive R:R Trades' :
                'Active Filter'
              }
            </span>
            <button 
              onClick={() => setActiveKpiFilter(null)}
              className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Tag filters */}
        {filters.tags.map(tag => (
          <div 
            key={tag}
            className="flex items-center bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800/50 rounded-lg px-3 py-1.5"
          >
            <span className="text-secondary-700 dark:text-secondary-300 font-medium text-sm">
              Tag: {tag}
            </span>
            <button 
              onClick={() => setFilters({
                ...filters,
                tags: filters.tags.filter(t => t !== tag)
              })}
              className="ml-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-800 dark:hover:text-secondary-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Filters */}
      <TradeFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      {/* Results Summary */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
              Trade Results
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Showing {filteredTrades.length} of {trades.length} trades
            </p>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-profit-600 dark:text-profit-400">
                {stats.winningTrades}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-loss-600 dark:text-loss-400">
                {stats.losingTrades}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">Losses</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${
                stats.avgTrade >= 0 
                  ? 'text-profit-600 dark:text-profit-400' 
                  : 'text-loss-600 dark:text-loss-400'
              }`}>
                ${stats.avgTrade.toFixed(2)}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">Avg Trade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <TradeTable 
        trades={filteredTrades} 
        onTradeClick={handleTradeClick}
        onTagClick={handleTagClick}
        isLoading={isTableLoading}
        onEditTrade={handleEditTrade}
        onDeleteTrade={handleDeleteTrade}
      />
      
      {/* Modal de Detalhes do Trade */}
      {showTradeDetails && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  {selectedTrade.symbol} - Trade Details
                </h2>
                <button
                  onClick={() => setShowTradeDetails(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Debug Info - Removido em produção */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4 text-xs">
                  <p><strong>Debug:</strong> {selectedTrade.id}</p>
                  <p><strong>Screenshot URL:</strong> {selectedTrade.screenshotUrl || 'Não definida'}</p>
                </div>
              )}
            
              {/* Screenshot Preview (if available) */}
              {selectedTrade.screenshotUrl ? (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    Screenshot
                  </h3>
                  <div className="relative overflow-hidden rounded-lg cursor-pointer" onClick={handleScreenshotClick}>
                    <div className="aspect-w-16 aspect-h-9 bg-neutral-100 dark:bg-neutral-800">
                      <img 
                        src={selectedTrade.screenshotUrl} 
                        alt={`Screenshot for ${selectedTrade.symbol} trade`} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error('❌ Erro ao carregar imagem:', e);
                          // Fallback para uma imagem de erro
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error+Loading+Image';
                          // Ou ocultar a imagem
                          // (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <Image className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Image className="w-8 h-8 text-neutral-400 mb-2" strokeWidth={1.5} />
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Este trade não possui screenshot.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Trade Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Date</h3>
                  <p className="text-neutral-900 dark:text-white">{new Date(selectedTrade.date).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Type</h3>
                  <p className={`${selectedTrade.type === 'long' ? 'text-profit-600 dark:text-profit-400' : 'text-loss-600 dark:text-loss-400'}`}>
                    {selectedTrade.type.toUpperCase()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Entry Price</h3>
                  <p className="text-neutral-900 dark:text-white">${selectedTrade.entryPrice.toFixed(2)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Exit Price</h3>
                  <p className="text-neutral-900 dark:text-white">${selectedTrade.exitPrice.toFixed(2)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Quantity</h3>
                  <p className="text-neutral-900 dark:text-white">{selectedTrade.quantity}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">P&L</h3>
                  <p className={`${selectedTrade.pnl >= 0 ? 'text-profit-600 dark:text-profit-400' : 'text-loss-600 dark:text-loss-400'}`}>
                    ${selectedTrade.pnl.toFixed(2)} ({selectedTrade.pnlPercentage.toFixed(2)}%)
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Setup</h3>
                  <p className="text-neutral-900 dark:text-white">{selectedTrade.setup}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">R:R Ratio</h3>
                  <p className="text-neutral-900 dark:text-white">{selectedTrade.riskRewardRatio.toFixed(2)}</p>
                </div>
              </div>
              
              {/* Tags */}
              {selectedTrade.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrade.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {selectedTrade.notes && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Notes</h3>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <p className="text-neutral-900 dark:text-white whitespace-pre-wrap">{selectedTrade.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={() => {
                    setShowTradeDetails(false);
                    handleEditTrade(selectedTrade);
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Edit Trade
                </button>
                <button
                  onClick={() => setShowTradeDetails(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Edição de Trade */}
      {isEditModalOpen && tradeToEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Edit Trade: {tradeToEdit.symbol}
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <TradeForm 
                initialValues={tradeToEdit}
                onSubmit={handleSaveTradeEdit}
                onCancel={() => setIsEditModalOpen(false)}
                isEdit={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      {isDeleteConfirmOpen && tradeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Confirm Delete
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete this trade for <span className="font-medium text-neutral-900 dark:text-white">{tradeToDelete.symbol}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTrade}
                  className="px-4 py-2 bg-loss-600 text-white rounded-lg hover:bg-loss-700 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Trade'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Screenshot Modal */}
      {showScreenshot && selectedTrade?.screenshotUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setShowScreenshot(false)}
              className="absolute -top-12 right-0 bg-white dark:bg-neutral-800 rounded-full p-2 shadow-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <X className="w-6 h-6 text-neutral-500" />
            </button>
            <img 
              src={selectedTrade.screenshotUrl} 
              alt={`Screenshot for ${selectedTrade.symbol} trade`} 
              className="w-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem em tamanho completo');
                // Fallback para uma imagem de erro
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x600?text=Error+Loading+Image';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TradesView;