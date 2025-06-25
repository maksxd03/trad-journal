import { PropFirmChallenge, PropFirmRules, ChallengeStatus, DrawdownType } from '../../types/propFirmChallenge';
import { Trade } from '../../types/trade';
import { format } from 'date-fns';
import { Account, AccountStatus } from '../../types/account';

/**
 * Atualiza o status do desafio com base nos trades realizados
 * @param challenge O desafio com todos os trades
 * @returns Status atualizado do desafio
 */
export const updateChallengeStatus = (challenge: PropFirmChallenge): ChallengeStatus => {
  try {
    // LOG 4: Verificar os dados que a função está recebendo
    console.log('A função updateChallengeStatus recebeu:', challenge);

    // Verificações defensivas para garantir que todos os dados necessários existem
    if (!challenge) {
      console.error('Desafio nulo ou indefinido foi passado para updateChallengeStatus');
      throw new Error('Desafio inválido');
    }

    if (!challenge.rules) {
      console.error('Regras do desafio estão ausentes');
      throw new Error('Regras do desafio não encontradas');
    }

    const { rules, trades = [], startDate } = challenge;
    const { 
      accountSize = 100000, 
      profitTarget = 10000, 
      maxDailyDrawdown = 5, 
      maxOverallDrawdown = 10, 
      drawdownType = 'static',
      minTradingDays = 0
    } = rules;
    
    // Se não houver trades, retorna o status inicial
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      console.log('Nenhum trade encontrado, retornando status inicial');
      return {
        currentEquity: accountSize,
        highWaterMark: accountSize,
        daysTraded: new Set<string>(),
        distanceToDailyDrawdown: (maxDailyDrawdown / 100) * accountSize,
        distanceToOverallDrawdown: (maxOverallDrawdown / 100) * accountSize,
        isDailyDrawdownViolated: false,
        isOverallDrawdownViolated: false,
        isPassed: false
      };
    }

    // Validar que todos os trades têm as propriedades necessárias
    const validTrades = trades.filter(trade => {
      if (!trade || typeof trade !== 'object') {
        console.warn('Trade inválido encontrado e filtrado:', trade);
        return false;
      }
      if (typeof trade.pnl !== 'number') {
        console.warn('Trade sem PnL válido encontrado e filtrado:', trade);
        return false;
      }
      if (!trade.date) {
        console.warn('Trade sem data encontrado e filtrado:', trade);
        return false;
      }
      return true;
    });

    console.log(`${validTrades.length} trades válidos de ${trades.length} total`);

    // Agrupa trades por dia
    const tradesByDay: Record<string, Trade[]> = {};
    
    // Coleta os dias de trading únicos em um Set
    const daysTraded = new Set<string>();
    
    validTrades.forEach(trade => {
      try {
        const dateObj = new Date(trade.date);
        if (isNaN(dateObj.getTime())) {
          console.warn(`Data inválida encontrada no trade: ${trade.date}`);
          return;
        }
        
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        daysTraded.add(dateStr);
        
        if (!tradesByDay[dateStr]) {
          tradesByDay[dateStr] = [];
        }
        
        tradesByDay[dateStr].push(trade);
      } catch (dateError) {
        console.error('Erro ao processar data do trade:', dateError);
      }
    });
    
    // Calcula o equilíbrio atual somando todos os P&L
    const currentEquity = validTrades.reduce((sum, trade) => {
      // Garantir que o PnL é um número válido
      const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + pnl;
    }, accountSize);
    
    // Para drawdown trailing, precisamos encontrar o saldo máximo atingido (high water mark)
    let highWaterMark = accountSize;
    let runningBalance = accountSize;
    
    try {
      validTrades
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          
          if (isNaN(dateA) || isNaN(dateB)) {
            return 0; // Não altera a ordem se alguma data for inválida
          }
          
          return dateA - dateB;
        })
        .forEach(trade => {
          // Garantir que o PnL é um número válido
          const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
          runningBalance += pnl;
          if (runningBalance > highWaterMark) {
            highWaterMark = runningBalance;
          }
        });
    } catch (sortError) {
      console.error('Erro ao ordenar ou processar trades para high water mark:', sortError);
      // Em caso de erro, use o valor atual da equity como high water mark
      highWaterMark = Math.max(accountSize, currentEquity);
    }
    
    // Calcula o drawdown máximo permitido em valor absoluto
    const maxOverallDrawdownAmount = (maxOverallDrawdown / 100) * 
      (drawdownType === 'static' ? accountSize : highWaterMark);
    
    // Calcula a distância para o drawdown máximo (quanto resta até violar)
    let distanceToOverallDrawdown: number;
    
    if (drawdownType === 'static') {
      distanceToOverallDrawdown = currentEquity - (accountSize - maxOverallDrawdownAmount);
    } else { // trailing
      distanceToOverallDrawdown = currentEquity - (highWaterMark - maxOverallDrawdownAmount);
    }
    
    // Verifica se o drawdown máximo foi violado
    const isOverallDrawdownViolated = distanceToOverallDrawdown <= 0;
    
    // Para o drawdown diário, precisamos verificar o dia atual
    let distanceToDailyDrawdown = 0;
    let isDailyDrawdownViolated = false;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysTrades = tradesByDay[today] || [];
      
      // Calcula o P&L do dia atual
      const todaysPnL = todaysTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0);
      
      // Calcula o drawdown diário máximo permitido em valor absoluto
      const maxDailyDrawdownAmount = (maxDailyDrawdown / 100) * accountSize;
      
      // Calcula a distância para o drawdown diário (quanto resta até violar)
      distanceToDailyDrawdown = maxDailyDrawdownAmount + todaysPnL; // Se todaysPnL for negativo, reduz a distância
      
      // Verifica se o drawdown diário foi violado
      isDailyDrawdownViolated = distanceToDailyDrawdown <= 0;
    } catch (dailyError) {
      console.error('Erro ao calcular drawdown diário:', dailyError);
      // Em caso de erro, assuma que não houve violação
      distanceToDailyDrawdown = (maxDailyDrawdown / 100) * accountSize;
      isDailyDrawdownViolated = false;
    }
    
    // Verifica se o desafio foi concluído com sucesso
    const isPassed = currentEquity >= accountSize + profitTarget && 
                   daysTraded.size >= minTradingDays && 
                   !isOverallDrawdownViolated &&
                   !isDailyDrawdownViolated;
    
    const finalStatus: ChallengeStatus = {
      currentEquity,
      highWaterMark,
      daysTraded,
      distanceToDailyDrawdown: Math.max(0, distanceToDailyDrawdown),
      distanceToOverallDrawdown: Math.max(0, distanceToOverallDrawdown),
      isDailyDrawdownViolated,
      isOverallDrawdownViolated,
      isPassed
    };

    console.log('Status calculado com sucesso:', finalStatus);
    return finalStatus;
  } catch (error) {
    console.error("🚨 ERRO CRÍTICO DENTRO DA LÓGICA DE CÁLCULO 🚨:", error);
    console.error("Dados que causaram o erro:", challenge);

    // Retorne um estado de erro ou o status anterior para não quebrar a UI
    if (challenge && challenge.status) {
      console.log('Retornando o status anterior do desafio');
      return challenge.status;
    }

    // Se não houver status anterior, retorne um estado padrão
    console.log('Retornando um status padrão');
    const accountSize = challenge?.rules?.accountSize || 100000;
    return {
      currentEquity: accountSize,
      highWaterMark: accountSize,
      daysTraded: new Set<string>(),
      distanceToDailyDrawdown: 0,
      distanceToOverallDrawdown: 0,
      isDailyDrawdownViolated: false,
      isOverallDrawdownViolated: false,
      isPassed: false
    };
  }
};

