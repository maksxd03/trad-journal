import React from 'react';
import Link from 'next/link';
import { TrendingUp, Shield, Brain, BarChart3 } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] dark:text-[#E0E0E0] leading-tight">
                Seu Trading Journal{' '}
                <span className="bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] bg-clip-text text-transparent">
                  Inteligente
                </span>{' '}
                em Forex
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Domine suas operações com simulador de regras de prop firm, alertas de drawdown em tempo real 
                e métricas avançadas de disciplina. Transforme dados em decisões vencedoras.
              </p>
            </div>

            {/* Features highlights */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <Shield className="w-5 h-5 text-[#004E64] dark:text-[#00E5FF]" />
                <span className="text-sm font-medium text-[#1F2937] dark:text-[#E0E0E0]">Modo Prop Firm</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <TrendingUp className="w-5 h-5 text-[#FF7F50] dark:text-[#00E5FF]" />
                <span className="text-sm font-medium text-[#1F2937] dark:text-[#E0E0E0]">Alertas Drawdown</span>
              </div>
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
                <Brain className="w-5 h-5 text-[#004E64] dark:text-[#00E5FF]" />
                <span className="text-sm font-medium text-[#1F2937] dark:text-[#E0E0E0]">IA Disciplina</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-gradient-to-r from-[#004E64] to-[#FF7F50] dark:from-[#00E5FF] dark:to-[#004E64] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold text-lg text-center"
              >
                Experimente Grátis
              </Link>
              
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-[#004E64] dark:border-[#00E5FF] text-[#004E64] dark:text-[#00E5FF] rounded-xl hover:bg-[#004E64] hover:text-white dark:hover:bg-[#00E5FF] dark:hover:text-[#1E1E2F] transition-all duration-300 font-semibold text-lg text-center"
              >
                Ver Funcionalidades
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1F2937] dark:text-[#E0E0E0]">5,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Traders Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1F2937] dark:text-[#E0E0E0]">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1F2937] dark:text-[#E0E0E0]">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Suporte</div>
              </div>
            </div>
          </div>

          {/* Mockup/Illustration */}
          <div className="relative">
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-4">
                {/* Mock header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">TraderLog Pro</div>
                </div>
                
                {/* Mock dashboard */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-semibold text-[#1F2937] dark:text-[#E0E0E0]">Dashboard</div>
                    <div className="text-xs text-green-600 dark:text-green-400">+12.5%</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">P&L</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">$2,450</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Win Rate</div>
                      <div className="text-lg font-bold text-[#004E64] dark:text-[#00E5FF]">78%</div>
                    </div>
                  </div>
                  
                  <div className="h-20 bg-gradient-to-r from-[#004E64]/20 to-[#FF7F50]/20 dark:from-[#00E5FF]/20 dark:to-[#004E64]/20 rounded-lg flex items-end justify-around p-2">
                    <div className="w-2 bg-[#004E64] dark:bg-[#00E5FF] rounded-t h-8"></div>
                    <div className="w-2 bg-[#FF7F50] dark:bg-[#00E5FF] rounded-t h-12"></div>
                    <div className="w-2 bg-[#004E64] dark:bg-[#00E5FF] rounded-t h-6"></div>
                    <div className="w-2 bg-[#FF7F50] dark:bg-[#00E5FF] rounded-t h-16"></div>
                    <div className="w-2 bg-[#004E64] dark:bg-[#00E5FF] rounded-t h-10"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#004E64]/10 to-[#FF7F50]/10 dark:from-[#00E5FF]/10 dark:to-[#004E64]/10 rounded-2xl transform -rotate-3"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;