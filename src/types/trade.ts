export interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercentage: number;
  setup: string;
  notes?: string;
  tags: string[];
  duration: string;
  commission: number;
  riskRewardRatio: number;
}

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netPnL: number;
  tradeExpectancy: number;
  accountBalance: number;
  totalWins: number;
  totalLosses: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface CalendarTrade {
  date: string;
  pnl: number;
  tradeCount: number;
  trades: Trade[];
}