import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Trophy, 
  AlertCircle, 
  Filter
} from 'lucide-react';
import { PropFirmChallenge } from '../../types/propFirmChallenge';
import { useChallenges } from '../../context/ChallengesContext';
import ChallengeCard from '../../components/challenges/ChallengeCard';
import { useAccounts } from '../../context/AccountsContext';
import { useTranslation } from 'react-i18next';

const ChallengesPage: React.FC = () => {
  const { t } = useTranslation(['common', 'accounts']);
  const { challenges, isLoading } = useChallenges();
  const { loading: accountsLoading } = useAccounts();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
  const navigate = useNavigate();

  // Filtra os desafios com base no filtro selecionado
  const filteredChallenges = challenges.filter(challenge => {
    const { isPassed, isDailyDrawdownViolated, isOverallDrawdownViolated } = challenge?.status || {};
    
    switch (filter) {
      case 'active':
        return !isPassed && !isDailyDrawdownViolated && !isOverallDrawdownViolated;
      case 'completed':
        return !!isPassed;
      case 'failed':
        return !!isDailyDrawdownViolated || !!isOverallDrawdownViolated;
      default:
        return true; // 'all'
    }
  });

  // Ordena os desafios: ativos primeiro, depois concluídos, depois falhos
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    const getStatusPriority = (challenge: PropFirmChallenge) => {
      const { isPassed, isDailyDrawdownViolated, isOverallDrawdownViolated } = challenge.status;
      if (!isPassed && !isDailyDrawdownViolated && !isOverallDrawdownViolated) return 0; // Ativo
      if (isPassed) return 1; // Concluído
      return 2; // Falho
    };
    
    return getStatusPriority(a) - getStatusPriority(b);
  });

  if (isLoading || accountsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-primary-500" />
            Desafios de Prop Firm
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Gerencie seus desafios de prop firm e acompanhe seu progresso.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative inline-block">
            <button
              onClick={() => navigate('/challenges/new')}
              className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Desafio
            </button>
          </div>
          
          <div className="relative inline-block">
            <button
              onClick={() => {
                const newFilter = 
                  filter === 'all' ? 'active' : 
                  filter === 'active' ? 'completed' : 
                  filter === 'completed' ? 'failed' : 'all';
                setFilter(newFilter);
              }}
              className="flex items-center px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-md transition-colors text-neutral-800 dark:text-neutral-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtro: {filter === 'all' ? 'Todos' : filter === 'active' ? 'Ativos' : filter === 'completed' ? 'Concluídos' : 'Falhos'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Estado vazio */}
      {sortedChallenges.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-lg p-8 text-center shadow-sm border border-neutral-200 dark:border-neutral-700">
          <AlertCircle className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-600 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {filter === 'all' 
              ? 'Nenhum desafio encontrado' 
              : `Nenhum desafio ${filter === 'active' ? 'ativo' : filter === 'completed' ? 'concluído' : 'falho'} encontrado`}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            {filter === 'all' 
              ? 'Comece criando seu primeiro desafio de prop firm.' 
              : 'Tente mudar o filtro para ver outros desafios.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/challenges/new')}
              className="mt-6 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2 inline-block" />
              Criar Desafio
            </button>
          )}
        </div>
      )}
      
      {/* Lista de desafios */}
      {sortedChallenges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChallenges.map(challenge => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengesPage; 