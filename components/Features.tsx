import React from 'react';
import { BookOpen, Shield, AlertTriangle, Brain, BarChart3 } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, gradient }) => (
  <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
    <div className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    
    <h3 className="text-xl font-bold text-[#1F2937] dark:text-[#E0E0E0] mb-4">
      {title}
    </h3>
    
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
      {description}
    </p>
    
    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 dark:to-gray-700/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Diário de Trades Inteligente",
      description: "Registre e analise suas operações com importação automática de dados. Visualize padrões, identifique erros e melhore sua performance com insights detalhados.",
      gradient: "bg-gradient-to-br from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64]"
    },
    {
      icon: Shield,
      title: "Simulador Prop Firm",
      description: "Teste suas estratégias com regras reais de prop firms. Simule desafios, monitore métricas de risco e prepare-se para avaliações profissionais.",
      gradient: "bg-gradient-to-br from-[#FF7F50] to-[#004E64] dark:from-[#004E64] dark:to-[#00E5FF]"
    },
    {
      icon: AlertTriangle,
      title: "Alertas de Drawdown",
      description: "Receba notificações em tempo real quando se aproximar dos limites de risco. Proteja sua conta com alertas personalizáveis e gestão inteligente.",
      gradient: "bg-gradient-to-br from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400"
    },
    {
      icon: Brain,
      title: "Métricas de Disciplina IA",
      description: "Inteligência artificial analisa seus padrões comportamentais e oferece feedback personalizado para melhorar sua disciplina e consistência.",
      gradient: "bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400"
    },
    {
      icon: BarChart3,
      title: "Analytics Avançados",
      description: "Dashboards interativos com métricas profissionais: Sharpe ratio, profit factor, win rate, drawdown máximo e muito mais para análise completa.",
      gradient: "bg-gradient-to-br from-green-500 to-teal-500 dark:from-green-400 dark:to-teal-400"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-[#1F2937] dark:text-[#E0E0E0] mb-6">
            Funcionalidades{' '}
            <span className="bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] bg-clip-text text-transparent">
              Profissionais
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ferramentas avançadas desenvolvidas especificamente para traders que buscam 
            excelência e consistência nos mercados financeiros.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#1F2937] dark:text-[#E0E0E0] mb-4">
              Pronto para elevar seu trading?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Junte-se a milhares de traders que já transformaram seus resultados.
            </p>
            <a
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg"
            >
              Começar Agora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;