/**
 * Gera um plano de trading com base nas regras do desafio
 * @param rules Regras do desafio
 * @returns String com o plano de trading
 */
export const generateTradingPlan = (rules: PropFirmRules): string => {
  try {
    if (!rules) {
      throw new Error('Regras inválidas fornecidas para generateTradingPlan');
    }

    const {
      accountSize = 100000,
      profitTarget = 10000,
      maxDailyDrawdown = 5,
      maxOverallDrawdown = 10,
      drawdownType = 'static',
      minTradingDays = 0,
      consistencyRulePercentage
    } = rules;

    // Calcula os valores em dinheiro
    const profitTargetAmount = profitTarget;
    const maxDailyDrawdownAmount = (maxDailyDrawdown / 100) * accountSize;
    const maxOverallDrawdownAmount = (maxOverallDrawdown / 100) * accountSize;
    
    // Calcula o risco máximo recomendado por operação (2% do account size ou menos)
    const maxRiskPerTrade = Math.min(accountSize * 0.02, maxDailyDrawdownAmount * 0.4);
    const maxRiskPerTradePercentage = (maxRiskPerTrade / accountSize) * 100;
    
    // Calcula a média diária necessária para atingir o objetivo
    let avgDailyProfitNeeded = 0;
    if (minTradingDays > 0) {
      avgDailyProfitNeeded = profitTargetAmount / minTradingDays;
    } else {
      // Se não houver requisito mínimo de dias, assume 20 dias (1 mês de trading)
      avgDailyProfitNeeded = profitTargetAmount / 20;
    }

    // Gera o plano de trading
    let plan = `# Plano de Trading para ${rules.firmName || 'Prop Firm'} - ${accountSize.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}\n\n`;
    
    plan += `## Objetivos\n`;
    plan += `- **Meta de lucro**: ${profitTargetAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${(profitTargetAmount/accountSize*100).toFixed(2)}% da conta)\n`;
    if (minTradingDays > 0) {
      plan += `- **Mínimo de dias de trading**: ${minTradingDays} dias\n`;
    }
    plan += `\n`;
    
    plan += `## Gerenciamento de Risco\n`;
    plan += `- **Drawdown Diário Máximo**: ${maxDailyDrawdownAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${maxDailyDrawdown}%)\n`;
    plan += `- **Drawdown Total Máximo**: ${maxOverallDrawdownAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${maxOverallDrawdown}%)\n`;
    plan += `- **Tipo de Drawdown**: ${drawdownType === 'static' ? 'Estático' : 'Trailing'}\n`;
    if (consistencyRulePercentage) {
      plan += `- **Regra de Consistência**: ${consistencyRulePercentage}% por dia\n`;
    }
    plan += `\n`;
    
    plan += `## Recomendações da IA\n`;
    plan += `- **Risco máx. por operação**: Limite seu risco a no máximo ${maxRiskPerTrade.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${maxRiskPerTradePercentage.toFixed(2)}%) por operação.\n`;
    
    if (minTradingDays > 0) {
      plan += `- **Média diária necessária**: Para atingir sua meta em ${minTradingDays} dias, você precisa de um ganho médio diário de ${avgDailyProfitNeeded.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.\n`;
    } else {
      plan += `- **Sugestão de meta diária**: Para atingir sua meta em um período razoável de 20 dias, considere um ganho médio diário de ${avgDailyProfitNeeded.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.\n`;
    }
    
    if (drawdownType === 'trailing') {
      plan += `- **Atenção ao Trailing Drawdown**: Como seu desafio usa drawdown trailing, seu limite de perda será recalculado para baixo à medida que você lucra. Isso exigirá cada vez mais cuidado com o gerenciamento de risco conforme você progride.\n`;
    }
    
    plan += `- **Minimizar Drawdown Diário**: Para proteger seu capital, considere parar de operar quando atingir 60-70% do seu limite de drawdown diário.\n`;
    
    return plan;
  } catch (error) {
    console.error('Erro ao gerar plano de trading:', error);
    return 'Não foi possível gerar o plano de trading. Por favor, verifique as regras do desafio.';
  }
};

