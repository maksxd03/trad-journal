import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef, useCallback } from 'react';
import { PropFirmChallenge, ChallengeStatus } from '../types/propFirmChallenge';
import { updateChallengeStatus } from '../lib/ai/riskCopilot';
import { dehydrateChallenge, hydrateChallenge } from '../lib/serializationUtils';
import { Trade } from '../types/trade';

interface ChallengesContextType {
  challenges: PropFirmChallenge[];
  getChallenge: (id: string) => PropFirmChallenge | undefined;
  getChallengeWithStatus: (id: string) => PropFirmChallenge | undefined;
  addChallenge: (newChallenge: Omit<PropFirmChallenge, 'id' | 'userId' | 'trades'>) => string;
  recalculateChallengeStatus: (challengeId: string, allTrades: Trade[]) => void;
  isLoading: boolean;
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

export function ChallengesProvider({ children }: { children: ReactNode }) {
  const [challenges, setChallenges] = useState<PropFirmChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Variável para guardar a referência do timer do debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para salvar desafios no localStorage com debounce
  const saveChallengesToStorage = useCallback((challengesToSave: PropFirmChallenge[]) => {
    // Cancela qualquer salvamento anterior agendado
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Agenda um novo salvamento para daqui a 500ms
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        // DESIDRATAÇÃO: Converte os dados para um formato seguro antes de salvar
        const serializableChallenges = challengesToSave.map(dehydrateChallenge);
        localStorage.setItem('propFirmChallenges', JSON.stringify(serializableChallenges));
        console.log(`💾✅ Context: Desafios salvos no localStorage (com debounce)`);
      } catch (error) {
        console.error("❌ Falha ao salvar desafios no localStorage", error);
      }
    }, 500); // Atraso de 500ms
  }, []);

  // Efeito para carregar os desafios do localStorage UMA VEZ quando o app inicia
  useEffect(() => {
    try {
      console.log('🔄 Context: Carregando desafios do localStorage');
      const savedChallenges = localStorage.getItem('propFirmChallenges');
      
      if (savedChallenges) {
        const parsedData = JSON.parse(savedChallenges);
        
        // Verificar se é um array
        if (Array.isArray(parsedData)) {
          try {
            // HIDRATAÇÃO: Converte os dados lidos para os tipos corretos
            const hydratedChallenges = parsedData.map(hydrateChallenge);
            console.log('✅ Context: Desafios hidratados com sucesso:', hydratedChallenges.length);
            setChallenges(hydratedChallenges);
          } catch (hydrationError) {
            console.error('❌ Context: Erro ao hidratar desafios:', hydrationError);
            setChallenges([]);
          }
        } else {
          console.error('❌ Context: Dados salvos não são um array');
          setChallenges([]);
        }
      } else {
        console.log('📝 Context: Nenhum desafio encontrado no localStorage');
        setChallenges([]);
      }
    } catch (error) {
      console.error("❌ Context: Falha ao carregar desafios do localStorage", error);
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoize a função getChallenge para que sua referência seja estável
  const getChallenge = useCallback((id: string): PropFirmChallenge | undefined => {
    if (!id) return undefined;
    
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) {
      console.warn(`⚠️ Context: Desafio com ID ${id} não encontrado`);
      return undefined;
    }
    
    return challenge;
  }, [challenges]);

  // Memoize a função getChallengeWithStatus para que sua referência seja estável
  const getChallengeWithStatus = useCallback((id: string): PropFirmChallenge | undefined => {
    const challenge = getChallenge(id);
    if (!challenge) return undefined;
    
    try {
      console.log('🧮 Context: Calculando status para desafio', id);
      
      // Clone para evitar mutações
      const challengeToProcess = structuredClone(challenge);
      
      // Já não precisamos converter manualmente, pois a hidratação garante o tipo correto
      // Mas mantemos a verificação por segurança
      if (challengeToProcess.status?.daysTraded && !(challengeToProcess.status.daysTraded instanceof Set)) {
        console.warn('⚠️ Context: daysTraded não é um Set, convertendo...');
        challengeToProcess.status.daysTraded = new Set(
          Array.isArray(challengeToProcess.status.daysTraded) 
            ? challengeToProcess.status.daysTraded 
            : []
        );
      }
      
      // Calcular status atualizado
      const updatedStatus = updateChallengeStatus(challengeToProcess);
      
      // Atualizar o status no estado central
      if (JSON.stringify(Array.from(updatedStatus.daysTraded || [])) !== 
          JSON.stringify(Array.from(challenge.status?.daysTraded || [])) ||
          updatedStatus.currentEquity !== challenge.status?.currentEquity) {
        
        console.log('🔄 Context: Atualizando status no estado central');
        setChallenges(prev => {
          const updatedChallenges = prev.map(c => {
            if (c.id === id) {
              return {
                ...c,
                status: updatedStatus
              };
            }
            return c;
          });
          
          // Agenda o salvamento com debounce após atualização de status
          saveChallengesToStorage(updatedChallenges);
          
          return updatedChallenges;
        });
      }
      
      // Retornar cópia com status atualizado
      return {
        ...challengeToProcess,
        status: updatedStatus
      };
    } catch (error) {
      console.error('❌ Context: Erro no cálculo de status:', error);
      return challenge;
    }
  }, [challenges, getChallenge, saveChallengesToStorage]);

  // Memoize a função addChallenge para que sua referência seja estável
  const addChallenge = useCallback((newChallengeData: Omit<PropFirmChallenge, 'id' | 'userId' | 'trades'>): string => {
    console.log('➕ Context: Adicionando novo desafio', newChallengeData.rules.firmName);
    
    // Definir valores padrão para propriedades obrigatórias
    const accountSize = newChallengeData.rules.accountSize;
    const maxDailyDrawdown = newChallengeData.rules.maxDailyDrawdown || 5;
    const maxOverallDrawdown = newChallengeData.rules.maxOverallDrawdown || 10;
    
    // Gerar um ID único para o novo desafio
    const newId = crypto.randomUUID();
    
    const newChallenge: PropFirmChallenge = {
      ...newChallengeData,
      id: newId,
      userId: 'user123', // Simulação
      trades: [],
      status: { // Define um status inicial padrão
        currentEquity: accountSize,
        highWaterMark: accountSize,
        daysTraded: new Set<string>(),
        distanceToDailyDrawdown: accountSize * (maxDailyDrawdown / 100),
        distanceToOverallDrawdown: accountSize * (maxOverallDrawdown / 100),
        isDailyDrawdownViolated: false,
        isOverallDrawdownViolated: false,
        isPassed: false,
      },
    };
    
    // Atualizando o estado com o novo desafio
    setChallenges(prev => {
      const updatedChallenges = [...prev, newChallenge];
      console.log('💾 Context: Estado atualizado com novo desafio. Total:', updatedChallenges.length);
      
      // Agenda o salvamento com debounce
      saveChallengesToStorage(updatedChallenges);
      
      return updatedChallenges;
    });
    
    // Retorna o ID para que a página possa redirecionar
    return newId;
  }, [saveChallengesToStorage]);

  // Nova função para recalcular o status de um desafio com base em um conjunto de trades
  const recalculateChallengeStatus = useCallback((challengeId: string, allTrades: Trade[]) => {
    // Encontra o desafio que precisa ser atualizado
    const challengeToUpdate = challenges.find(c => c.id === challengeId);
    if (!challengeToUpdate) {
      console.warn(`⚠️ Context: Desafio com ID ${challengeId} não encontrado para recálculo`);
      return;
    }

    // Filtra os trades associados a este desafio
    const associatedTrades = allTrades.filter(trade => trade.challengeId === challengeId);
    console.log(`🔄 Context: Recalculando status para desafio ${challengeId} com ${associatedTrades.length} trades associados`);

    try {
      // Clone o desafio para evitar mutações diretas
      const challengeToProcess = structuredClone(challengeToUpdate);
      
      // Atualiza os trades do desafio com os trades associados
      challengeToProcess.trades = associatedTrades;
      
      // Chama a função que sabe fazer todos os cálculos
      const updatedStatus = updateChallengeStatus(challengeToProcess);
      
      // Atualiza o estado global dos desafios
      setChallenges(prev => {
        const updatedChallenges = prev.map(c => {
          if (c.id === challengeId) {
            return {
              ...c,
              trades: associatedTrades, // Atualiza também os trades
              status: updatedStatus
            };
          }
          return c;
        });
        
        // Salva com debounce
        saveChallengesToStorage(updatedChallenges);
        
        return updatedChallenges;
      });
      
      console.log('✅ Context: Status do desafio recalculado com sucesso');
    } catch (error) {
      console.error('❌ Context: Erro ao recalcular status do desafio:', error);
    }
  }, [challenges, saveChallengesToStorage]);

  // Usando useMemo para criar o objeto de valor que só muda quando as dependências mudam
  const value = useMemo(() => ({ 
    challenges, 
    getChallenge, 
    getChallengeWithStatus, 
    addChallenge,
    recalculateChallengeStatus,
    isLoading 
  }), [challenges, isLoading, getChallenge, getChallengeWithStatus, addChallenge, recalculateChallengeStatus]);

  return (
    <ChallengesContext.Provider value={value}>
      {children}
    </ChallengesContext.Provider>
  );
}

export function useChallenges() {
  const context = useContext(ChallengesContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengesProvider');
  }
  return context;
} 