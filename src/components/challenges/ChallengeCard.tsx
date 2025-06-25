import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays, CheckSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { PropFirmChallenge } from '../../types/propFirmChallenge';

interface ChallengeCardProps {
  challenge: PropFirmChallenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  // Extract needed data from challenge
  const { id, rules, status, startDate } = challenge;
  const { accountSize = 0, profitTarget = 0, minTradingDays = 0 } = rules || {};
  const { currentEquity = 0, daysTraded = new Set<string>(), isPassed, isDailyDrawdownViolated, isOverallDrawdownViolated } = status || {};
  
  // Calculate profit/loss
  const pnlValue = currentEquity - accountSize;
  const pnlPercentage = (pnlValue / accountSize) * 100;
  
  // Calculate progress towards target
  const progressPercentage = Math.min(100, Math.max(0, (pnlValue / profitTarget) * 100));
  
  // Format currency values
  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Determine challenge status
  const getChallengeStatus = () => {
    if (isPassed) {
      return {
        label: 'Concluído',
        colorClass: 'bg-profit-100 dark:bg-profit-900/30 text-profit-700 dark:text-profit-400'
      };
    }
    
    if (isDailyDrawdownViolated || isOverallDrawdownViolated) {
      return {
        label: 'Falhou',
        colorClass: 'bg-loss-100 dark:bg-loss-900/30 text-loss-700 dark:text-loss-400'
      };
    }
    
    return {
      label: 'Ativo',
      colorClass: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
    };
  };
  
  const challengeStatus = getChallengeStatus();
  
  return (
    <Link 
      to={`/challenges/${id}`}
      className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Progress bar at top */}
      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 relative">
        <div 
          className={`absolute left-0 top-0 h-full ${progressPercentage === 100 ? 'bg-profit-500' : 'bg-primary-500'}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="p-5">
        {/* Header with title and status */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            {rules.firmName || 'Personalizado'} - {formatCurrency(accountSize)}
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs ${challengeStatus.colorClass} inline-flex items-center`}>
            {challengeStatus.label}
          </span>
        </div>
        
        {/* P&L as main focal point */}
        <div className="flex flex-col items-center mb-4">
          <div className={`text-2xl font-bold flex items-center ${
            pnlValue > 0 ? 'text-profit-500' : 
            pnlValue < 0 ? 'text-loss-500' : 
            'text-gray-500'
          }`}>
            {pnlValue > 0 && <TrendingUp className="w-5 h-5 mr-1" />}
            {pnlValue < 0 && <TrendingDown className="w-5 h-5 mr-1" />}
            {formatCurrency(Math.abs(pnlValue))}
          </div>
          <div className={`text-sm ${
            pnlPercentage > 0 ? 'text-profit-500' : 
            pnlPercentage < 0 ? 'text-loss-500' : 
            'text-gray-500'
          }`}>
            {pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
          </div>
        </div>
        
        {/* Progress bar towards profit target */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 mb-1">
            <span>Progresso</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressPercentage >= 100 ? 'bg-profit-500' : 'bg-primary-500'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Footer with start date and trading days */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center text-xs text-neutral-500">
          <div className="flex items-center">
            <CalendarDays className="w-3.5 h-3.5 mr-1" />
            <span>Início: {format(new Date(startDate || new Date()), 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex items-center">
            <CheckSquare className="w-3.5 h-3.5 mr-1" />
            <span>Dias: {daysTraded.size}{minTradingDays > 0 ? ` / ${minTradingDays}` : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChallengeCard; 