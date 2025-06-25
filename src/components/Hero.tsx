import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 pt-24 pb-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white leading-tight">
                Seu Trading Journal inteligente em Forex
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl">
                Acompanhe suas operações, receba alertas de drawdown, simule regras de Prop Firms e melhore sua disciplina com métricas avançadas e feedback de IA.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/signup" 
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary-500 hover:bg-secondary-600 text-white text-base font-medium rounded-lg transition-colors duration-200"
              >
                Experimente grátis
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="/pricing" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-base font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 transition-colors duration-200"
              >
                Confira planos
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L11.586 12H5a1 1 0 110-2h6.586l-2.293-2.293a1 1 0 011.414-1.414l4 4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900"></div>
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Mais de <span className="font-semibold text-neutral-900 dark:text-white">2,000+</span> traders ativos
                </p>
              </div>
            </div>
          </div>
          
          {/* Image placeholder */}
          <div className="rounded-xl bg-primary-50 dark:bg-neutral-800 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="aspect-video w-full max-w-md mx-auto bg-white dark:bg-neutral-700 rounded-lg shadow-lg overflow-hidden">
              <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero; 