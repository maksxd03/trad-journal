import { Trade } from './trade';

export type DrawdownType = 'static' | 'trailing';

// Regras do desafio, definidas pelo usuário no formulário de setup
export interface PropFirmRules {
  firmName: string; // ex: 'FTMO', 'Apex'
  accountSize: number;
  profitTarget: number;
  maxDailyDrawdown: number;
  maxOverallDrawdown: number;
  drawdownType: DrawdownType;
  minTradingDays: number;
  consistencyRulePercentage?: number; // Opcional
  otherRules?: string; // Campo de texto livre para outras regras
}

// Status dinâmico da conta, calculado com base nos trades do usuário
export interface AccountStatus {
  currentEquity: number;
  highWaterMark: number; // Essencial para o cálculo de drawdown trailing
  daysTraded: Set<string>; // Usar um Set de datas 'YYYY-MM-DD' para contar dias únicos
  distanceToDailyDrawdown: number;
  distanceToOverallDrawdown: number;
  isDailyDrawdownViolated: boolean;
  isOverallDrawdownViolated: boolean;
  isPassed: boolean;
}

// O objeto principal que representa uma conta
export interface Account {
  id: string;
  userId: string;
  name: string; // Ex: "FTMO 100k - Fase 1"
  type: 'prop_firm_challenge' | 'personal_live' | 'personal_paper';
  importMethod: 'auto_sync' | 'file_upload' | 'manual';
  broker: string; // Ex: "Apex Trader Funding", "MetaTrader 5"
  startDate: Date;
  endDate?: Date;
  rules?: PropFirmRules; // As regras agora são OPCIONAIS, aplicáveis apenas se type === 'prop_firm_challenge'
  status: AccountStatus;
  trades: Trade[];
} 