import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar, 
  Percent, 
  DollarSign, 
  Clock, 
  BarChart4,
  Target,
  Shield,
  Lightbulb,
  List
} from 'lucide-react';
import { PropFirmChallenge } from '../../types/propFirmChallenge';
import { generateTradingPlan, updateChallengeStatus, generateAIRecommendations } from '../../lib/ai/riskCopilot';
import { hydrateChallenge } from '../../lib/serializationUtils';
import { useTrades } from '../../hooks/useTrades';
import { Trade } from '../../types/trade';

// Componentes do Dashboard
import SimpleKpiCard from '../../components/challenges/dashboard/SimpleKpiCard';
import GoalGauge from '../../components/challenges/dashboard/GoalGauge';
import RiskMeter from '../../components/challenges/dashboard/RiskMeter';
import AIRecommendationCard from '../../components/challenges/dashboard/AIRecommendationCard';

// ============= BUSCA DIRETA DO LOCALSTORAGE ==============
// Função auxiliar para buscar desafio diretamente do localStorage
const getChallengeFromStorage = (id: string): PropFirmChallenge | null => {
  try {
    console.log(`🔍 Buscando desafio/conta ${id} no localStorage`);
    
    // Primeiro, tentamos buscar nas contas (nova implementação)
    const savedAccounts = localStorage.getItem('accounts');
    if (savedAccounts) {
      console.log('📂 Verificando nas contas...');
      const parsedAccounts = JSON.parse(savedAccounts);
      
      if (Array.isArray(parsedAccounts)) {
        const foundAccount = parsedAccounts.find(a => a.id === id);
        
        if (foundAccount) {
          console.log('✅ Conta encontrada no localStorage');
          
          // Se for um desafio de prop firm, podemos usá-lo diretamente
          if (foundAccount.type === 'prop_firm_challenge' && foundAccount.rules) {
            console.log('✅ É um desafio de prop firm, convertendo para o formato esperado');
            
            // Converter a conta para o formato de desafio esperado pelo componente
            const challenge: PropFirmChallenge = {
              id: foundAccount.id,
              userId: foundAccount.userId,
              rules: foundAccount.rules,
              status: foundAccount.status,
              startDate: foundAccount.startDate,
              trades: foundAccount.trades || []
            };
            
            return challenge;
          } else {
            console.log('❌ A conta encontrada não é um desafio de prop firm');
          }
        }
      }
    }
    
    // Se não encontrou nas contas, tenta nos desafios antigos
    const savedChallenges = localStorage.getItem('propFirmChallenges');
    
    if (!savedChallenges) {
      console.log('❌ Nenhum desafio encontrado no localStorage');
      return null;
    }
    
    const parsedData = JSON.parse(savedChallenges);
    
    if (!Array.isArray(parsedData)) {
      console.log('❌ Dados no localStorage não são um array válido');
      return null;
    }
    
    const foundChallenge = parsedData.find(c => c.id === id);
    
    if (!foundChallenge) {
      console.log(`❌ Desafio ${id} não encontrado no localStorage`);
      return null;
    }
    
    // Hidratar o desafio antes de usá-lo
    try {
      console.log('✅ Desafio encontrado, hidratando...');
      const hydratedChallenge = hydrateChallenge(foundChallenge);
      return hydratedChallenge;
    } catch (hydrationError) {
      console.error('❌ Erro ao hidratar desafio:', hydrationError);
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao buscar desafio/conta do localStorage:', error);
    return null;
  }
};

// Função auxiliar para extrair ID de várias fontes
const extractChallengeId = (): string | null => {
  // 1. Tentar obter do useParams (método padrão)
  const params = useParams<{ id: string }>();
  if (params.id) {
    console.log('✅ ID extraído via useParams:', params.id);
    return params.id;
  }
  
  // 2. Tentar extrair da URL diretamente - versão melhorada para suportar ambas as rotas
  const urlPath = window.location.pathname;
  
  // Verificar tanto /challenges/ quanto /accounts/
  const challengeMatch = /\/challenges\/([^\/]+)/.exec(urlPath);
  if (challengeMatch && challengeMatch[1]) {
    console.log('✅ ID extraído via regex da URL (challenges):', challengeMatch[1]);
    return challengeMatch[1];
  }
  
  const accountMatch = /\/accounts\/([^\/]+)/.exec(urlPath);
  if (accountMatch && accountMatch[1]) {
    console.log('✅ ID extraído via regex da URL (accounts):', accountMatch[1]);
    return accountMatch[1];
  }
  
  // 3. Método simples de divisão da URL - também melhorado para suportar ambas as rotas
  if (urlPath.includes('/challenges/')) {
    const urlParts = urlPath.split('/challenges/');
    if (urlParts.length > 1 && urlParts[1]) {
      console.log('✅ ID extraído via split da URL (challenges):', urlParts[1]);
      return urlParts[1];
    }
  }
  
  if (urlPath.includes('/accounts/')) {
    const urlParts = urlPath.split('/accounts/');
    if (urlParts.length > 1 && urlParts[1]) {
      console.log('✅ ID extraído via split da URL (accounts):', urlParts[1]);
      return urlParts[1];
    }
  }
  
  // Nenhum método funcionou
  console.warn('❌ Não foi possível extrair o ID de nenhuma fonte');
  return null;
};

// Componente principal da página
export default function ChallengeDashboardPage() {
  console.log('🔄 RENDERIZANDO PÁGINA DE DETALHES DA CONTA/DESAFIO');
  
  // Extrair o ID de várias fontes possíveis
  const id = extractChallengeId();
  console.log('🔍 ID final da conta/desafio:', id);
  
  const navigate = useNavigate();
  const { trades } = useTrades();
  
  // Estados locais
  const [isLoading, setIsLoading] = useState(true);
  const [challenge, setChallenge] = useState<PropFirmChallenge | null>(null);
  const [tradingPlan, setTradingPlan] = useState<string>('');
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [accountTrades, setAccountTrades] = useState<Trade[]>([]);

  // Efeito para carregar o desafio - BUSCA DIRETA
  useEffect(() => {
    if (!id) {
      console.log('❌ ID não disponível, aguardando...');
      return;
    }
    
    console.log(`🔍 Iniciando busca pelo desafio ID=${id}`);
    
    // Adicionar uma verificação de segurança com timeout
    const timeoutId = setTimeout(() => {
      if (isLoading && !challenge) {
        console.warn('⚠️ Timeout atingido, possível problema com o ID ou dados');
        setIsLoading(false);
      }
    }, 3000);
    
    // Buscar o desafio diretamente do localStorage
    const loadedChallenge = getChallengeFromStorage(id);
    
    if (loadedChallenge) {
      console.log('✅ Desafio carregado com sucesso');
      
      // Atualizar o status do desafio
      try {
        console.log('🔄 Atualizando status do desafio');
        const updatedStatus = updateChallengeStatus(loadedChallenge);
        loadedChallenge.status = updatedStatus;
      } catch (statusError) {
        console.error('❌ Erro ao atualizar status:', statusError);
      }
      
      // Definir o desafio no estado
      setChallenge(loadedChallenge);
      
      // Gerar o plano de trading
      try {
        console.log('📝 Gerando plano de trading');
        const plan = generateTradingPlan(loadedChallenge.rules);
        setTradingPlan(plan);
      } catch (planError) {
        console.error('❌ Erro ao gerar plano de trading:', planError);
        setTradingPlan('Não foi possível gerar o plano de trading.');
      }
    } else {
      console.log('❌ Desafio não encontrado');
      setChallenge(null);
    }
    
    // Finalizar carregamento
    setIsLoading(false);
    
    // Limpar o timeout se encontrarmos o desafio
    clearTimeout(timeoutId);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [id]);

  // Efeito para filtrar trades associados a esta conta
  useEffect(() => {
    if (id && trades.length > 0) {
      const filteredTrades = trades.filter(trade => trade.accountId === id);
      console.log(`🔄 Encontrados ${filteredTrades.length} trades para a conta ${id}`);
      setAccountTrades(filteredTrades);
    }
  }, [id, trades]);

  // Função para alternar o modo de depuração
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Navegação de volta
  const handleBackClick = () => {
    navigate('/accounts');
  };

  // Formata o valor da moeda
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  // RENDERIZAÇÃO CONDICIONAL
  console.log('🔄 Preparando renderização. Estado:', { isLoading, hasChallenge: !!challenge });

  // Estado de carregamento
  if (isLoading) {
    console.log('🔄 Renderizando spinner de carregamento');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (!challenge) {
    console.log('❌ Renderizando página de erro (conta/desafio não encontrado)');
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 text-center shadow-sm border border-neutral-200 dark:border-neutral-700">
          <AlertCircle className="mx-auto h-12 w-12 text-loss-500 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Conta não encontrada</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">Não foi possível encontrar a conta especificada.</p>
          <button
            onClick={handleBackClick}
            className="mt-6 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
          >
            Voltar para Contas
          </button>
        </div>
      </div>
    );
  }

  // Renderização normal - desafio encontrado
  console.log('✅ Renderizando dashboard do desafio');
  
  const { rules, status, startDate } = challenge;
  const {
    currentEquity = 0,
    highWaterMark = rules?.accountSize || 0,
    daysTraded = new Set<string>(),
    distanceToDailyDrawdown = 0,
    distanceToOverallDrawdown = 0,
    isDailyDrawdownViolated = false,
    isOverallDrawdownViolated = false,
    isPassed = false
  } = status || {};

  // Calcula estatísticas adicionais
  const accountSize = rules?.accountSize || 0;
  const profitAmount = currentEquity - accountSize;
  const profitPercentage = accountSize ? (profitAmount / accountSize) * 100 : 0;
  const remainingProfit = Math.max(0, (rules?.profitTarget || 0) - profitAmount);
  const progressToTarget = rules?.profitTarget ? (profitAmount / rules.profitTarget) * 100 : 0;
  
  // Calcula se os dias mínimos foram atingidos
  const daysRemaining = Math.max(0, (rules?.minTradingDays || 0) - (daysTraded?.size || 0));
  const averageDailyGainNeeded = daysRemaining > 0 ? remainingProfit / daysRemaining : 0;

  // Status do desafio para exibição
  const getChallengeStatus = () => {
    if (isPassed) {
      return {
        label: 'Desafio Concluído',
        icon: <CheckCircle className="h-5 w-5 text-profit-500" />,
        color: 'profit'
      };
    }
    
    if (isDailyDrawdownViolated || isOverallDrawdownViolated) {
      return {
        label: 'Regras Violadas',
        icon: <XCircle className="h-5 w-5 text-loss-500" />,
        color: 'loss'
      };
    }
    
    return {
      label: 'Em Andamento',
      icon: <Clock className="h-5 w-5 text-primary-500" />,
      color: 'primary'
    };
  };

  const challengeStatus = getChallengeStatus();

  // Divide o plano de trading em seções
  const splitTradingPlan = () => {
    const sections = {
      objectives: '',
      riskLimits: '',
      recommendations: ''
    };
    
    const lines = tradingPlan.split('\n');
    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('Objetivos') || line.includes('objetivo')) {
        currentSection = 'objectives';
        sections.objectives += line + '\n';
      } else if (line.includes('Limites') || line.includes('Risco') || line.includes('Drawdown')) {
        currentSection = 'riskLimits';
        sections.riskLimits += line + '\n';
      } else if (line.includes('Recomendações') || line.includes('Sugestão') || line.includes('Estratégia')) {
        currentSection = 'recommendations';
        sections.recommendations += line + '\n';
      } else if (currentSection) {
        sections[currentSection] += line + '\n';
      }
    }
    
    return sections;
  };
  
  const tradingPlanSections = splitTradingPlan();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative z-0">
      {/* Botão de Depuração (apenas em desenvolvimento) */}
      {/* Botão de depuração removido temporariamente para testar se é a causa do problema */}

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={(e) => {
              e.preventDefault(); // Previne comportamento padrão
              handleBackClick();
            }}
            className="mb-4 flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Contas
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {rules?.firmName || 'Desafio'} - {formatCurrency(rules?.accountSize)}
            </h1>
            <div className={`flex items-center px-2.5 py-0.5 rounded-full text-sm bg-${challengeStatus.color}-100 dark:bg-${challengeStatus.color}-900/30 text-${challengeStatus.color}-700 dark:text-${challengeStatus.color}-400`}>
              {challengeStatus.icon}
              <span className="ml-1">{challengeStatus.label}</span>
            </div>
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Iniciado em {format(new Date(startDate || new Date()), 'dd/MM/yyyy')}
          </p>
        </div>
      </div>
      
      {/* Alertas de Regras Violadas */}
      {(isDailyDrawdownViolated || isOverallDrawdownViolated) && (
        <div className="mb-6 p-4 bg-loss-100 dark:bg-loss-900/20 rounded-lg border border-loss-200 dark:border-loss-900/50">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-loss-600 dark:text-loss-400 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-loss-800 dark:text-loss-300">
                Regras do Desafio Violadas
              </h3>
              <ul className="mt-2 text-sm text-loss-700 dark:text-loss-400 space-y-1">
                {isDailyDrawdownViolated && (
                  <li>Você excedeu o limite de drawdown diário de {rules?.maxDailyDrawdown || 0}% ({formatCurrency(((rules?.maxDailyDrawdown || 0) / 100) * (rules?.accountSize || 0))}).</li>
                )}
                {isOverallDrawdownViolated && (
                  <li>Você excedeu o limite de drawdown total de {rules?.maxOverallDrawdown || 0}% ({formatCurrency(((rules?.maxOverallDrawdown || 0) / 100) * (rules?.accountSize || 0))}).</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Alerta de Desafio Concluído */}
      {isPassed && (
        <div className="mb-6 p-4 bg-profit-100 dark:bg-profit-900/20 rounded-lg border border-profit-200 dark:border-profit-900/50">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-profit-600 dark:text-profit-400 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-profit-800 dark:text-profit-300">
                Parabéns! Desafio Concluído com Sucesso
              </h3>
              <p className="mt-1 text-sm text-profit-700 dark:text-profit-400">
                Você atingiu a meta de lucro de {formatCurrency(rules.profitTarget)} e cumpriu todos os requisitos do desafio.
                {rules.minTradingDays > 0 && ` Você operou por ${daysTraded.size} dias, atendendo ao requisito mínimo de ${rules.minTradingDays} dias.`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Grid Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Coluna de OBJETIVO (Esquerda) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary-500" />
              Progresso para Meta
            </h2>
            
            {/* Gauge medidor principal */}
            <GoalGauge 
              percentage={progressToTarget} 
              label="do objetivo"
            />
            
            {/* KPIs relacionados à meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <SimpleKpiCard
                title="P&L Atual"
                value={formatCurrency(profitAmount)}
                description={`${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%`}
                color={profitAmount > 0 ? 'profit' : profitAmount < 0 ? 'loss' : 'default'}
                icon={<TrendingUp className="h-4 w-4 text-profit-600 dark:text-profit-400" />}
              />
              
              <SimpleKpiCard
                title="Meta de Lucro"
                value={formatCurrency(rules.profitTarget)}
                description={`${(rules.profitTarget / accountSize * 100).toFixed(1)}% da conta`}
                color="primary"
                icon={<Target className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
              />
              
              <SimpleKpiCard
                title="Ganho Necessário"
                value={formatCurrency(averageDailyGainNeeded)}
                description={daysRemaining > 0 ? `por dia (${daysRemaining} dias)` : 'Meta atingida!'}
                color={daysRemaining > 0 ? 'primary' : 'profit'}
                icon={<Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
              />
            </div>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary-500" />
              Requisitos de Tempo
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <SimpleKpiCard
                title="Dias de Trading"
                value={daysTraded.size}
                description={
                  rules.minTradingDays > 0
                    ? `Mínimo requerido: ${rules.minTradingDays} dias`
                    : 'Sem mínimo de dias requerido'
                }
                icon={<Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
                color={daysTraded.size >= rules.minTradingDays ? 'profit' : 'primary'}
                trend={
                  rules.minTradingDays > 0
                    ? {
                        direction: daysRemaining === 0 ? 'up' : 'neutral',
                        value: daysRemaining === 0 ? 'Completo' : `Faltam ${daysRemaining}`
                      }
                    : undefined
                }
              />
              
              {rules.minTradingDays > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                    <span>Progresso</span>
                    <span>{Math.min(100, (daysTraded.size / rules.minTradingDays) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${daysTraded.size >= rules.minTradingDays ? 'bg-profit-500' : 'bg-primary-500'}`}
                      style={{ width: `${Math.min(100, (daysTraded.size / rules.minTradingDays) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Coluna de RISCO (Direita) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RiskMeter 
              title="Drawdown Diário"
              currentValue={distanceToDailyDrawdown}
              limitValue={(rules.maxDailyDrawdown / 100) * rules.accountSize}
              description={`Limite diário de ${rules.maxDailyDrawdown}% (${formatCurrency((rules.maxDailyDrawdown / 100) * rules.accountSize)})`}
              icon="alert"
            />
            
            <RiskMeter 
              title={`Drawdown ${rules.drawdownType === 'trailing' ? 'Trailing' : 'Total'}`}
              currentValue={distanceToOverallDrawdown}
              limitValue={(rules.maxOverallDrawdown / 100) * (rules.drawdownType === 'trailing' ? highWaterMark : rules.accountSize)}
              description={`Limite total de ${rules.maxOverallDrawdown}% ${rules.drawdownType === 'trailing' ? 'do saldo máximo' : 'do saldo inicial'}`}
              icon="shield"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SimpleKpiCard
              title="Saldo Atual"
              value={formatCurrency(currentEquity)}
              description={`${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}% desde o início`}
              icon={<DollarSign className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
              color="primary"
              trend={
                profitAmount !== 0
                  ? {
                      direction: profitAmount > 0 ? 'up' : 'down',
                      value: formatCurrency(Math.abs(profitAmount))
                    }
                  : undefined
              }
            />
            
            <SimpleKpiCard
              title="High Water Mark"
              value={formatCurrency(highWaterMark)}
              description={`${((highWaterMark - rules.accountSize) / rules.accountSize * 100).toFixed(2)}% de ganho máximo`}
              icon={<TrendingUp className="h-4 w-4 text-profit-600 dark:text-profit-400" />}
              color="profit"
            />
          </div>
        </div>
      </div>
      
      {/* Seção do Plano de Trading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary-500" />
            Objetivos do Desafio
          </h2>
          <div className="prose dark:prose-invert max-w-none prose-sm">
            {tradingPlanSections.objectives.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h3 key={index} className="text-base">{line.substring(2)}</h3>;
              } else if (line.startsWith('## ')) {
                return <h4 key={index} className="text-sm">{line.substring(3)}</h4>;
              } else if (line.startsWith('- ')) {
                return <p key={index} className="mb-2 ml-4 flex items-start">
                  <span className="mr-2">•</span>
                  <span dangerouslySetInnerHTML={{ __html: line.substring(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
                </p>;
              } else if (line === '') {
                return <br key={index} />;
              } else {
                return <p key={index}>{line}</p>;
              }
            })}
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-loss-500" />
            Limites de Risco
          </h2>
          <div className="prose dark:prose-invert max-w-none prose-sm">
            {tradingPlanSections.riskLimits.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h3 key={index} className="text-base">{line.substring(2)}</h3>;
              } else if (line.startsWith('## ')) {
                return <h4 key={index} className="text-sm">{line.substring(3)}</h4>;
              } else if (line.startsWith('- ')) {
                return <p key={index} className="mb-2 ml-4 flex items-start">
                  <span className="mr-2">•</span>
                  <span dangerouslySetInnerHTML={{ __html: line.substring(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') }} />
                </p>;
              } else if (line === '') {
                return <br key={index} />;
              } else {
                return <p key={index}>{line}</p>;
              }
            })}
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
            Recomendações da IA
          </h2>
          <div className="space-y-1">
            {generateAIRecommendations(challenge).map((recommendation, index) => (
              <AIRecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </div>
      </div>

      {/* Seção de Trades Recentes */}
      <div className="mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
            <List className="h-5 w-5 mr-2 text-primary-500" />
            Trades Recentes
          </h2>
          
          {accountTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Símbolo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Resultado</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {accountTrades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">
                        {formatDate(trade.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-200">
                        {trade.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-200">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.type === 'long' 
                            ? 'bg-profit-100 dark:bg-profit-900/30 text-profit-800 dark:text-profit-300' 
                            : 'bg-loss-100 dark:bg-loss-900/30 text-loss-800 dark:text-loss-300'
                        }`}>
                          {trade.type === 'long' ? 'LONG' : 'SHORT'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                        trade.pnl >= 0 
                          ? 'text-profit-600 dark:text-profit-400' 
                          : 'text-loss-600 dark:text-loss-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {accountTrades.length > 10 && (
                <div className="mt-4 text-center">
                  <button 
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                    onClick={() => {
                      navigate('/journal', { 
                        state: { 
                          selectedAccountId: id 
                        }
                      })
                    }}
                  >
                    Ver todos os {accountTrades.length} trades
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500 dark:text-neutral-400">Nenhum trade registrado para esta conta.</p>
              <button 
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                onClick={() => navigate('/journal', { 
                  state: { 
                    openAddTradeModal: true,
                    selectedAccountId: id 
                  } 
                })}
              >
                Adicionar Trade
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 