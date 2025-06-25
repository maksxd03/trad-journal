import React from 'react';
import { AlertCircle, TrendingUp, Lightbulb, Shield } from 'lucide-react';
import { RecommendationItem } from '../../../lib/ai/riskCopilot';

interface AIRecommendationCardProps {
  recommendation: RecommendationItem;
}

const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({ recommendation }) => {
  // Configuração de estilo com base no tipo de recomendação
  const getRecommendationStyles = () => {
    switch (recommendation.type) {
      case 'alert':
        return {
          icon: <AlertCircle className="h-5 w-5 text-loss-600 dark:text-loss-400" />,
          bgColor: 'bg-loss-100 dark:bg-loss-900/20',
          borderColor: 'border-loss-200 dark:border-loss-900/30',
          textColor: 'text-loss-800 dark:text-loss-300',
          label: 'Alerta'
        };
      case 'insight':
        return {
          icon: <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />,
          bgColor: 'bg-primary-100 dark:bg-primary-900/20',
          borderColor: 'border-primary-200 dark:border-primary-900/30',
          textColor: 'text-primary-800 dark:text-primary-300',
          label: 'Insight'
        };
      case 'tip':
        return {
          icon: <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-900/30',
          textColor: 'text-yellow-800 dark:text-yellow-300',
          label: 'Dica'
        };
      case 'strategy':
        return {
          icon: <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
          bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-900/30',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          label: 'Estratégia'
        };
      default:
        return {
          icon: <Lightbulb className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />,
          bgColor: 'bg-neutral-100 dark:bg-neutral-800',
          borderColor: 'border-neutral-200 dark:border-neutral-700',
          textColor: 'text-neutral-800 dark:text-neutral-300',
          label: 'Informação'
        };
    }
  };

  const styles = getRecommendationStyles();

  return (
    <div className={`rounded-lg p-4 ${styles.bgColor} border ${styles.borderColor} mb-3`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.bgColor} ${styles.textColor}`}>
              {styles.label}
            </span>
          </div>
          <p className={`text-sm ${styles.textColor}`}>
            {recommendation.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendationCard; 