/**
 * Calcula o tamanho máximo da posição com base no risco e no par de preços
 * @param params Parâmetros para o cálculo
 * @returns Número de contratos/lotes
 */
export interface PositionSizeParams {
  accountSize: number;
  riskPercentage: number;
  entryPrice: number;
  stopPrice: number;
  lotSize?: number;
}

export interface PositionSizeResult {
  positionSize: number;
  riskAmount: number;
  potentialLoss: number;
}

export const calculateMaxPositionSize = (params: PositionSizeParams): PositionSizeResult => {
  const { accountSize, riskPercentage, entryPrice, stopPrice, lotSize = 1 } = params;
  
  // Calcula o montante de risco máximo em dinheiro
  const riskAmount = (riskPercentage / 100) * accountSize;
  
  // Calcula o valor do pip (diferença entre entrada e stop)
  const pipValue = Math.abs(entryPrice - stopPrice);
  
  // Se o valor do pip for zero, retorna 0 para evitar divisão por zero
  if (pipValue === 0) {
    return {
      positionSize: 0,
      riskAmount: 0,
      potentialLoss: 0
    };
  }
  
  // Calcula o tamanho máximo da posição considerando o risco e o valor do pip
  let positionSize = riskAmount / pipValue;
  
  // Ajusta para o tamanho do lote, se necessário
  if (lotSize > 1) {
    positionSize = Math.floor(positionSize / lotSize) * lotSize;
  }
  
  // Calcula a perda potencial real
  const potentialLoss = positionSize * pipValue;
  
  return {
    positionSize: Math.max(0, positionSize),
    riskAmount,
    potentialLoss
  };
};

