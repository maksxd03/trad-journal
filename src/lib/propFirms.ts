import { PropFirmRules } from "../types/propFirmChallenge";

// Lista de prop firms suportadas pela aplicação
export const supportedPropFirms = [
  { value: 'ftmo', label: 'FTMO' },
  { value: 'myforexfunds', label: 'MyForexFunds' },
  { value: 'fundedNext', label: 'Funded Next' },
  { value: 'topstepTrader', label: 'TopStep Trader' },
  { value: 'earnForex', label: 'Earn Forex' },
  { value: 'trueFunded', label: 'TrueFunded' },
  { value: 'apex', label: 'Apex Trader Funding' },
  { value: 'custom', label: 'Personalizado' }
];

/**
 * Retorna regras predefinidas para uma prop firm específica.
 * @param firmName O nome da prop firm
 * @returns Objeto parcial com as regras predefinidas
 */
export const getPredefinedRules = (firmName: string): Partial<PropFirmRules> => {
  switch (firmName.toLowerCase()) {
    case 'ftmo':
      return {
        firmName: 'FTMO',
        accountSize: 100000,
        profitTarget: 10000, // 10%
        maxDailyDrawdown: 5, // 5%
        maxOverallDrawdown: 10, // 10%
        drawdownType: 'static',
        minTradingDays: 10,
        consistencyRulePercentage: 5, // 5% por dia
      };
    
    case 'myforexfunds':
      return {
        firmName: 'MyForexFunds',
        accountSize: 100000,
        profitTarget: 8000, // 8%
        maxDailyDrawdown: 4, // 4%
        maxOverallDrawdown: 8, // 8%
        drawdownType: 'static',
        minTradingDays: 5,
      };
    
    case 'fundednext':
      return {
        firmName: 'Funded Next',
        accountSize: 100000,
        profitTarget: 10000, // 10%
        maxDailyDrawdown: 5, // 5%
        maxOverallDrawdown: 12, // 12%
        drawdownType: 'trailing',
        minTradingDays: 0,
      };
    
    case 'topsteptrader':
      return {
        firmName: 'TopStep Trader',
        accountSize: 100000,
        profitTarget: 5000, // 5%
        maxDailyDrawdown: 3, // 3%
        maxOverallDrawdown: 6, // 6%
        drawdownType: 'static',
        minTradingDays: 10,
      };
    
    case 'earnforex':
      return {
        firmName: 'Earn Forex',
        accountSize: 50000,
        profitTarget: 5000, // 10%
        maxDailyDrawdown: 4, // 4%
        maxOverallDrawdown: 8, // 8%
        drawdownType: 'static',
        minTradingDays: 7,
      };
    
    case 'truefunded':
      return {
        firmName: 'TrueFunded',
        accountSize: 100000,
        profitTarget: 8000, // 8%
        maxDailyDrawdown: 5, // 5%
        maxOverallDrawdown: 10, // 10%
        drawdownType: 'trailing',
        minTradingDays: 5,
      };
    
    case 'apex':
      return {
        firmName: 'Apex Trader Funding',
        accountSize: 100000,
        profitTarget: 10000, // 10%
        maxDailyDrawdown: 4, // 4%
        maxOverallDrawdown: 8, // 8%
        drawdownType: 'static',
        minTradingDays: 5,
      };
    
    case 'custom':
    default:
      return {
        firmName: 'Personalizado',
        accountSize: 100000,
        profitTarget: 10, // 10%
        maxDailyDrawdown: 5, // 5%
        maxOverallDrawdown: 10, // 10%
        drawdownType: 'static',
        minTradingDays: 0,
      };
  }
};

/**
 * Calcula o valor em dinheiro com base na porcentagem do account size
 * @param accountSize Tamanho da conta
 * @param percentage Porcentagem (entre 0 e 100)
 * @returns Valor em dinheiro
 */
export const percentToAmount = (accountSize: number, percentage: number): number => {
  return (percentage / 100) * accountSize;
};

/**
 * Calcula a porcentagem com base no valor em dinheiro e account size
 * @param accountSize Tamanho da conta 
 * @param amount Valor em dinheiro
 * @returns Porcentagem (entre 0 e 100)
 */
export const amountToPercent = (accountSize: number, amount: number): number => {
  return (amount / accountSize) * 100;
}; 