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

// Status dinâmico do desafio, calculado com base nos trades do usuário
export interface ChallengeStatus {
  currentEquity: number;
  highWaterMark: number; // Essencial para o cálculo de drawdown trailing
  daysTraded: Set<string>; // Usar um Set de datas 'YYYY-MM-DD' para contar dias únicos
  distanceToDailyDrawdown: number;
  distanceToOverallDrawdown: number;
  isDailyDrawdownViolated: boolean;
  isOverallDrawdownViolated: boolean;
  isPassed: boolean;
}

// O objeto principal que combina as regras e o status
export interface PropFirmChallenge {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date;
  rules: PropFirmRules;
  status: ChallengeStatus;
  trades: Trade[]; // Supondo que você tenha um tipo 'Trade' já definido
} 