/**
 * Interface para os itens de recomendação da IA
 */
export interface RecommendationItem {
  text: string;
  type: 'alert' | 'insight' | 'tip' | 'strategy' | 'information';
}

/**
 * Gera recomendações da IA baseadas no estado atual do desafio ou da conta
 * @param challengeOrAccount O desafio ou conta completa com regras, trades e status
 * @returns Array de objetos de recomendação
 */
export const generateAIRecommendations = (challengeOrAccount: PropFirmChallenge | Account): RecommendationItem[] => {
  try {
    if (!challengeOrAccount || !challengeOrAccount.status) {
      throw new Error('Dados inválidos fornecidos para generateAIRecommendations');
    }

    const { status, trades = [] } = challengeOrAccount;
    
    // Determinar se estamos lidando com um desafio ou uma conta
    const isAccount = 'type' in challengeOrAccount;
    
    // Definir valores padrão
    let accountSize = 10000;
    let profitTarget = 0;
    let maxDailyDrawdown = 5;
    let maxOverallDrawdown = 10;
    let minTradingDays = 0;
    let accountType = isAccount ? (challengeOrAccount as Account).type : 'prop_firm_challenge';
    
    // Obter regras específicas dependendo do tipo
    if (isAccount) {
      const account = challengeOrAccount as Account;
      
      if (account.type === 'prop_firm_challenge' && account.rules) {
        accountSize = account.rules.accountSize;
        profitTarget = account.rules.profitTarget;
        maxDailyDrawdown = account.rules.maxDailyDrawdown;
        maxOverallDrawdown = account.rules.maxOverallDrawdown;
        minTradingDays = account.rules.minTradingDays;
      } else {
        // Para contas pessoais, usar valores padrão
        accountSize = 10000; // Valor arbitrário para contas pessoais
      }
    } else {
      // É um desafio de prop firm
      const challenge = challengeOrAccount as PropFirmChallenge;
      if (challenge.rules) {
        accountSize = challenge.rules.accountSize;
        profitTarget = challenge.rules.profitTarget;
        maxDailyDrawdown = challenge.rules.maxDailyDrawdown;
        maxOverallDrawdown = challenge.rules.maxOverallDrawdown;
        minTradingDays = challenge.rules.minTradingDays;
      }
    }

    const {
      currentEquity,
      highWaterMark,
      daysTraded,
      distanceToDailyDrawdown,
      distanceToOverallDrawdown,
      isDailyDrawdownViolated,
      isOverallDrawdownViolated,
      isPassed
    } = status;

    const recommendations: RecommendationItem[] = [];

    // Calcula valores importantes
    const profitAmount = currentEquity - accountSize;
    const profitPercentage = (profitAmount / accountSize) * 100;
    const remainingProfit = accountType === 'prop_firm_challenge' ? Math.max(0, profitTarget - profitAmount) : 0;
    const progressToTarget = accountType === 'prop_firm_challenge' && profitTarget > 0 ? (profitAmount / profitTarget) * 100 : 0;
    const daysRemaining = accountType === 'prop_firm_challenge' ? Math.max(0, minTradingDays - daysTraded.size) : 0;
    
    // Calcula o risco máximo recomendado por operação (2% do account size ou menos)
    const maxDailyDrawdownAmount = (maxDailyDrawdown / 100) * accountSize;
    const maxRiskPerTrade = Math.min(accountSize * 0.02, maxDailyDrawdownAmount * 0.4);
    const maxRiskPerTradePercentage = (maxRiskPerTrade / accountSize) * 100;

    // Para contas pessoais, adicionar informações gerais
    if (accountType !== 'prop_firm_challenge') {
      recommendations.push({
        text: `Esta é uma conta ${accountType === 'personal_live' ? 'pessoal real' : 'pessoal demo'}. Seu saldo atual é de ${currentEquity.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`,
        type: 'information'
      });
      
      // Adicionar recomendação sobre risco por operação para contas pessoais
      recommendations.push({
        text: `Para contas pessoais, recomendamos limitar o risco a no máximo 1-2% do capital por operação (${maxRiskPerTrade.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}).`,
        type: 'strategy'
      });
    } else {
      // Regra 1: Estratégia de risco máximo por operação (apenas para prop firm challenges)
      recommendations.push({
        text: `Limite seu risco a no máximo ${maxRiskPerTrade.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${maxRiskPerTradePercentage.toFixed(2)}%) por operação para proteger seu capital.`,
        type: 'strategy'
      });
    }

    // Regra 2: Verifica se o último trade excedeu o risco recomendado (para todos os tipos de conta)
    if (trades.length > 0) {
      // Ordenar trades por data, mais recente primeiro
      const sortedTrades = [...trades].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastTrade = sortedTrades[0];
      const lastTradeRisk = Math.abs(lastTrade.pnl);
      
      if (lastTradeRisk > maxRiskPerTrade) {
        recommendations.push({
          text: `Atenção! Seu último trade arriscou ${lastTradeRisk.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}, acima do limite recomendado de ${maxRiskPerTrade.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. Considere reduzir o tamanho das posições.`,
          type: 'alert'
        });
      }
    }

    // Regra 3: Alerta se estiver próximo ao limite de drawdown diário
    const dailyDrawdownWarningThreshold = maxDailyDrawdownAmount * 0.7; // 70% do limite
    if (distanceToDailyDrawdown < dailyDrawdownWarningThreshold) {
      const percentageRemaining = (distanceToDailyDrawdown / maxDailyDrawdownAmount) * 100;
      recommendations.push({
        text: `Alerta de Risco! Você está a apenas ${percentageRemaining.toFixed(0)}% do seu limite de drawdown diário. Considere parar de operar por hoje ou reduzir significativamente o tamanho das posições.`,
        type: 'alert'
      });
    }

    // Regra adicional: Recomendação para ganho médio necessário (apenas para prop firm challenges)
    if (accountType === 'prop_firm_challenge' && remainingProfit > 0 && daysRemaining > 0) {
      const avgDailyGainNeeded = remainingProfit / daysRemaining;
      recommendations.push({
        text: `Para atingir sua meta em ${daysRemaining} dias restantes, você precisará de um ganho médio diário de ${avgDailyGainNeeded.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`,
        type: 'insight'
      });
    }

    // Regra adicional: Insight sobre progresso (apenas para prop firm challenges)
    if (accountType === 'prop_firm_challenge' && progressToTarget > 0) {
      if (progressToTarget < 25) {
        recommendations.push({
          text: `Você completou ${progressToTarget.toFixed(1)}% do seu objetivo. Continue construindo consistência e gerenciando riscos cuidadosamente nesta fase inicial.`,
          type: 'insight'
        });
      } else if (progressToTarget < 50) {
        recommendations.push({
          text: `Você já alcançou ${progressToTarget.toFixed(1)}% do seu objetivo. Considere manter sua estratégia atual que está mostrando resultados positivos.`,
          type: 'tip'
        });
      } else if (progressToTarget < 75) {
        recommendations.push({
          text: `Com ${progressToTarget.toFixed(1)}% do objetivo alcançado, você está na reta final. Pode ser o momento de reduzir gradualmente seu risco para proteger seus ganhos.`,
          type: 'strategy'
        });
      } else {
        recommendations.push({
          text: `Incrível! Você já completou ${progressToTarget.toFixed(1)}% do objetivo. Foque em preservar capital e considere reduzir significativamente seu risco por operação.`,
          type: 'strategy'
        });
      }
    }

    // Dica sobre consistência vs. recuperação (para todos os tipos de conta)
    if (profitAmount < 0) {
      recommendations.push({
        text: `Você está atualmente em prejuízo de ${Math.abs(profitAmount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. Foque em operações pequenas para recuperar a confiança antes de aumentar o tamanho das posições.`,
        type: 'tip'
      });
    }

    // Dica sobre timing de mercado (para todos os tipos de conta)
    const today = new Date();
    const currentHour = today.getHours();
    if (currentHour >= 14 && currentHour <= 16) { // Horários de maior volatilidade (ajuste conforme necessário)
      recommendations.push({
        text: `Você está operando durante um horário de alta volatilidade. Considere reduzir o tamanho das posições em 20-30% para compensar o aumento do risco.`,
        type: 'tip'
      });
    }

    return recommendations;
  } catch (error) {
    console.error('Erro ao gerar recomendações da IA:', error);
    return [
      {
        text: 'Não foi possível gerar recomendações personalizadas. Por favor, verifique os dados da conta.',
        type: 'alert'
      }
    ];
  }
};

