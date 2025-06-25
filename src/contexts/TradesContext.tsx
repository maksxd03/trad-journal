import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef, useCallback } from 'react';
import { Trade } from '../types/trade';
import { useAccounts } from '../context/AccountsContext';

interface TradesContextType {
  trades: Trade[];
  getTrade: (id: string) => Trade | undefined;
  getTradesByAccount: (accountId: string) => Trade[];
  addTrade: (newTrade: Omit<Trade, 'id'>) => string;
  addTrades: (newTrades: Omit<Trade, 'id'>[]) => string[];
  updateTrade: (id: string, updatedData: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  deleteTradesByAccount: (accountId: string) => void;
  isLoading: boolean;
}

const TradesContext = createContext<TradesContextType | undefined>(undefined);

export function TradesProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { recalculateAccountStatus } = useAccounts();
  
  // Variável para guardar a referência do timer do debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para salvar trades no localStorage com debounce
  const saveTradesToStorage = useCallback((tradesToSave: Trade[]) => {
    // Cancela qualquer salvamento anterior agendado
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Agenda um novo salvamento para daqui a 500ms
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('trades', JSON.stringify(tradesToSave));
        console.log(`💾✅ TradesContext: Trades salvos no localStorage (com debounce)`);
      } catch (error) {
        console.error("❌ TradesContext: Falha ao salvar trades no localStorage", error);
      }
    }, 500); // Atraso de 500ms
  }, []);

  // Efeito para carregar os trades do localStorage quando o app inicia
  useEffect(() => {
    try {
      console.log('🔄 TradesContext: Carregando trades do localStorage');
      const savedTrades = localStorage.getItem('trades');
      
      if (savedTrades) {
        const parsedTrades = JSON.parse(savedTrades);
        
        // Verificar se é um array
        if (Array.isArray(parsedTrades)) {
          // Converter datas de string para objeto Date
          const hydratedTrades = parsedTrades.map((trade: any) => ({
            ...trade,
            openTime: trade.openTime ? new Date(trade.openTime) : null,
            closeTime: trade.closeTime ? new Date(trade.closeTime) : null,
          }));
          
          console.log('✅ TradesContext: Trades carregados com sucesso:', hydratedTrades.length);
          setTrades(hydratedTrades);
        } else {
          console.error('❌ TradesContext: Dados salvos não são um array');
          setTrades([]);
        }
      } else {
        console.log('📝 TradesContext: Nenhum trade encontrado no localStorage');
        setTrades([]);
      }
    } catch (error) {
      console.error("❌ TradesContext: Falha ao carregar trades do localStorage", error);
      setTrades([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para obter um trade pelo ID
  const getTrade = useCallback((id: string): Trade | undefined => {
    if (!id) return undefined;
    
    const trade = trades.find(t => t.id === id);
    if (!trade) {
      console.warn(`⚠️ TradesContext: Trade com ID ${id} não encontrado`);
      return undefined;
    }
    
    return trade;
  }, [trades]);

  // Função para obter trades por conta
  const getTradesByAccount = useCallback((accountId: string): Trade[] => {
    if (!accountId) return [];
    
    return trades.filter(trade => trade.accountId === accountId);
  }, [trades]);

  // Função para adicionar um novo trade
  const addTrade = useCallback((newTradeData: Omit<Trade, 'id'>): string => {
    console.log('➕ TradesContext: Adicionando novo trade', newTradeData.symbol);
    
    // Gerar um ID único para o novo trade
    const newId = crypto.randomUUID();
    
    const newTrade: Trade = {
      ...newTradeData,
      id: newId,
    };
    
    // Atualizando o estado com o novo trade
    setTrades(prev => {
      const updatedTrades = [...prev, newTrade];
      console.log('💾 TradesContext: Estado atualizado com novo trade. Total:', updatedTrades.length);
      
      // Agenda o salvamento com debounce
      saveTradesToStorage(updatedTrades);
      
      return updatedTrades;
    });
    
    // Recalcular o status da conta associada
    if (newTrade.accountId) {
      // Precisamos recalcular com todos os trades + o novo
      const allTrades = [...trades, newTrade];
      recalculateAccountStatus(newTrade.accountId, allTrades);
    }
    
    // Retorna o ID para referência
    return newId;
  }, [trades, saveTradesToStorage, recalculateAccountStatus]);

  // Função para adicionar múltiplos trades de uma vez
  const addTrades = useCallback((newTradesData: Omit<Trade, 'id'>[]): string[] => {
    console.log(`➕ TradesContext: Adicionando ${newTradesData.length} novos trades`);
    
    // Gerar IDs únicos para os novos trades
    const newTrades: Trade[] = newTradesData.map(tradeData => ({
      ...tradeData,
      id: crypto.randomUUID(),
    }));
    
    // Atualizando o estado com os novos trades
    setTrades(prev => {
      const updatedTrades = [...prev, ...newTrades];
      console.log('💾 TradesContext: Estado atualizado com novos trades. Total:', updatedTrades.length);
      
      // Agenda o salvamento com debounce
      saveTradesToStorage(updatedTrades);
      
      return updatedTrades;
    });
    
    // Agrupar trades por conta para recalcular o status de cada conta uma única vez
    const tradesByAccount: Record<string, Trade[]> = {};
    newTrades.forEach(trade => {
      if (trade.accountId) {
        if (!tradesByAccount[trade.accountId]) {
          tradesByAccount[trade.accountId] = [];
        }
        tradesByAccount[trade.accountId].push(trade);
      }
    });
    
    // Recalcular o status de cada conta afetada
    Object.keys(tradesByAccount).forEach(accountId => {
      // Precisamos recalcular com todos os trades + os novos
      const allTrades = [...trades, ...newTrades];
      recalculateAccountStatus(accountId, allTrades);
    });
    
    // Retorna os IDs para referência
    return newTrades.map(trade => trade.id);
  }, [trades, saveTradesToStorage, recalculateAccountStatus]);

  // Função para atualizar um trade existente
  const updateTrade = useCallback((id: string, updatedData: Partial<Trade>): void => {
    console.log(`🔄 TradesContext: Atualizando trade ${id}`);
    
    setTrades(prev => {
      const tradeExists = prev.some(trade => trade.id === id);
      
      if (!tradeExists) {
        console.warn(`⚠️ TradesContext: Tentativa de atualizar trade inexistente com ID ${id}`);
        return prev;
      }
      
      // Encontrar o trade atual para obter o accountId antes da atualização
      const currentTrade = prev.find(trade => trade.id === id);
      const oldAccountId = currentTrade?.accountId;
      
      const updatedTrades = prev.map(trade => {
        if (trade.id === id) {
          const updatedTrade = {
            ...trade,
            ...updatedData,
            // Garantir que o ID não seja alterado
            id: trade.id,
          };
          
          return updatedTrade;
        }
        return trade;
      });
      
      // Agenda o salvamento com debounce
      saveTradesToStorage(updatedTrades);
      
      // Obter o trade atualizado
      const updatedTrade = updatedTrades.find(trade => trade.id === id);
      
      // Recalcular o status das contas afetadas
      if (oldAccountId) {
        recalculateAccountStatus(oldAccountId, updatedTrades);
      }
      
      // Se o trade foi movido para outra conta, recalcular também o status da nova conta
      if (updatedTrade?.accountId && updatedTrade.accountId !== oldAccountId) {
        recalculateAccountStatus(updatedTrade.accountId, updatedTrades);
      }
      
      return updatedTrades;
    });
  }, [saveTradesToStorage, recalculateAccountStatus]);

  // Função para excluir um trade
  const deleteTrade = useCallback((id: string): void => {
    console.log(`❌ TradesContext: Excluindo trade ${id}`);
    
    setTrades(prev => {
      const tradeToDelete = prev.find(trade => trade.id === id);
      
      if (!tradeToDelete) {
        console.warn(`⚠️ TradesContext: Tentativa de excluir trade inexistente com ID ${id}`);
        return prev;
      }
      
      // Armazenar o accountId para recalcular o status depois
      const accountId = tradeToDelete.accountId;
      
      const updatedTrades = prev.filter(trade => trade.id !== id);
      
      // Agenda o salvamento com debounce
      saveTradesToStorage(updatedTrades);
      
      // Recalcular o status da conta associada
      if (accountId) {
        recalculateAccountStatus(accountId, updatedTrades);
      }
      
      return updatedTrades;
    });
  }, [saveTradesToStorage, recalculateAccountStatus]);

  // Função para excluir todos os trades de uma conta
  const deleteTradesByAccount = useCallback((accountId: string): void => {
    console.log(`❌ TradesContext: Excluindo todos os trades da conta ${accountId}`);
    
    setTrades(prev => {
      const tradesForAccount = prev.filter(trade => trade.accountId === accountId);
      
      if (tradesForAccount.length === 0) {
        console.warn(`⚠️ TradesContext: Nenhum trade encontrado para a conta ${accountId}`);
        return prev;
      }
      
      const updatedTrades = prev.filter(trade => trade.accountId !== accountId);
      
      // Agenda o salvamento com debounce
      saveTradesToStorage(updatedTrades);
      
      // Recalcular o status da conta
      recalculateAccountStatus(accountId, updatedTrades);
      
      return updatedTrades;
    });
  }, [saveTradesToStorage, recalculateAccountStatus]);

  // Usando useMemo para criar o objeto de valor que só muda quando as dependências mudam
  const value = useMemo(() => ({ 
    trades, 
    getTrade,
    getTradesByAccount,
    addTrade,
    addTrades,
    updateTrade,
    deleteTrade,
    deleteTradesByAccount,
    isLoading
  }), [
    trades, 
    isLoading, 
    getTrade, 
    getTradesByAccount, 
    addTrade, 
    addTrades, 
    updateTrade, 
    deleteTrade, 
    deleteTradesByAccount
  ]);

  return (
    <TradesContext.Provider value={value}>
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradesContext);
  if (context === undefined) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
} 