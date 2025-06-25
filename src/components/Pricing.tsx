import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Tabs from './ui/Tabs';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
}

const PricingCard: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl p-6 lg:p-8 border ${
      plan.isPopular 
        ? 'border-primary-500 dark:border-primary-400' 
        : 'border-neutral-200 dark:border-neutral-700'
      } shadow-sm relative transition-all duration-200 hover:shadow-md`}
    >
      {plan.isPopular && (
        <span className="absolute top-0 right-6 transform -translate-y-1/2 bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-secondary-200 dark:border-secondary-800">
          Mais popular
        </span>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">{plan.name}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{plan.description}</p>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{plan.price}</span>
            <span className="text-neutral-500 dark:text-neutral-400 ml-1">/mês</span>
          </div>
        </div>
        
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-profit-500 dark:text-profit-400 flex-shrink-0 mr-2" />
              <span className="text-neutral-600 dark:text-neutral-400 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <a 
          href={plan.buttonLink} 
          className={`block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors duration-200 ${
            plan.isPopular 
              ? 'bg-primary-500 hover:bg-primary-600 text-white' 
              : 'bg-white dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-600'
          }`}
        >
          {plan.buttonText}
        </a>
      </div>
    </div>
  );
};

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const monthlyPlans: PricingPlan[] = [
    {
      name: 'Básico',
      price: 'R$29',
      description: 'Para traders iniciantes que buscam organização e análise básica.',
      features: [
        'Diário de Trades ilimitado',
        'Importação manual de operações',
        'Métricas básicas de desempenho',
        'Acesso via navegador',
      ],
      buttonText: 'Assinar',
      buttonLink: '/pricing?plan=basic&billing=monthly',
    },
    {
      name: 'Pro',
      price: 'R$49',
      description: 'Para traders ativos que desejam melhorar resultados.',
      features: [
        'Tudo do plano Básico',
        'Importação automática de operações',
        'Simulador de regras de Prop Firm',
        'Alertas de drawdown em tempo real',
        'Métricas avançadas de desempenho',
      ],
      isPopular: true,
      buttonText: 'Assinar',
      buttonLink: '/pricing?plan=pro&billing=monthly',
    },
    {
      name: 'Premium',
      price: 'R$79',
      description: 'Para traders profissionais que exigem o máximo.',
      features: [
        'Tudo do plano Pro',
        'Feedback de IA personalizado',
        'Backtesting de estratégias',
        'API para desenvolvedores',
        'Suporte prioritário',
        'Sem marca d\'água nos relatórios',
      ],
      buttonText: 'Assinar',
      buttonLink: '/pricing?plan=premium&billing=monthly',
    },
  ];

  const annualPlans: PricingPlan[] = [
    {
      name: 'Básico',
      price: 'R$23',
      description: 'Para traders iniciantes que buscam organização e análise básica.',
      features: [
        'Diário de Trades ilimitado',
        'Importação manual de operações',
        'Métricas básicas de desempenho',
        'Acesso via navegador',
        'Economia de 20% com plano anual',
      ],
      buttonText: 'Assinar',
      buttonLink: '/pricing?plan=basic&billing=annual',
    },
    {
      name: 'Pro',
      price: 'R$39',
      description: 'Para traders ativos que desejam melhorar resultados.',
      features: [
        'Tudo do plano Básico',
        'Importação automática de operações',
        'Simulador de regras de Prop Firm',
        'Alertas de drawdown em tempo real',
        'Métricas avançadas de desempenho',
        'Economia de 20% com plano anual',
      ],
      isPopular: true,
      buttonText: 'Assinar',
      buttonLink: '/pricing?plan=pro&billing=annual',
    },
    {
      name: 'Premium',
      price: 'R$63',
      description: 'Para traders profissionais que exigem o máximo.',
      features: [
        'Tudo do plano Pro',
        'Feedback de IA personalizado',
        'Backtesting de estratégias',
        'API para desenvolvedores',
        'Suporte prioritário',
        'Sem marca d\'água nos relatórios',
        'Economia de 20% com plano anual',
      ],
      buttonText: 'Assinar',
      buttonLink: '/pricing?plan=premium&billing=annual',
    },
  ];

  const plans = billingCycle === 'monthly' ? monthlyPlans : annualPlans;

  const pricingTabs = [
    { id: 'monthly', label: 'Mensal' },
    { id: 'annual', label: 'Anual' },
  ];

  const handlePricingTabChange = (tabId: string) => {
    setBillingCycle(tabId as 'monthly' | 'annual');
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 py-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Preços transparentes e sem surpresas. Cancele a qualquer momento.
          </p>
          
          <Tabs 
            tabs={pricingTabs} 
            defaultTab="monthly" 
            onChange={handlePricingTabChange}
          />
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Precisa de um plano personalizado para sua equipe ou empresa?{' '}
            <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 