import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import KPICard from './KPICard';
import TradingCalendar from './TradingCalendar';
import PerformanceChart from './PerformanceChart';
import RadarChart from './RadarChart';
import EquityCurve from './EquityCurve';
import DrawdownChart from './DrawdownChart';
import ReturnsDistribution from './ReturnsDistribution';
import AIInsights from './AIInsights';
import { useTrades } from '../../hooks/useTrades';
import { generateCalendarData } from '../../utils/mockData';

const Dashboard: React.FC = () => {
  const { trades, loading } = useTrades();
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const calendarData = generateCalendarData();
  
  // Generate mock performance data similar to the screenshot
  const performanceData = [
    { date: '12/03/23', cumulativePnL: -200 },
    { date: '12/04/23', cumulativePnL: -300 },
    { date: '12/05/23', cumulativePnL: 1200 },
    { date: '12/06/23', cumulativePnL: 100 },
    { date: '12/07/23', cumulativePnL: -1000 },
    { date: '12/08/23', cumulativePnL: 200 },
    { date: '12/09/23', cumulativePnL: -500 },
    { date: '12/10/23', cumulativePnL: -800 },
    { date: '12/11/23', cumulativePnL: 2500 },
    { date: '12/12/23', cumulativePnL: 2800 },
    { date: '12/13/23', cumulativePnL: 3000 },
    { date: '12/14/23', cumulativePnL: 3200 },
    { date: '12/15/23', cumulativePnL: 3500 },
    { date: '12/16/23', cumulativePnL: 3800 },
    { date: '12/17/23', cumulativePnL: 3600 },
    { date: '12/18/23', cumulativePnL: 2500 },
    { date: '12/19/23', cumulativePnL: 2200 },
    { date: '12/20/23', cumulativePnL: 2800 },
    { date: '12/21/23', cumulativePnL: 3200 },
    { date: '12/22/23', cumulativePnL: 3000 },
    { date: '12/23/23', cumulativePnL: 2800 },
    { date: '12/24/23', cumulativePnL: 2600 },
    { date: '12/25/23', cumulativePnL: 2400 },
    { date: '12/26/23', cumulativePnL: 2200 },
    { date: '12/27/23', cumulativePnL: 1000 }
  ];

  // Mock equity curve data
  const equityData = Array.from({ length: 90 }, (_, i) => ({
    date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    equity: 50000 + (Math.random() - 0.2) * 2000 * (i + 1),
    drawdown: Math.random() * -15,
    deposits: 50000 + i * 100
  }));

  // Mock drawdown data
  const drawdownData = Array.from({ length: 60 }, (_, i) => ({
    date: new Date(Date.now() - (59 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    drawdown: Math.random() * -12,
    peak: 0,
    recovery: Math.random() * 5
  }));

  // Mock returns distribution data
  const returnsData = [
    { range: '-$1000+', count: 3, percentage: 5.2 },
    { range: '-$500 to -$1000', count: 8, percentage: 13.8 },
    { range: '-$100 to -$500', count: 15, percentage: 25.9 },
    { range: '-$100 to $100', count: 12, percentage: 20.7 },
    { range: '$100 to $500', count: 18, percentage: 31.0 },
    { range: '$500 to $1000', count: 6, percentage: 10.3 },
    { range: '$1000+', count: 4, percentage: 6.9 }
  ];

  // Mock AI insights
  const aiInsights = [
    {
      type: 'pattern' as const,
      title: 'Breakout Strategy Performing Well',
      description: 'Your breakout trades have a 78% win rate this month, significantly above your average. Consider increasing position size on high-confidence breakout setups.',
      confidence: 87,
      action: 'View Breakout Analysis'
    },
    {
      type: 'alert' as const,
      title: 'Consecutive Loss Alert',
      description: 'You have 4 consecutive losing trades. Historical data suggests taking a break or reducing position size for the next 2-3 trades.',
      confidence: 92,
      action: 'Review Risk Management'
    },
    {
      type: 'suggestion' as const,
      title: 'Optimal Trading Hours Detected',
      description: 'Your best performance occurs between 9:30-11:00 AM EST. Consider focusing more trades during this window.',
      confidence: 74,
      action: 'Adjust Schedule'
    },
    {
      type: 'benchmark' as const,
      title: 'Above Market Performance',
      description: 'Your 3-month return of 12.5% outperforms SPY by 8.3%. Your risk-adjusted returns are in the top 15% of similar traders.',
      confidence: 95,
      action: 'View Benchmark Report'
    }
  ];

  // Calculate real stats from user trades
  const stats = React.useMemo(() => {
    if (trades.length === 0) {
      return {
        netPnL: 0,
        winRate: 0,
        profitFactor: 0,
        dayWinRate: 0,
        avgWinLoss: 0
      };
    }

    const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const losingTrades = trades.filter(trade => trade.pnl < 0);
    
    const winRate = (winningTrades.length / trades.length) * 100;
    const totalWinAmount = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLossAmount = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : 0;
    
    const avgWin = winningTrades.length > 0 ? totalWinAmount / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLossAmount / losingTrades.length : 0;
    const avgWinLoss = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Calculate day win rate (simplified - assuming one trade per day)
    const dayWinRate = winRate; // This would need more complex logic for real day-based calculation

    return {
      netPnL: totalPnL,
      winRate,
      profitFactor,
      dayWinRate,
      avgWinLoss
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Loading dashboard...</p>
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
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Last import: {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
            <Upload className="w-4 h-4" />
            <span>Resync</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            <Filter className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            <Calendar className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <span className="text-neutral-700 dark:text-neutral-300">Date range</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            <span className="text-neutral-700 dark:text-neutral-300">All accounts</span>
          </button>
        </div>
      </div>

      {/* Top KPI Row - Compact Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Net P&L"
          value={stats.netPnL}
          change={12.5}
          changeLabel="vs last month"
          icon={DollarSign}
          format="currency"
          color="profit"
          showChart={true}
        />
        <KPICard
          title="Trade win %"
          value={stats.winRate}
          change={3.2}
          changeLabel="vs last month"
          icon={Target}
          format="percentage"
          color="primary"
          showCircularProgress={true}
          progressValue={stats.winRate}
          maxValue={100}
        />
        <KPICard
          title="Profit factor"
          value={stats.profitFactor}
          change={-8.1}
          changeLabel="vs last month"
          icon={TrendingUp}
          color="loss"
          showCircularProgress={true}
          progressValue={stats.profitFactor * 100}
          maxValue={100}
        />
        <KPICard
          title="Day win %"
          value={stats.dayWinRate}
          change={4.3}
          changeLabel="vs last month"
          icon={Activity}
          color="profit"
          showCircularProgress={true}
          progressValue={stats.dayWinRate}
          maxValue={100}
        />
        <KPICard
          title="Avg win/loss trade"
          value={stats.avgWinLoss.toFixed(2)}
          change={-1.2}
          changeLabel="vs last month"
          icon={Calculator}
          color="secondary"
          showChart={true}
          customDisplay={stats.avgWinLoss.toFixed(2)}
        />
      </div>

      {/* AI Insights Section */}
      <AIInsights insights={aiInsights} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column - Performance Score */}
        <div className="xl:col-span-4 space-y-6">
          {/* Performance Score Radar Chart */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Performance Score
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                    42.32
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
                    GOOD
                  </div>
                </div>
              </div>
            </div>
            <RadarChart />
          </div>

          {/* Daily net cumulative P&L */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Daily net cumulative P&L
              </h3>
              <div className="w-4 h-4 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">?</span>
              </div>
            </div>
            <PerformanceChart data={performanceData} type="area" showGradient={true} />
          </div>
        </div>

        {/* Right Column - CALENDÁRIO */}
        <div className="xl:col-span-8">
          <TradingCalendar data={calendarData} enhanced={true} />
        </div>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <EquityCurve data={equityData} />
        <DrawdownChart data={drawdownData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReturnsDistribution data={returnsData} />
        
        {/* Recent Trades */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-600 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 font-medium text-sm">
                Recent trades
              </button>
              <button className="px-4 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 text-sm">
                Open positions
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 pb-2 border-b border-neutral-200 dark:border-neutral-600">
              <div>Close Date</div>
              <div>Symbol</div>
              <div>Net P&L</div>
            </div>
            
            {trades.slice(0, 6).map((trade, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg px-2 -mx-2 transition-colors">
                <div className="text-neutral-600 dark:text-neutral-400 text-xs">{trade.date}</div>
                <div className="text-neutral-900 dark:text-white font-medium text-xs">{trade.symbol}</div>
                <div className={`text-xs ${trade.pnl >= 0 ? 'text-profit-600 dark:text-profit-400' : 'text-loss-600 dark:text-loss-400'}`}>
                  ${trade.pnl.toFixed(2)}
                </div>
              </div>
            ))}
            
            {trades.length === 0 && (
              <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                <p>No trades yet. Start by adding your first trade!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;