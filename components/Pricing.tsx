import React from 'react';
import Link from 'next/link';
import { Check, Star, Zap, Crown } from 'lucide-react';

const PricingCard = ({ plan, price, period, description, features, isPopular, icon: Icon, gradient }) => (
  <div className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 ${isPopular ? 'ring-2 ring-[#FF7F50] dark:ring-[#00E5FF] scale-105' : 'hover:scale-105'}`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gradient-to-r from-[#FF7F50] to-[#004E64] dark:from-[#00E5FF] dark:to-[#004E64] text-white px-6 py-2 rounded-full text-sm font-semibold">
          Mais Popular
        </div>
      </div>
    )}
    
    <div className="text-center mb-8">
      <div className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-[#1F2937] dark:text-[#E0E0E0] mb-2">
        {plan}
      </h3>
      
      <div className="mb-4">
        <span className="text-4xl font-bold text-[#1F2937] dark:text-[#E0E0E0]">
          R${price}
        </span>
        <span className="text-gray-600 dark:text-gray-400">/{period}</span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
    
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start space-x-3">
          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
    
    <Link
      href="/pricing"
      className={`block w-full py-4 rounded-xl font-semibold text-center transition-all duration-300 ${
        isPopular
          ? 'bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] text-white hover:shadow-xl hover:scale-105'
          : 'border-2 border-[#004E64] dark:border-[#00E5FF] text-[#004E64] dark:text-[#00E5FF] hover:bg-[#004E64] hover:text-white dark:hover:bg-[#00E5FF] dark:hover:text-[#1E1E2F]'
      }`}
    >
      Assinar {plan}
    </Link>
  </div>
);

const Pricing = () => {
  const plans = [
    {
      plan: "Básico",
      price: "29",
      period: "mês",
      description: "Ideal para traders iniciantes",
      features: [
        "Diário de trades básico",
        "Até 100 trades/mês",
        "Métricas essenciais",
        "Suporte por email",
        "Exportação de dados"
      ],
      icon: Star,
      gradient: "bg-gradient-to-br from-gray-500 to-gray-600"
    },
    {
      plan: "Pro",
      price: "49",
      period: "mês",
      description: "Para traders sérios e consistentes",
      features: [
        "Tudo do plano Básico",
        "Trades ilimitados",
        "Simulador prop firm",
        "Alertas de drawdown",
        "Analytics avançados",
        "Suporte prioritário"
      ],
      isPopular: true,
      icon: Zap,
      gradient: "bg-gradient-to-br from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64]"
    },
    {
      plan: "Premium",
      price: "79",
      period: "mês",
      description: "Para traders profissionais",
      features: [
        "Tudo do plano Pro",
        "IA de disciplina avançada",
        "Relatórios personalizados",
        "API para integração",
        "Suporte 24/7",
        "Consultoria mensal",
        "Acesso beta features"
      ],
      icon: Crown,
      gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1F2937] dark:text-[#E0E0E0] mb-6">
            Planos{' '}
            <span className="bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] bg-clip-text text-transparent">
              Flexíveis
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Escolha o plano ideal para seu nível de trading. Todos os planos incluem 
            7 dias de teste gratuito, sem compromisso.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[#1F2937] dark:text-[#E0E0E0] mb-4">
              Garantia de 30 dias
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Não está satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas. 
              Nosso compromisso é com seu sucesso no trading.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Sem taxa de setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancele a qualquer momento</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Suporte em português</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Atualizações gratuitas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;