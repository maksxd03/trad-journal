import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChallengeSetupForm from '../../components/challenges/ChallengeSetupForm';
import { PropFirmRules } from '../../types/propFirmChallenge';
import { useChallenges } from '../../context/ChallengesContext';

const NewChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const { addChallenge } = useChallenges();
  
  // Efeito para redirecionar após o desafio ser criado
  useEffect(() => {
    if (newlyCreatedId) {
      console.log('🎯 Redirecionando para o desafio recém-criado:', newlyCreatedId);
      // Pequeno timeout para garantir que o estado foi atualizado
      const redirectTimer = setTimeout(() => {
        navigate(`/challenges/${newlyCreatedId}`);
      }, 100);
      
      // Limpar o timer se o componente for desmontado
      return () => clearTimeout(redirectTimer);
    }
  }, [newlyCreatedId, navigate]);
  
  // Função para lidar com a submissão do formulário
  const handleSubmit = async (rules: PropFirmRules) => {
    setIsSubmitting(true);
    
    try {
      console.log('Criando novo desafio com regras:', rules);
      
      // Usa a função do contexto para adicionar o desafio
      const challengeId = addChallenge({
        startDate: new Date(),
        rules
      });
      
      console.log('✅ Desafio criado com ID:', challengeId);
      
      // Armazena o ID do desafio criado para exibir o link
      setNewlyCreatedId(challengeId);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erro ao criar o desafio:', error);
      alert('Ocorreu um erro ao criar o desafio. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };

  // --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL ---
  if (newlyCreatedId) {
    // Se um desafio acabou de ser criado, mostre a mensagem de sucesso com estado de carregamento
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Desafio Criado com Sucesso!
          </h2>
          
          <p className="mt-4 mb-6 text-neutral-600 dark:text-neutral-400">
            Seu novo desafio está pronto. Você será redirecionado automaticamente...
          </p>
          
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
          
          <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-md text-sm">
            <p className="text-neutral-500 dark:text-neutral-400 mb-2">
              ID do seu novo desafio:
            </p>
            <code className="block p-2 bg-neutral-100 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600 select-all overflow-x-auto">
              {newlyCreatedId}
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Novo Desafio de Prop Firm
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Configure as regras do seu desafio de prop firm e comece a rastrear seu progresso.
        </p>
      </div>
      
      {isSubmitting ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-12 text-center border border-neutral-200 dark:border-neutral-700">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
          <h2 className="text-lg font-medium text-neutral-900 dark:text-white">
            Criando seu desafio...
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Por favor, aguarde enquanto processamos as informações.
          </p>
        </div>
      ) : (
        <ChallengeSetupForm onSubmit={handleSubmit} />
      )}
      
      <div className="mt-8 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <h3 className="font-medium text-neutral-900 dark:text-white mb-2">
          📋 Dicas para configurar seu desafio
        </h3>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2">
          <li>• Verifique cuidadosamente as regras oficiais de sua prop firm antes de configurar o desafio.</li>
          <li>• Para desafios em fases múltiplas, crie um desafio separado para cada fase.</li>
          <li>• O tipo de drawdown "Trailing" geralmente é mais restritivo que o "Estático", pois é calculado a partir do equilíbrio mais alto.</li>
          <li>• Planeje sua estratégia considerando as restrições de drawdown e a meta de lucro.</li>
        </ul>
      </div>
    </div>
  );
};

export default NewChallengePage; 