/**
 * Atualiza o status da conta com base nos trades realizados
 * @param account A conta com todos os trades
 * @returns Status atualizado da conta
 */
export const updateAccountStatus = (account: Account): AccountStatus => {
  try {
    // LOG 4: Verificar os dados que a função está recebendo
    console.log('A função updateAccountStatus recebeu:', account);

    // Verificações defensivas para garantir que todos os dados necessários existem
    if (!account) {
      console.error('Conta nula ou indefinida foi passada para updateAccountStatus');
      throw new Error('Conta inválida');
    }

    const { trades = [], startDate, type, rules } = account;
    
    // Definir valores padrão ou usar valores das regras se disponíveis
    let accountSize = 10000; // Valor padrão para contas pessoais
    let profitTarget = 0;
    let maxDailyDrawdown = 5;
    let maxOverallDrawdown = 10;
    let drawdownType: DrawdownType = 'static';
    let minTradingDays = 0;
    
    // Se for um desafio de prop firm e tiver regras, use os valores das regras
    if (type === 'prop_firm_challenge' && rules) {
      accountSize = rules.accountSize;
      profitTarget = rules.profitTarget;
      maxDailyDrawdown = rules.maxDailyDrawdown;
      maxOverallDrawdown = rules.maxOverallDrawdown;
      drawdownType = rules.drawdownType;
      minTradingDays = rules.minTradingDays;
    }
    
    // Se não houver trades, retorna o status inicial
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      console.log('Nenhum trade encontrado, retornando status inicial');
      return {
        currentEquity: accountSize,
        highWaterMark: accountSize,
        daysTraded: new Set<string>(),
        distanceToDailyDrawdown: (maxDailyDrawdown / 100) * accountSize,
        distanceToOverallDrawdown: (maxOverallDrawdown / 100) * accountSize,
        isDailyDrawdownViolated: false,
        isOverallDrawdownViolated: false,
        isPassed: false
      };
    }

    // Validar que todos os trades têm as propriedades necessárias
    const validTrades = trades.filter(trade => {
      if (!trade || typeof trade !== 'object') {
        console.warn('Trade inválido encontrado e filtrado:', trade);
        return false;
      }
      if (typeof trade.pnl !== 'number') {
        console.warn('Trade sem PnL válido encontrado e filtrado:', trade);
        return false;
      }
      if (!trade.date) {
        console.warn('Trade sem data encontrado e filtrado:', trade);
        return false;
      }
      return true;
    });

    console.log(`${validTrades.length} trades válidos de ${trades.length} total`);

    // Agrupa trades por dia
    const tradesByDay: Record<string, Trade[]> = {};
    
    // Coleta os dias de trading únicos em um Set
    const daysTraded = new Set<string>();
    
    validTrades.forEach(trade => {
      try {
        const dateObj = new Date(trade.date);
        if (isNaN(dateObj.getTime())) {
          console.warn(`Data inválida encontrada no trade: ${trade.date}`);
          return;
        }
        
        const dateStr = format(dateObj, 'yyyy-MM-dd');
        daysTraded.add(dateStr);
        
        if (!tradesByDay[dateStr]) {
          tradesByDay[dateStr] = [];
        }
        
        tradesByDay[dateStr].push(trade);
      } catch (dateError) {
        console.error('Erro ao processar data do trade:', dateError);
      }
    });
    
    // Calcula o equilíbrio atual somando todos os P&L
    const currentEquity = validTrades.reduce((sum, trade) => {
      // Garantir que o PnL é um número válido
      const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
      return sum + pnl;
    }, accountSize);
    
    // Para drawdown trailing, precisamos encontrar o saldo máximo atingido (high water mark)
    let highWaterMark = accountSize;
    let runningBalance = accountSize;
    
    try {
      validTrades
        .sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          
          if (isNaN(dateA) || isNaN(dateB)) {
            return 0; // Não altera a ordem se alguma data for inválida
          }
          
          return dateA - dateB;
        })
        .forEach(trade => {
          // Garantir que o PnL é um número válido
          const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
          runningBalance += pnl;
          if (runningBalance > highWaterMark) {
            highWaterMark = runningBalance;
          }
        });
    } catch (sortError) {
      console.error('Erro ao ordenar ou processar trades para high water mark:', sortError);
      // Em caso de erro, use o valor atual da equity como high water mark
      highWaterMark = Math.max(accountSize, currentEquity);
    }
    
    // Calcula o drawdown máximo permitido em valor absoluto
    const maxOverallDrawdownAmount = (maxOverallDrawdown / 100) * 
      (drawdownType === 'static' ? accountSize : highWaterMark);
    
    // Calcula a distância para o drawdown máximo (quanto resta até violar)
    let distanceToOverallDrawdown: number;
    
    if (drawdownType === 'static') {
      distanceToOverallDrawdown = currentEquity - (accountSize - maxOverallDrawdownAmount);
    } else { // trailing
      distanceToOverallDrawdown = currentEquity - (highWaterMark - maxOverallDrawdownAmount);
    }
    
    // Verifica se o drawdown máximo foi violado
    const isOverallDrawdownViolated = distanceToOverallDrawdown <= 0;
    
    // Para o drawdown diário, precisamos verificar o dia atual
    let distanceToDailyDrawdown = 0;
    let isDailyDrawdownViolated = false;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todaysTrades = tradesByDay[today] || [];
      
      // Calcula o P&L do dia atual
      const todaysPnL = todaysTrades.reduce((sum, trade) => {
        const pnl = typeof trade.pnl === 'number' ? trade.pnl : 0;
        return sum + pnl;
      }, 0);
      
      // Calcula o drawdown diário máximo permitido em valor absoluto
      const maxDailyDrawdownAmount = (maxDailyDrawdown / 100) * accountSize;
      
      // Calcula a distância para o drawdown diário (quanto resta até violar)
      distanceToDailyDrawdown = maxDailyDrawdownAmount + todaysPnL; // Se todaysPnL for negativo, reduz a distância
      
      // Verifica se o drawdown diário foi violado
      isDailyDrawdownViolated = distanceToDailyDrawdown <= 0;
    } catch (dailyError) {
      console.error('Erro ao calcular drawdown diário:', dailyError);
      // Em caso de erro, assuma que não houve violação
      distanceToDailyDrawdown = (maxDailyDrawdown / 100) * accountSize;
      isDailyDrawdownViolated = false;
    }
    
    // Verifica se o desafio foi concluído com sucesso
    // Para contas pessoais, não há critério de "passou", então sempre é false
    const isPassed = type === 'prop_firm_challenge' && 
                   currentEquity >= accountSize + profitTarget && 
                   daysTraded.size >= minTradingDays && 
                   !isOverallDrawdownViolated &&
                   !isDailyDrawdownViolated;
    
    const finalStatus: AccountStatus = {
      currentEquity,
      highWaterMark,
      daysTraded,
      distanceToDailyDrawdown: Math.max(0, distanceToDailyDrawdown),
      distanceToOverallDrawdown: Math.max(0, distanceToOverallDrawdown),
      isDailyDrawdownViolated,
      isOverallDrawdownViolated,
      isPassed
    };

    console.log('Status calculado com sucesso:', finalStatus);
    return finalStatus;
  } catch (error) {
    console.error("🚨 ERRO CRÍTICO DENTRO DA LÓGICA DE CÁLCULO 🚨:", error);
    console.error("Dados que causaram o erro:", account);

    // Retorne um estado de erro ou o status anterior para não quebrar a UI
    if (account && account.status) {
      console.log('Retornando o status anterior da conta');
      return account.status;
    }

    // Se não houver status anterior, retorne um estado padrão
    console.log('Retornando um status padrão');
    const accountSize = account?.rules?.accountSize || 10000;
    return {
      currentEquity: accountSize,
      highWaterMark: accountSize,
      daysTraded: new Set<string>(),
      distanceToDailyDrawdown: 0,
      distanceToOverallDrawdown: 0,
      isDailyDrawdownViolated: false,
      isOverallDrawdownViolated: false,
      isPassed: false
    };
  }
}; 