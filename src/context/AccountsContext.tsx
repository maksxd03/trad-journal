import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useRef, useCallback } from 'react';
import { Account, AccountStatus } from '../types/account';
import { updateAccountStatus } from '../lib/ai/riskCopilot';
import { dehydrateAccount, hydrateAccount } from '../lib/serializationUtils';
import { Trade } from '../types/trade';
import { supabase } from '../lib/supabaseClient';

interface AccountsContextType {
  accounts: Account[];
  getAccount: (id: string) => Account | undefined;
  getAccountWithStatus: (id: string) => Account | undefined;
  addAccount: (newAccount: Omit<Account, 'id' | 'userId' | 'trades'>, trades?: Trade[]) => string;
  updateAccount: (id: string, updatedData: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  recalculateAccountStatus: (accountId: string, allTrades: Trade[]) => void;
  selectedAccountId: string | null;
  selectAccount: (accountId: string | null) => void;
  isLoading: boolean;
  loading: boolean;
  syncWithDatabase: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  // Variável para guardar a referência do timer do debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Conjunto para armazenar IDs de contas excluídas localmente
  const deletedAccountIdsRef = useRef<Set<string>>(new Set());

  // Função para selecionar uma conta
  const selectAccount = useCallback((accountId: string | null) => {
    setSelectedAccountId(accountId);
  }, []);

  // Função para salvar contas no localStorage com debounce
  const saveAccountsToStorage = useCallback((accountsToSave: Account[]) => {
    // Cancela qualquer salvamento anterior agendado
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Agenda um novo salvamento para daqui a 500ms
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        // DESIDRATAÇÃO: Converte os dados para um formato seguro antes de salvar
        const serializableAccounts = accountsToSave.map(dehydrateAccount);
        localStorage.setItem('accounts', JSON.stringify(serializableAccounts));
        
        // Log apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
        console.log(`💾✅ Context: Contas salvas no localStorage (com debounce)`);
        }
      } catch (error) {
        console.error("❌ Falha ao salvar contas no localStorage", error);
      }
    }, 500); // Atraso de 500ms
  }, []);

  // Função para salvar IDs de contas excluídas no localStorage
  const saveDeletedAccountIds = useCallback(() => {
    try {
      localStorage.setItem('deletedAccountIds', JSON.stringify(Array.from(deletedAccountIdsRef.current)));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`💾✅ Context: IDs de contas excluídas salvos no localStorage`);
      }
    } catch (error) {
      console.error("❌ Falha ao salvar IDs de contas excluídas no localStorage", error);
    }
  }, []);

  // Nova função para carregar contas do banco de dados
  const loadAccountsFromDatabase = useCallback(async (): Promise<Account[]> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Context: Carregando contas do banco de dados Supabase');
      }
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
        
      if (error) {
        console.error('❌ Context: Erro ao carregar contas do banco de dados:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('ℹ️ Context: Nenhuma conta encontrada no banco de dados');
        }
        return [];
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Context: ${data.length} contas carregadas do banco de dados`);
      }
      
      // Converter dados do banco de dados para o formato Account
      const accountsFromDB = data.map(item => {
        return {
          id: item.id,
          userId: item.user_id,
          name: item.name,
          type: item.type === 'challenge' ? 'prop_firm_challenge' : 
                item.type === 'real' ? 'personal_live' : 'personal_paper',
          importMethod: 'manual',
          broker: item.broker || 'Desconhecido',
          startDate: new Date(item.start_date),
          rules: item.rules || undefined,
          status: item.status || {
            currentEquity: item.rules?.accountSize || 10000,
            highWaterMark: item.rules?.accountSize || 10000,
            daysTraded: new Set<string>(),
            distanceToDailyDrawdown: 0,
            distanceToOverallDrawdown: 0,
            isDailyDrawdownViolated: false,
            isOverallDrawdownViolated: false,
            isPassed: false
          },
          trades: []
        } as Account;
      });
      
      return accountsFromDB;
    } catch (error) {
      console.error('❌ Context: Erro ao carregar contas do banco de dados:', error);
      return [];
    }
  }, []);

  // Função para sincronizar contas entre localStorage e banco de dados
  const syncWithDatabase = useCallback(async () => {
    setIsLoading(true);
    try {
      // Carregar contas do banco de dados
      const dbAccounts = await loadAccountsFromDatabase();
      
      // Filtrar contas do banco de dados para remover as que foram excluídas localmente
      const filteredDbAccounts = dbAccounts.filter(
        account => !deletedAccountIdsRef.current.has(account.id)
      );
      
      if (process.env.NODE_ENV === 'development' && filteredDbAccounts.length < dbAccounts.length) {
        console.log(`🔍 Context: Ignorando ${dbAccounts.length - filteredDbAccounts.length} contas excluídas localmente`);
      }
      
      // Carregar contas do localStorage
      const savedAccounts = localStorage.getItem('accounts');
      let localAccounts: Account[] = [];
      
      if (savedAccounts) {
        const parsedData = JSON.parse(savedAccounts);
        if (Array.isArray(parsedData)) {
          localAccounts = parsedData.map(hydrateAccount);
        }
      }
      
      // Mesclar contas do banco de dados com contas do localStorage
      // Priorizar contas do banco de dados quando houver duplicidade de IDs
      const mergedAccounts: Account[] = [];
      const addedIds = new Set<string>();
      
      // Primeiro adicionar todas as contas do banco de dados (já filtradas)
      for (const dbAccount of filteredDbAccounts) {
        mergedAccounts.push(dbAccount);
        addedIds.add(dbAccount.id);
      }
      
      // Depois adicionar contas do localStorage que não existem no banco de dados
      for (const localAccount of localAccounts) {
        if (!addedIds.has(localAccount.id)) {
          mergedAccounts.push(localAccount);
          addedIds.add(localAccount.id);
        }
      }
      
      // Atualizar estado e localStorage
      setAccounts(mergedAccounts);
      saveAccountsToStorage(mergedAccounts);
    } catch (error) {
      console.error('❌ Context: Erro ao sincronizar contas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadAccountsFromDatabase, saveAccountsToStorage, saveDeletedAccountIds]);

  // Efeito para carregar as contas UMA VEZ quando o app inicia
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // Carregar IDs de contas excluídas do localStorage
        const savedDeletedIds = localStorage.getItem('deletedAccountIds');
        if (savedDeletedIds) {
          try {
            const parsedIds = JSON.parse(savedDeletedIds);
            if (Array.isArray(parsedIds)) {
              deletedAccountIdsRef.current = new Set(parsedIds);
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Context: ${parsedIds.length} IDs de contas excluídas carregados do localStorage`);
              }
            }
          } catch (error) {
            console.error('❌ Context: Erro ao carregar IDs de contas excluídas:', error);
          }
        }
        
        // Primeiro tentar carregar do banco de dados
        const dbAccounts = await loadAccountsFromDatabase();
        
        // Filtrar contas do banco de dados para remover as que foram excluídas localmente
        const filteredDbAccounts = dbAccounts.filter(
          account => !deletedAccountIdsRef.current.has(account.id)
        );
        
        if (process.env.NODE_ENV === 'development' && filteredDbAccounts.length < dbAccounts.length) {
          console.log(`🔍 Context: Ignorando ${dbAccounts.length - filteredDbAccounts.length} contas excluídas localmente durante inicialização`);
        }
        
        if (filteredDbAccounts.length > 0) {
          // Se encontrou contas no banco de dados, usar elas
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Context: Usando contas do banco de dados');
          }
          setAccounts(filteredDbAccounts);
          saveAccountsToStorage(filteredDbAccounts); // Atualizar o localStorage também
        } else {
          // Se não encontrou no banco de dados, tentar carregar do localStorage
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Context: Carregando contas do localStorage');
          }
          const savedAccounts = localStorage.getItem('accounts');
      
      if (savedAccounts) {
        const parsedData = JSON.parse(savedAccounts);
        
        // Verificar se é um array
        if (Array.isArray(parsedData)) {
          try {
            // HIDRATAÇÃO: Converte os dados lidos para os tipos corretos
            const hydratedAccounts = parsedData.map(hydrateAccount);
                if (process.env.NODE_ENV === 'development') {
            console.log('✅ Context: Contas hidratadas com sucesso:', hydratedAccounts.length);
                }
            setAccounts(hydratedAccounts);
          } catch (hydrationError) {
            console.error('❌ Context: Erro ao hidratar contas:', hydrationError);
            setAccounts([]);
          }
        } else {
          console.error('❌ Context: Dados salvos não são um array');
          setAccounts([]);
        }
        }
      }
    } catch (error) {
        console.error('❌ Context: Erro ao inicializar contas:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
    };
    
    initialize();
  }, [loadAccountsFromDatabase, saveAccountsToStorage]);

  // Memoize a função getAccount para que sua referência seja estável
  const getAccount = useCallback((id: string): Account | undefined => {
    if (!id) return undefined;
    
    const account = accounts.find(a => a.id === id);
    if (!account && process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Context: Conta com ID ${id} não encontrada`);
      return undefined;
    }
    
    return account;
  }, [accounts]);

  // Memoize a função getAccountWithStatus para que sua referência seja estável
  const getAccountWithStatus = useCallback((id: string): Account | undefined => {
    const account = getAccount(id);
    if (!account) return undefined;
    
    try {
      if (process.env.NODE_ENV === 'development') {
      console.log('🧮 Context: Calculando status para conta', id);
      }
      
      // Clone para evitar mutações
      const accountToProcess = structuredClone(account);
      
      // Já não precisamos converter manualmente, pois a hidratação garante o tipo correto
      // Mas mantemos a verificação por segurança
      if (accountToProcess.status?.daysTraded && !(accountToProcess.status.daysTraded instanceof Set)) {
        console.warn('⚠️ Context: daysTraded não é um Set, convertendo...');
        accountToProcess.status.daysTraded = new Set(
          Array.isArray(accountToProcess.status.daysTraded) 
            ? accountToProcess.status.daysTraded 
            : []
        );
      }
      
      // Calcular status atualizado
      const updatedStatus = updateAccountStatus(accountToProcess);
      
      // Atualizar o status no estado central
      if (JSON.stringify(Array.from(updatedStatus.daysTraded || [])) !== 
          JSON.stringify(Array.from(account.status?.daysTraded || [])) ||
          updatedStatus.currentEquity !== account.status?.currentEquity) {
        
        if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Context: Atualizando status no estado central');
        }
        
        setAccounts(prev => {
          const updatedAccounts = prev.map(a => {
            if (a.id === id) {
              return {
                ...a,
                status: updatedStatus
              };
            }
            return a;
          });
          
          // Agenda o salvamento com debounce após atualização de status
          saveAccountsToStorage(updatedAccounts);
          
          return updatedAccounts;
        });
      }
      
      // Retornar cópia com status atualizado
      return {
        ...accountToProcess,
        status: updatedStatus
      };
    } catch (error) {
      console.error('❌ Context: Erro no cálculo de status:', error);
      return account;
    }
  }, [accounts, getAccount, saveAccountsToStorage]);

  // Memoize a função addAccount para que sua referência seja estável
  const addAccount = useCallback((newAccountData: Omit<Account, 'id' | 'userId' | 'trades'>, trades: Trade[] = []): string => {
    if (process.env.NODE_ENV === 'development') {
    console.log(`➕ Context: Adicionando nova conta ${newAccountData.name} com ${trades.length} trades`);
    }
    
    // Definir valores padrão para propriedades obrigatórias
    let initialEquity = 0;
    let maxDailyDrawdown = 0;
    let maxOverallDrawdown = 0;
    
    if (newAccountData.type === 'prop_firm_challenge' && newAccountData.rules) {
      initialEquity = newAccountData.rules.accountSize;
      maxDailyDrawdown = newAccountData.rules.maxDailyDrawdown || 5;
      maxOverallDrawdown = newAccountData.rules.maxOverallDrawdown || 10;
    } else {
      // Para contas pessoais, definir valores padrão
      initialEquity = 10000; // Valor arbitrário para contas pessoais
    }
    
    // Gerar um ID único para a nova conta
    const newId = crypto.randomUUID();
    
    // Preparar os trades com o ID da conta
    const processedTrades = trades.map(trade => ({
      ...trade,
      accountId: newId
    }));
    
    const newAccount: Account = {
      ...newAccountData,
      id: newId,
      userId: 'user123', // Simulação
      trades: processedTrades,
      status: { // Define um status inicial padrão
        currentEquity: initialEquity,
        highWaterMark: initialEquity,
        daysTraded: new Set<string>(),
        distanceToDailyDrawdown: newAccountData.type === 'prop_firm_challenge' ? initialEquity * (maxDailyDrawdown / 100) : 0,
        distanceToOverallDrawdown: newAccountData.type === 'prop_firm_challenge' ? initialEquity * (maxOverallDrawdown / 100) : 0,
        isDailyDrawdownViolated: false,
        isOverallDrawdownViolated: false,
        isPassed: false,
      },
    };
    
    // Se houver trades, calcular o status inicial com base neles
    if (processedTrades.length > 0) {
      try {
        newAccount.status = updateAccountStatus({
          ...newAccount,
          trades: processedTrades
        });
        if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Context: Status inicial calculado com base em ${processedTrades.length} trades`);
        }
      } catch (error) {
        console.error('❌ Context: Erro ao calcular status inicial:', error);
      }
    }
    
    // Atualizando o estado com a nova conta
    setAccounts(prev => {
      const updatedAccounts = [...prev, newAccount];
      if (process.env.NODE_ENV === 'development') {
      console.log('💾 Context: Estado atualizado com nova conta. Total:', updatedAccounts.length);
      }
      
      // Agenda o salvamento com debounce
      saveAccountsToStorage(updatedAccounts);
      
      return updatedAccounts;
    });
    
    // Retorna o ID para que a página possa redirecionar
    return newId;
  }, [saveAccountsToStorage]);

  // Memoize a função updateAccount para que sua referência seja estável
  const updateAccount = useCallback((id: string, updatedData: Partial<Account>): void => {
    if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Context: Atualizando conta ${id}`, updatedData);
    }
    
    setAccounts(prev => {
      const accountExists = prev.some(account => account.id === id);
      
      if (!accountExists && process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Context: Tentativa de atualizar conta inexistente com ID ${id}`);
        return prev;
      }
      
      const updatedAccounts = prev.map(account => {
        if (account.id === id) {
          const updatedAccount = {
            ...account,
            ...updatedData,
            // Garantir que propriedades que não devem ser sobrescritas sejam preservadas
            id: account.id, // ID nunca deve mudar
            userId: account.userId, // userID nunca deve mudar
            trades: account.trades, // trades não devem ser atualizados por este método
          };
          
          return updatedAccount;
        }
        return account;
      });
      
      // Agenda o salvamento com debounce
      saveAccountsToStorage(updatedAccounts);
      
      return updatedAccounts;
    });
  }, [saveAccountsToStorage]);

  // Memoize a função deleteAccount para que sua referência seja estável
  const deleteAccount = useCallback(async (id: string): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
    console.log(`❌ Context: Excluindo conta ${id}`);
    }
    
    try {
      // Primeiro excluir do banco de dados Supabase
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Context: Erro ao excluir conta do banco de dados:', error);
        // Continua com a exclusão local mesmo se houver erro no banco de dados
      } else if (process.env.NODE_ENV === 'development') {
        console.log('✅ Context: Conta excluída do banco de dados com sucesso');
      }
      
      // Adicionar o ID ao conjunto de contas excluídas
      deletedAccountIdsRef.current.add(id);
      // Salvar IDs excluídos no localStorage
      saveDeletedAccountIds();
      
      // Em seguida, excluir do estado local
    setAccounts(prev => {
      const accountExists = prev.some(account => account.id === id);
      
        if (!accountExists && process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Context: Tentativa de excluir conta inexistente com ID ${id}`);
        return prev;
      }
      
      const updatedAccounts = prev.filter(account => account.id !== id);
      
      // Agenda o salvamento com debounce
      saveAccountsToStorage(updatedAccounts);
      
      return updatedAccounts;
    });
    } catch (error) {
      console.error('❌ Context: Erro ao excluir conta:', error);
      throw error; // Propagar o erro para que o componente que chamou possa tratá-lo
    }
  }, [saveAccountsToStorage, saveDeletedAccountIds]);

  // Nova função para recalcular o status de uma conta com base em um conjunto de trades
  const recalculateAccountStatus = useCallback((accountId: string, allTrades: Trade[]) => {
    // Encontra a conta que precisa ser atualizada
    const accountToUpdate = accounts.find(a => a.id === accountId);
    if (!accountToUpdate) {
      if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Context: Conta com ID ${accountId} não encontrada para recálculo`);
      }
      return;
    }

    // Filtra os trades associados a esta conta
    const associatedTrades = allTrades.filter(trade => trade.challengeId === accountId);
    if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Context: Recalculando status para conta ${accountId} com ${associatedTrades.length} trades associados`);
    }

    try {
      // Clone a conta para evitar mutações diretas
      const accountToProcess = structuredClone(accountToUpdate);
      
      // Atualiza os trades da conta com os trades associados
      accountToProcess.trades = associatedTrades;
      
      // Chama a função que sabe fazer todos os cálculos
      const updatedStatus = updateAccountStatus(accountToProcess);
      
      // Atualiza o estado global das contas
      setAccounts(prev => {
        const updatedAccounts = prev.map(a => {
          if (a.id === accountId) {
            return {
              ...a,
              trades: associatedTrades, // Atualiza também os trades
              status: updatedStatus
            };
          }
          return a;
        });
        
        // Salva com debounce
        saveAccountsToStorage(updatedAccounts);
        
        return updatedAccounts;
      });
      
      if (process.env.NODE_ENV === 'development') {
      console.log('✅ Context: Status da conta recalculado com sucesso');
      }
    } catch (error) {
      console.error('❌ Context: Erro ao recalcular status da conta:', error);
    }
  }, [accounts, saveAccountsToStorage]);

  // Usando useMemo para criar o objeto de valor que só muda quando as dependências mudam
  const value = useMemo(() => ({ 
    accounts, 
    getAccount, 
    getAccountWithStatus, 
    addAccount,
    updateAccount,
    deleteAccount,
    recalculateAccountStatus,
    selectedAccountId,
    selectAccount,
    isLoading,
    loading: isLoading, // Para compatibilidade com código existente
    syncWithDatabase // Nova função exposta pelo contexto
  }), [
    accounts, 
    isLoading, 
    getAccount, 
    getAccountWithStatus, 
    addAccount, 
    updateAccount, 
    deleteAccount, 
    recalculateAccountStatus, 
    selectedAccountId, 
    selectAccount,
    syncWithDatabase // Adicionar à lista de dependências
  ]);

  return (
    <AccountsContext.Provider value={value}>
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
} 