import React, { useState } from 'react';
import { NotebookPen, Upload, Gauge, BellRing, Brain, BarChart3 } from 'lucide-react';
import FeatureCard from './FeatureCard';
import Tabs from './ui/Tabs';
import FeatureGallery from './ui/FeatureGallery';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  category: 'core' | 'propfirm' | 'advanced';
}

const Features: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'core' | 'propfirm' | 'advanced' | 'all'>('all');

  const allFeatures: Feature[] = [
    {
      title: 'Diário de Trades',
      description: 'Registre todas as suas operações com detalhes e analise cada entrada e saída com precisão.',
      icon: NotebookPen,
      iconBgColor: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-600 dark:text-primary-400',
      category: 'core'
    },
    {
      title: 'Importação Automática',
      description: 'Importe operações automaticamente do MT4, MT5 ou outras plataformas sem entrada manual.',
      icon: Upload,
      iconBgColor: 'bg-secondary-100 dark:bg-secondary-900/30',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      category: 'core'
    },
    {
      title: 'Simulador de Prop Firm',
      description: 'Configure e monitore regras de drawdown e metas de profit para garantir que você atenda aos requisitos das prop firms.',
      icon: Gauge,
      iconBgColor: 'bg-secondary-100 dark:bg-secondary-900/30',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      category: 'propfirm'
    },
    {
      title: 'Alertas de Drawdown',
      description: 'Receba alertas em tempo real quando você se aproximar de limites de drawdown diário, semanal ou mensal.',
      icon: BellRing,
      iconBgColor: 'bg-loss-100 dark:bg-loss-900/30',
      iconColor: 'text-loss-600 dark:text-loss-400',
      category: 'propfirm'
    },
    {
      title: 'Métricas de Disciplina',
      description: 'Analise sua aderência a estratégias e identifique desvios de regras com métricas avançadas de disciplina.',
      icon: BarChart3,
      iconBgColor: 'bg-primary-100 dark:bg-primary-900/30',
      iconColor: 'text-primary-600 dark:text-primary-400',
      category: 'advanced'
    },
    {
      title: 'Feedback de IA',
      description: 'Obtenha insights personalizados sobre seu trading com análise de padrões e recomendações para melhorar seus resultados.',
      icon: Brain,
      iconBgColor: 'bg-profit-100 dark:bg-profit-900/30',
      iconColor: 'text-profit-600 dark:text-profit-400',
      category: 'advanced'
    }
  ];

  const featureTabs = [
    { id: 'all', label: 'Todas' },
    { id: 'core', label: 'Core' },
    { id: 'propfirm', label: 'Prop Firm' },
    { id: 'advanced', label: 'Avançado' }
  ];

  const handleFeatureTabChange = (tabId: string) => {
    setActiveCategory(tabId as 'core' | 'propfirm' | 'advanced' | 'all');
  };

  const displayedFeatures = activeCategory === 'all' 
    ? allFeatures 
    : allFeatures.filter(feature => feature.category === activeCategory);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 py-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Recursos poderosos para traders exigentes
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Tudo o que você precisa para analisar, otimizar e melhorar seus resultados no trading.
          </p>
          
          <FeatureGallery />
          
          <Tabs 
            tabs={featureTabs}
            defaultTab="all"
            onChange={handleFeatureTabChange}
          />
        </div>
        
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${displayedFeatures.length > 2 ? 'lg:grid-cols-3' : ''} gap-6 sm:gap-8`}>
          {displayedFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconBgColor={feature.iconBgColor}
              iconColor={feature.iconColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features; 