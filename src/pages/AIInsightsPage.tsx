import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, CheckCircle, Zap, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HourlyPerformanceChart from '../components/charts/HourlyPerformanceChart';
import AccuracyHistoryChart from '../components/charts/AccuracyHistoryChart';
import AILearningChart from '../components/charts/AILearningChart';
import CollapsibleSection from '../components/ui/CollapsibleSection';

interface Insight {
  type: 'pattern' | 'alert' | 'suggestion' | 'benchmark';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  isNew?: boolean;
  updatedAt?: string;
}

const AIInsightsPage: React.FC = () => {
  const { t } = useTranslation();
  const [focusedHour, setFocusedHour] = useState<string | null>(null);
  const [lastUpdated] = useState<string>('12 de junho, 08:45');

  // Mock AI insights data
  const aiInsights: Insight[] = [
    {
      type: 'pattern',
      title: 'Breakout Strategy Performing Well',
      description: 'Your breakout trades have a 78% win rate this month, significantly above your average. Consider increasing position size on high-confidence breakout setups.',
      confidence: 87,
      action: 'View Breakout Analysis',
      isNew: true,
      updatedAt: '2h atrás'
    },
    {
      type: 'alert',
      title: 'Consecutive Loss Alert',
      description: 'You have 4 consecutive losing trades. Historical data suggests taking a break or reducing position size for the next 2-3 trades.',
      confidence: 92,
      action: 'Review Risk Management',
      updatedAt: '1d atrás'
    },
    {
      type: 'suggestion',
      title: 'Optimal Trading Hours Detected',
      description: 'Your best performance occurs between 9:30-11:00 AM EST. Consider focusing more trades during this window.',
      confidence: 74,
      action: 'Adjust Schedule',
      isNew: false,
      updatedAt: '12h atrás'
    },
    {
      type: 'benchmark',
      title: 'Above Market Performance',
      description: 'Your 3-month return of 12.5% outperforms SPY by 8.3%. Your risk-adjusted returns are in the top 15% of similar traders.',
      confidence: 95,
      action: 'View Benchmark Report',
      updatedAt: '3d atrás'
    }
  ];

  // Mock data para os gráficos
  const hourlyPerformanceData = [
    { hour: "00:00", winRate: 52 },
    { hour: "01:00", winRate: 61 },
    { hour: "02:00", winRate: 49 },
    { hour: "03:00", winRate: 45 },
    { hour: "04:00", winRate: 47 },
    { hour: "05:00", winRate: 53 },
    { hour: "06:00", winRate: 58 },
    { hour: "07:00", winRate: 62 },
    { hour: "08:00", winRate: 68 },
    { hour: "09:00", winRate: 75 },
    { hour: "10:00", winRate: 82 },
    { hour: "11:00", winRate: 71 },
    { hour: "12:00", winRate: 65 },
    { hour: "13:00", winRate: 59 },
    { hour: "14:00", winRate: 55 },
    { hour: "15:00", winRate: 63 },
    { hour: "16:00", winRate: 67 },
    { hour: "17:00", winRate: 72 },
    { hour: "18:00", winRate: 69 },
    { hour: "19:00", winRate: 64 },
    { hour: "20:00", winRate: 59 },
    { hour: "21:00", winRate: 56 },
    { hour: "22:00", winRate: 53 },
    { hour: "23:00", winRate: 55 }
  ];

  const accuracyHistoryData = [
    { date: "2025-05-01", accuracy: 70 },
    { date: "2025-05-02", accuracy: 73 },
    { date: "2025-05-03", accuracy: 68 },
    { date: "2025-05-04", accuracy: 72 },
    { date: "2025-05-05", accuracy: 75 },
    { date: "2025-05-06", accuracy: 78 },
    { date: "2025-05-07", accuracy: 76 },
    { date: "2025-05-08", accuracy: 80 },
    { date: "2025-05-09", accuracy: 83 },
    { date: "2025-05-10", accuracy: 85 },
    { date: "2025-05-11", accuracy: 82 },
    { date: "2025-05-12", accuracy: 84 },
    { date: "2025-05-13", accuracy: 88 },
    { date: "2025-05-14", accuracy: 91 },
    { date: "2025-05-15", accuracy: 94 }
  ];

  const aiLearningData = [
    { week: "Semana 1", score: 30 },
    { week: "Semana 2", score: 45 },
    { week: "Semana 3", score: 60 },
    { week: "Semana 4", score: 68 },
    { week: "Semana 5", score: 75 },
    { week: "Semana 6", score: 82 },
    { week: "Semana 7", score: 87 },
    { week: "Semana 8", score: 94 }
  ];

  // Helper functions to determine styling based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'suggestion': return Target;
      case 'benchmark': return CheckCircle;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800';
      case 'alert': return 'bg-loss-50 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400 border-loss-200 dark:border-loss-800';
      case 'suggestion': return 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800';
      case 'benchmark': return 'bg-profit-50 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400 border-profit-200 dark:border-profit-800';
      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-profit-600 dark:text-profit-400';
    if (confidence >= 60) return 'text-secondary-600 dark:text-secondary-400';
    return 'text-loss-600 dark:text-loss-400';
  };

  // Function to find specific insight by title
  const findInsightByTitle = (title: string): Insight | undefined => {
    return aiInsights.find(insight => insight.title === title);
  };

  // Função para lidar com clique na barra do gráfico de horas
  const handleBarClick = (hour: string, winRate: number) => {
    setFocusedHour(hour);
    // Poderia filtrar insights por hora ou mostrar mais detalhes
    console.log(`Focando em insights para o horário ${hour} com win rate ${winRate}%`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t('ai_insights.title')}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('ai_insights.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Indicador de última atualização global */}
          <div className="text-xs flex items-center text-neutral-500 dark:text-neutral-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>{t('ai_insights.last_update')}: {lastUpdated}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-neutral-700 dark:text-neutral-300 mt-4 mb-6 max-w-3xl">
          {t('ai_insights.description')}
        </p>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {aiInsights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          const isHighlighted = focusedHour && insight.title === 'Optimal Trading Hours Detected';
          
          return (
            <div
              key={index}
              className={`p-5 rounded-xl border bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-all duration-300 ${getInsightColor(insight.type)} ${isHighlighted ? 'ring-2 ring-primary-400 dark:ring-primary-600 transform scale-[1.02]' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-base">{insight.title}</h3>
                      {insight.isNew && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-400">
                          Novo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-2 text-neutral-700 dark:text-neutral-300">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    {insight.action && (
                      <button className="text-xs font-medium px-3 py-1.5 bg-white dark:bg-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors shadow-sm">
                        {insight.action}
                      </button>
                    )}
                    
                    {insight.updatedAt && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {insight.updatedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Análise de Desempenho por Hora */}
      <CollapsibleSection 
        title={t('ai_insights.hourly_performance')}
        icon={Clock}
        defaultOpen={true}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-4">
          <HourlyPerformanceChart 
            data={hourlyPerformanceData} 
            onBarClick={handleBarClick}
            focusedHour={focusedHour}
          />
        </div>
      </CollapsibleSection>

      {/* Precisão da IA ao Longo do Tempo */}
      <CollapsibleSection 
        title={t('ai_insights.ai_accuracy')}
        icon={Target}
        defaultOpen={true}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-4">
          <AccuracyHistoryChart data={accuracyHistoryData} />
        </div>
      </CollapsibleSection>

      {/* Evolução do Aprendizado da IA */}
      <CollapsibleSection 
        title={t('ai_insights.ai_learning')}
        icon={Brain}
        defaultOpen={true}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-4">
          <AILearningChart data={aiLearningData} />
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default AIInsightsPage; 