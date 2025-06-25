import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountForm from '../../components/accounts/AccountForm';
import ImportInstructions from '../../components/accounts/ImportInstructions';
import { Check, ArrowLeft } from 'lucide-react';

const NewAccountPage: React.FC = () => {
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Escuta o evento de mudança de broker para atualizar as instruções
  useEffect(() => {
    const handleBrokerChange = (event: CustomEvent) => {
      setSelectedBroker(event.detail.broker);
    };

    // Adiciona o event listener
    window.addEventListener('brokerChange' as any, handleBrokerChange);

    // Remove o event listener quando o componente é desmontado
    return () => {
      window.removeEventListener('brokerChange' as any, handleBrokerChange);
    };
  }, []);

  // Efeito para redirecionar após a conta ser criada
  useEffect(() => {
    if (newlyCreatedId) {
      const redirectTimer = setTimeout(() => {
        navigate(`/accounts/${newlyCreatedId}`);
      }, 1500); // Aguarda 1.5 segundos para exibir a mensagem de sucesso
      
      return () => clearTimeout(redirectTimer);
    }
  }, [newlyCreatedId, navigate]);
  
  // Handler para quando uma conta é criada com sucesso
  const handleAccountCreated = (accountId: string) => {
    setNewlyCreatedId(accountId);
  };
  
  // --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL ---
  if (newlyCreatedId) {
    // Se uma conta acabou de ser criada, mostre a mensagem de sucesso com estado de carregamento
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 mb-4">
            <Check className="h-6 w-6" />
          </div>
          
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Conta Criada com Sucesso!
          </h2>
          
          <p className="mt-4 mb-6 text-neutral-600 dark:text-neutral-400">
            Sua nova conta está pronta. Você será redirecionado automaticamente...
          </p>
          
          <div className="inline-block animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Cabeçalho */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/accounts')}
            className="mr-3 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Adicionar Nova Conta
          </h2>
        </div>
        
        <div className="border-b border-neutral-200 dark:border-neutral-700"></div>
      </div>
      
      {/* Formulário */}
      <AccountForm onAccountCreated={handleAccountCreated} />
      
      {/* Instruções de importação (exibidas apenas quando uma corretora é selecionada) */}
      {selectedBroker && (
        <div className="mt-6">
          <ImportInstructions broker={selectedBroker} />
        </div>
      )}
    </div>
  );
};

export default NewAccountPage; 