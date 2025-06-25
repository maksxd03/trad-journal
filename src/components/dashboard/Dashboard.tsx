import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Calculator,
  Wallet,
  Upload,
  Filter,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Award,
  Brain,
  AlertTriangle,
  Plus,
  FileText,
  Download,
  Users,
  Lightbulb
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import KPICard from './KPICard';
import TradingCalendar from './TradingCalendar';
import PerformanceChart from './PerformanceChart';
import RadarChart from './RadarChart';
import EquityCurve from './EquityCurve';
import DrawdownChart from './DrawdownChart';
import ReturnsDistribution from './ReturnsDistribution';
import WelcomeMessage from './WelcomeMessage';
import { useTrades } from '../../hooks/useTrades';
import { useAccounts } from '../../context/AccountsContext';
import { useNavigate } from 'react-router-dom';
import DashboardFilters, { FilterValues } from './DashboardFilters';
import DateRangePicker from './DateRangePicker';
import ReportGenerator from './ReportGenerator';
import DailyPerformance from './DailyPerformance';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { trades, loading } = useTrades();
  const { selectedAccountId, getAccount } = useAccounts();
  const [selectedPeriod, setSelectedPeriod] = useState("June 2025");
  const navigate = useNavigate();
  
  // Função auxiliar para determinar o status do score
  const getScoreStatus = (score: number) => {
    if (score >= 71) {
      return { 
        label: t('dashboard.stats.excellent', 'Excelente'), 
        className: 'bg-profit-100 text-profit-700 dark:bg-profit-900/30 dark:text-profit-300' 
      };
    }
    if (score >= 41) {
      return { 
        label: t('dashboard.stats.good', 'Bom'), 
        className: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300' 
      };
    }
    return { 
      label: t('dashboard.stats.bad', 'Ruim'), 
      className: 'bg-loss-100 text-loss-700 dark:bg-loss-900/30 dark:text-loss-300' 
    };
  };
  
  // Estados para controlar a exibição dos modais
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  
  // Estado para armazenar os filtros aplicados
  const [filters, setFilters] = useState<FilterValues>({
    startDate: new Date(2025, 5, 1).toISOString().split('T')[0], // June 1, 2025
    endDate: new Date(2025, 5, 30).toISOString().split('T')[0], // June 30, 2025
    accountId: null,
    tags: []
  });
  
  // Handlers para os botões de ação
  const handleNewTrade = () => {
    // Navega para a página do Diário com estado para abrir o modal de adição de trade
    navigate('/journal', { state: { openAddTradeModal: true } });
  };

  const handleImportData = () => {
    // Implementação futura: Modal ou página de importação de dados
    console.log('Importar dados');
    // Por enquanto, vamos apenas simular um clique em um input de arquivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Arquivo selecionado:', file.name);
        // Aqui você implementaria a lógica de processamento do arquivo
      }
    };
    input.click();
  };

  const handleGenerateReport = () => {
    setShowReportGenerator(true);
  };

  const handleFilters = () => {
    setShowFilters(true);
  };

  const handleDateRange = () => {
    setShowDateRangePicker(true);
  };
  
  // Handler para aplicar filtros
  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
    console.log('Filtros aplicados:', newFilters);
    // Aqui você implementaria a lógica para filtrar os dados com base nos filtros
  };
  
  // Handler para aplicar período
  const handleApplyDateRange = (dateRange: { startDate: string; endDate: string }) => {
    setFilters(prev => ({ ...prev, ...dateRange }));
    console.log('Período aplicado:', dateRange);
    // Aqui você implementaria a lógica para filtrar os dados com base no período
    
    // Atualizar o texto do período selecionado
    if (dateRange.startDate === dateRange.endDate) {
      setSelectedPeriod(new Date(dateRange.startDate).toLocaleDateString());
    } else {
      const start = new Date(dateRange.startDate).toLocaleDateString();
      const end = new Date(dateRange.endDate).toLocaleDateString();
      setSelectedPeriod(`${start} - ${end}`);
    }
  };
  
  // Filtrar trades com base na conta selecionada e filtros de data
  const filteredTrades = useMemo(() => {
    let result = trades;
    
    // Filter by account if selected
    if (selectedAccountId) {
      result = result.filter(trade => trade.challengeId === selectedAccountId);
    }
    
    // Filter by date range
    result = result.filter(trade => {
      const tradeDate = trade.date;
      return tradeDate >= filters.startDate && tradeDate <= filters.endDate;
    });
    
    // Sort by date, newest first
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, selectedAccountId, filters.startDate, filters.endDate]);

  // Generate calendar data from real trades
  const calendarData = useMemo(() => {
    const tradesByDate = new Map();
    
    // Group trades by date and calculate totals
    filteredTrades.forEach(trade => {
      if (!tradesByDate.has(trade.date)) {
        tradesByDate.set(trade.date, {
          date: trade.date,
          pnl: 0,
          tradeCount: 0,
          trades: []
        });
      }
      
      const dateData = tradesByDate.get(trade.date);
      dateData.pnl += trade.pnl;
      dateData.tradeCount += 1;
      dateData.trades.push(trade);
    });
    
    return Array.from(tradesByDate.values());
  }, [filteredTrades]);
  
  // Generate real performance data for the chart
  const performanceData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    
    // Sort trades by date (oldest first)
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Generate cumulative P&L data
    let cumulativePnL = 0;
    const dailyPnLMap = new Map<string, number>();
    
    // Calculate daily P&L first
    sortedTrades.forEach(trade => {
      const date = trade.date;
      const currentDailyPnL = dailyPnLMap.get(date) || 0;
      dailyPnLMap.set(date, currentDailyPnL + trade.pnl);
    });
    
    // Then create the cumulative data points
    const result = Array.from(dailyPnLMap.entries())
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, dailyPnL]) => {
        cumulativePnL += dailyPnL;
        return {
          date: new Date(date).toLocaleDateString(),
          cumulativePnL: cumulativePnL
        };
      });
      
    return result;
  }, [filteredTrades]);

  // Calculate equity curve data
  const equityData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    
    const account = selectedAccountId ? getAccount(selectedAccountId) : null;
    const initialBalance = account?.status?.currentEquity || 10000; // Default to 10000 if no account selected
    
    // Sort trades by date (oldest first)
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group trades by date
    const tradesByDate = new Map<string, number>();
    sortedTrades.forEach(trade => {
      const date = trade.date;
      const currentPnL = tradesByDate.get(date) || 0;
      tradesByDate.set(date, currentPnL + trade.pnl);
    });
    
    // Get dates array and sort them
    const dates = Array.from(tradesByDate.keys()).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    // Generate equity curve data
    let currentEquity = initialBalance;
    let highWaterMark = initialBalance;
    
    return dates.map(date => {
      const dailyPnL = tradesByDate.get(date) || 0;
      currentEquity += dailyPnL;
      
      // Update high water mark if we have a new peak
      if (currentEquity > highWaterMark) {
        highWaterMark = currentEquity;
      }
      
      // Calculate drawdown as percentage from high water mark
      const drawdown = highWaterMark > 0 ? ((currentEquity - highWaterMark) / highWaterMark) * 100 : 0;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        equity: currentEquity,
        drawdown: drawdown,
        deposits: initialBalance // We don't have deposit tracking yet, so use initial balance
      };
    });
  }, [filteredTrades, selectedAccountId, getAccount]);

  // Calculate drawdown data
  const drawdownData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    
    const account = selectedAccountId ? getAccount(selectedAccountId) : null;
    const initialBalance = account?.status?.currentEquity || 10000;
    
    // Sort trades by date (oldest first)
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Group trades by date
    const tradesByDate = new Map<string, number>();
    sortedTrades.forEach(trade => {
      const date = trade.date;
      const currentPnL = tradesByDate.get(date) || 0;
      tradesByDate.set(date, currentPnL + trade.pnl);
    });
    
    // Get dates array and sort them
    const dates = Array.from(tradesByDate.keys()).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    // Generate drawdown data
    let currentEquity = initialBalance;
    let highWaterMark = initialBalance;
    let prevDrawdown = 0;
    
    return dates.map(date => {
      const dailyPnL = tradesByDate.get(date) || 0;
      currentEquity += dailyPnL;
      
      // Update high water mark if we have a new peak
      if (currentEquity > highWaterMark) {
        highWaterMark = currentEquity;
      }
      
      // Calculate drawdown as percentage from high water mark
      const drawdown = highWaterMark > 0 ? ((currentEquity - highWaterMark) / highWaterMark) * 100 : 0;
      
      // Calculate drawdown recovery (if we're in a drawdown and it's getting better)
      const recovery = drawdown > prevDrawdown ? 0 : prevDrawdown - drawdown;
      prevDrawdown = drawdown;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        drawdown: drawdown,
        peak: 0, // This is used for visualization, not actual data
        recovery: recovery
      };
    });
  }, [filteredTrades, selectedAccountId, getAccount]);

  // Calculate returns distribution data
  const returnsData = useMemo(() => {
    if (filteredTrades.length === 0) {
      return [
        { range: '-$1000+', count: 0, percentage: 0 },
        { range: '-$500 to -$1000', count: 0, percentage: 0 },
        { range: '-$100 to -$500', count: 0, percentage: 0 },
        { range: '-$100 to $100', count: 0, percentage: 0 },
        { range: '$100 to $500', count: 0, percentage: 0 },
        { range: '$500 to $1000', count: 0, percentage: 0 },
        { range: '$1000+', count: 0, percentage: 0 }
      ];
    }
    
    // Define PnL ranges
    const ranges = [
      { name: '-$1000+', min: -Infinity, max: -1000 },
      { name: '-$500 to -$1000', min: -1000, max: -500 },
      { name: '-$100 to -$500', min: -500, max: -100 },
      { name: '-$100 to $100', min: -100, max: 100 },
      { name: '$100 to $500', min: 100, max: 500 },
      { name: '$500 to $1000', min: 500, max: 1000 },
      { name: '$1000+', min: 1000, max: Infinity }
    ];
    
    // Count trades in each range
    const counts = ranges.map(range => {
      const tradesInRange = filteredTrades.filter(
        trade => trade.pnl > range.min && trade.pnl <= range.max
      );
      return {
        range: range.name,
        count: tradesInRange.length,
        percentage: (tradesInRange.length / filteredTrades.length) * 100
      };
    });
    
    return counts;
  }, [filteredTrades]);

  // Calculate daily performance data for the new component
  const dailyPerformanceData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    
    // Group trades by date
    const tradesByDay = filteredTrades.reduce((acc, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = {
          date: trade.date,
          totalPnL: 0,
          tradeCount: 0,
          winCount: 0,
          lossCount: 0
        };
      }
      
      const dayData = acc[trade.date];
      dayData.totalPnL += trade.pnl;
      dayData.tradeCount += 1;
      
      // Count wins and losses
      if (trade.pnl > 0) {
        dayData.winCount += 1;
      } else if (trade.pnl < 0) {
        dayData.lossCount += 1;
      }
      
      return acc;
    }, {} as Record<string, { 
      date: string;
      totalPnL: number;
      tradeCount: number;
      winCount: number;
      lossCount: number;
    }>);
    
    // Convert to array and sort by date
    return Object.values(tradesByDay).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredTrades]);

  // Calculate real stats from user trades
  const stats = React.useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        netPnL: 0,
        winRate: 0,
        profitFactor: 0,
        dayWinRate: 0,
        avgWinLoss: 0,
        totalWins: 0,
        totalLosses: 0,
        avgWin: 0,
        avgLoss: 0
      };
    }

    const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = filteredTrades.filter(trade => trade.pnl > 0);
    const losingTrades = filteredTrades.filter(trade => trade.pnl < 0);
    
    const winRate = (winningTrades.length / filteredTrades.length) * 100;
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;
    
    const avgWin = winningTrades.length > 0 ? totalWinAmount / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLossAmount / losingTrades.length : 0;
    const avgWinLoss = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Calculate day win rate from daily performance
    const tradesByDay = filteredTrades.reduce((acc, trade) => {
      if (!acc[trade.date]) {
        acc[trade.date] = { totalPnL: 0 };
      }
      acc[trade.date].totalPnL += trade.pnl;
      return acc;
    }, {} as Record<string, { totalPnL: number }>);
    
    const totalDays = Object.keys(tradesByDay).length;
    const winningDays = Object.values(tradesByDay).filter(day => day.totalPnL > 0).length;
    const dayWinRate = totalDays > 0 ? (winningDays / totalDays) * 100 : 0;

    return {
      netPnL: totalPnL,
      winRate,
      profitFactor,
      dayWinRate,
      avgWinLoss,
      totalWins: winningTrades.length,
      totalLosses: losingTrades.length,
      avgWin,
      avgLoss
    };
  }, [filteredTrades]);
  
  // Calculate performance score based on actual metrics
  const performanceScore = useMemo(() => {
    // If no trades, return 0 score
    if (filteredTrades.length === 0) return 0;
    
    // Define scoring weights for different metrics
    const weights = {
      winRate: 0.2,         // Win rate (20% weight)
      profitFactor: 0.25,    // Profit factor (25% weight)
      dayWinRate: 0.2,      // Daily win rate (20% weight)
      avgWinLoss: 0.25,     // Avg win/loss ratio (25% weight)
      consistency: 0.1      // Consistency (10% weight)
    };
    
    // Score each metric on a scale of 0-100
    const winRateScore = Math.min(stats.winRate * 1.5, 100); // Win rate 66.7% or above is perfect
    
    const profitFactorScore = Math.min(stats.profitFactor * 25, 100); // Profit factor 4.0 or above is perfect
    
    const dayWinRateScore = Math.min(stats.dayWinRate * 1.4, 100); // Daily win rate of 71.4% or above is perfect
    
    const avgWinLossScore = Math.min(stats.avgWinLoss * 33.3, 100); // Avg win/loss of 3.0 or above is perfect
    
    // Calculate consistency score based on the distribution of returns
    // This is an approximation - ideally would use standard deviation
    const returnsStdDev = Math.sqrt(
      filteredTrades.reduce((sum, trade) => sum + Math.pow(trade.pnl - stats.netPnL/filteredTrades.length, 2), 0) / 
      filteredTrades.length
    );
    
    const averagePnL = Math.abs(stats.netPnL / filteredTrades.length);
    const consistencyScore = Math.max(0, 100 - (returnsStdDev / (averagePnL || 1)) * 10);
    
    // Calculate weighted average
    const totalScore = 
      winRateScore * weights.winRate +
      profitFactorScore * weights.profitFactor +
      dayWinRateScore * weights.dayWinRate +
      avgWinLossScore * weights.avgWinLoss +
      consistencyScore * weights.consistency;
      
    return Math.round(totalScore * 100) / 100;
  }, [filteredTrades, stats]);
  
  // Generate radar chart data based on the performance metrics
  const radarData = useMemo(() => {
    if (filteredTrades.length === 0) {
      return [
        { axis: 'Win Rate', value: 0 },
        { axis: 'Profit Factor', value: 0 },
        { axis: 'Consistency', value: 0 },
        { axis: 'Risk Mgmt', value: 0 },
        { axis: 'Volume', value: 0 },
        { axis: 'Discipline', value: 0 }
      ];
    }
    
    // Score each metric on a scale of 0-10
    const winRateScore = Math.min(stats.winRate / 10, 10);
    const profitFactorScore = Math.min(stats.profitFactor * 2.5, 10);
    
    // Consistency score based on the standard deviation of returns
    const returnsStdDev = Math.sqrt(
      filteredTrades.reduce((sum, trade) => sum + Math.pow(trade.pnl - stats.netPnL/filteredTrades.length, 2), 0) / 
      filteredTrades.length
    );
    
    const averagePnL = Math.abs(stats.netPnL / filteredTrades.length);
    const consistencyScore = Math.max(0, 10 - (returnsStdDev / (averagePnL || 1)));
    
    // Risk management score based on average win/loss ratio
    const riskMgmtScore = Math.min(stats.avgWinLoss * 3.33, 10);
    
    // Volume score based on number of trades
    const volumeScore = Math.min(filteredTrades.length / 20, 10);
    
    // Discipline score - placeholder, would need more data
    // This could be based on how well a trader follows their trading plan
    const disciplineScore = 7; // Default value since we can't calculate this yet
    
    return [
      { axis: 'Win Rate', value: winRateScore },
      { axis: 'Profit Factor', value: profitFactorScore },
      { axis: 'Consistency', value: consistencyScore },
      { axis: 'Risk Mgmt', value: riskMgmtScore },
      { axis: 'Volume', value: volumeScore },
      { axis: 'Discipline', value: disciplineScore }
    ];
  }, [filteredTrades, stats]);

  // Format currency helper
  const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-3"></div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Welcome Message */}
      <WelcomeMessage />

      {/* Botões de ação alinhados à direita */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleNewTrade}
            className="flex items-center space-x-1 px-3 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>{t('dashboard.buttons.new_trade')}</span>
          </button>
          <button 
            onClick={handleImportData}
            className="flex items-center space-x-1 px-3 py-1.5 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4 mr-1" />
            <span>{t('dashboard.buttons.import_data')}</span>
          </button>
          <button 
            onClick={handleGenerateReport}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
          >
            <FileText className="w-4 h-4 mr-1 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.buttons.generate_report')}</span>
          </button>
          <button 
            onClick={handleFilters}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
          >
            <Filter className="w-4 h-4 mr-1 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">{t('dashboard.buttons.filters')}</span>
          </button>
          <button 
            onClick={handleDateRange}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-sm"
          >
            <Calendar className="w-4 h-4 mr-1 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">{selectedPeriod}</span>
          </button>
        </div>
      </div>

      {/* Top KPI Row - Grid com 5 cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard 
          title={t('dashboard.net_pnl')}
          mainValue={formatCurrency(stats.netPnL)}
          variant={stats.netPnL > 0 ? 'positive' : stats.netPnL < 0 ? 'negative' : 'default'}
          tooltipContent={t('dashboard.net_pnl_tooltip')}
          contentAlign="left"
        />
        
        <KPICard 
          title={t('dashboard.win_rate')}
          mainValue={`${stats.winRate.toFixed(2)}%`}
          visualType="gauge"
          gaugeData={{
            winCount: stats.totalWins,
            lossCount: stats.totalLosses
          }}
        />
        
        <KPICard 
          title={t('dashboard.profit_factor')}
          mainValue={stats.profitFactor.toFixed(2)}
          visualType="gauge"
          gaugeData={{
            winCount: 0,
            lossCount: 0
          }}
        />
        
        <KPICard 
          title={t('dashboard.day_win_rate')}
          mainValue={`${stats.dayWinRate.toFixed(2)}%`}
          visualType="gauge"
          gaugeData={{
            winCount: 3,
            lossCount: 2
          }}
        />
        
        <KPICard 
          title={t('dashboard.avg_win_loss')}
          mainValue={stats.avgWinLoss.toFixed(2)}
          visualType="bar"
          inlineBarLabels={true}
          barData={{
            winValue: stats.avgWin,
            lossValue: stats.avgLoss
          }}
        />
      </div>

      {/* Main Content Grid - Performance Score e Calendário */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Performance Score */}
        <div className="xl:col-span-4 space-y-6">
          {/* Performance Score Radar Chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Coluna da Esquerda: Score e Explicação */}
              <div className="flex flex-col justify-center space-y-5">
                {/* Grupo do Título e Score */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {t('dashboard.performance', 'Desempenho')}
                  </h3>
                  
                  {/* Grupo do Score e da Tag de Status */}
                  <div className="flex items-baseline space-x-3 mt-2">
                    <p className="text-4xl font-bold text-neutral-900 dark:text-white">
                      {performanceScore.toFixed(2)}
                    </p>
                    <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${getScoreStatus(performanceScore).className}`}>
                      {getScoreStatus(performanceScore).label}
                    </span>
                  </div>
                </div>
                
                {/* Grupo da Barra de Progresso */}
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1.5">
                    <span>{t('dashboard.stats.bad', 'Ruim')}</span>
                    <span>{t('dashboard.stats.good', 'Bom')}</span>
                    <span>{t('dashboard.stats.great', 'Excelente')}</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        performanceScore >= 71 ? 'bg-profit-500 dark:bg-profit-400' : 
                        performanceScore >= 41 ? 'bg-secondary-500 dark:bg-secondary-400' : 
                        'bg-loss-500 dark:bg-loss-400'
                      }`}
                      style={{ width: `${Math.min(performanceScore, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Texto Explicativo */}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                  {t('dashboard.performance_score_description', 'Esta pontuação analisa seis pilares do seu trading para medir sua consistência e lucratividade geral.')}
                </p>
              </div>

              {/* Coluna da Direita: Gráfico de Radar */}
              <div>
                <RadarChart data={radarData} />
              </div>
            </div>
          </div>

          {/* Daily net cumulative P&L */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 overflow-hidden">
            <div className="flex items-center space-x-1 mb-2">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                {t('dashboard.daily_pnl')}
              </h3>
              <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                <span className="text-[9px] text-neutral-600 dark:text-neutral-400">?</span>
              </div>
            </div>
            <div className="h-44 w-full">
              <PerformanceChart data={performanceData} type="area" showGradient={true} />
            </div>
          </div>
        </div>

        {/* Right Column - CALENDÁRIO */}
        <div className="xl:col-span-8">
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
            <TradingCalendar data={calendarData} enhanced={true} compact={true} />
          </div>
        </div>
      </div>

      {/* Advanced Charts Section - Grid de duas colunas com espaçamento consistente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Coluna 1 - Curva de Equity e Distribuição de Retornos */}
        <div className="flex flex-col space-y-8">
          {/* Card da Curva de Equity */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 min-h-[400px]">
            <div className="h-full">
              <EquityCurve data={equityData} />
            </div>
          </div>
          
          {/* Card da Distribuição de Retornos */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 min-h-[400px]">
            <div className="h-full">
              <DailyPerformance data={dailyPerformanceData} />
            </div>
          </div>
        </div>
        
        {/* Coluna 2 - Drawdown e Operações Recentes */}
        <div className="flex flex-col space-y-8">
          {/* Card do Drawdown */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 min-h-[400px]">
            <div className="h-full">
              <DrawdownChart data={drawdownData} />
            </div>
          </div>
          
          {/* Card de Operações Recentes */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4 min-h-[400px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 text-primary-600 dark:text-primary-400 border-b border-primary-500 font-medium text-xs">
                  {t('recent_trades.title')}
                </button>
                <button className="px-2 py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 text-xs">
                  {t('recent_trades.open_positions')}
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 pb-1 border-b border-neutral-200 dark:border-neutral-600">
                <div>{t('recent_trades.close_date')}</div>
                <div>{t('recent_trades.symbol')}</div>
                <div>{t('recent_trades.net_pnl')}</div>
              </div>
              
              {filteredTrades.slice(0, 6).map((trade, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 py-1 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md px-1 -mx-1 transition-colors">
                  <div className="text-neutral-600 dark:text-neutral-400">{trade.date}</div>
                  <div className="text-neutral-900 dark:text-white font-medium">{trade.symbol}</div>
                  <div className={`flex items-center ${trade.pnl >= 0 ? 'text-profit-600 dark:text-profit-400' : 'text-loss-600 dark:text-loss-400'}`}>
                    {trade.pnl >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                    ${trade.pnl.toFixed(2)}
                  </div>
                </div>
              ))}
              
              {filteredTrades.length === 0 && (
                <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                  <div className="flex flex-col items-center space-y-2">
                    <BarChart3 className="w-6 h-6 text-neutral-400" />
                    <div>
                      <p className="font-medium text-xs">{t('recent_trades.no_trades')}</p>
                      <p className="text-xs">{t('recent_trades.start_adding')}</p>
                    </div>
                    <button className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors text-xs font-medium">
                      {t('recent_trades.add_trade')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showFilters && (
        <DashboardFilters
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          initialFilters={filters}
        />
      )}
      
      {showDateRangePicker && (
        <DateRangePicker
          onClose={() => setShowDateRangePicker(false)}
          onApply={handleApplyDateRange}
          initialRange={{ startDate: filters.startDate, endDate: filters.endDate }}
        />
      )}
      
      {showReportGenerator && (
        <ReportGenerator
          onClose={() => setShowReportGenerator(false)}
          initialOptions={{
            dateRange: { startDate: filters.startDate, endDate: filters.endDate },
            accountId: filters.accountId
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;