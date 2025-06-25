import { PropFirmChallenge } from '../types/propFirmChallenge';
import { Account } from '../types/account';

// Converte um objeto Challenge para um formato seguro para JSON
export function dehydrateChallenge(challenge: PropFirmChallenge): any {
  return {
    ...challenge,
    startDate: challenge.startDate instanceof Date 
      ? challenge.startDate.toISOString() 
      : challenge.startDate, // Converte Date para string ISO
    status: challenge.status ? {
      ...challenge.status,
      daysTraded: challenge.status.daysTraded instanceof Set
        ? Array.from(challenge.status.daysTraded)
        : challenge.status.daysTraded // Converte Set para Array
    } : null
  };
}

// Converte um objeto lido do storage de volta para os tipos corretos
export function hydrateChallenge(challengeFromStorage: any): PropFirmChallenge {
  // Garante que temos um objeto válido
  if (!challengeFromStorage) {
    throw new Error('Dados de desafio inválidos');
  }

  // Converte a data de início
  const startDate = typeof challengeFromStorage.startDate === 'string' 
    ? new Date(challengeFromStorage.startDate) 
    : challengeFromStorage.startDate || new Date();

  // Processa o status, se existir
  const status = challengeFromStorage.status ? {
    ...challengeFromStorage.status,
    // Converte Array de volta para Set
    daysTraded: Array.isArray(challengeFromStorage.status.daysTraded)
      ? new Set(challengeFromStorage.status.daysTraded)
      : new Set()
  } : null;

  // Garante que trades é um array
  const trades = Array.isArray(challengeFromStorage.trades)
    ? challengeFromStorage.trades
    : [];

  return {
    ...challengeFromStorage,
    startDate,
    status,
    trades
  };
}

// Converte um objeto Account para um formato seguro para JSON
export function dehydrateAccount(account: Account): any {
  return {
    ...account,
    startDate: account.startDate instanceof Date 
      ? account.startDate.toISOString() 
      : account.startDate, // Converte Date para string ISO
    endDate: account.endDate instanceof Date 
      ? account.endDate.toISOString() 
      : account.endDate, // Converte Date para string ISO, se existir
    status: account.status ? {
      ...account.status,
      daysTraded: account.status.daysTraded instanceof Set
        ? Array.from(account.status.daysTraded)
        : account.status.daysTraded // Converte Set para Array
    } : null
  };
}

// Converte um objeto lido do storage de volta para os tipos corretos
export function hydrateAccount(accountFromStorage: any): Account {
  // Garante que temos um objeto válido
  if (!accountFromStorage) {
    throw new Error('Dados de conta inválidos');
  }

  // Converte a data de início
  const startDate = typeof accountFromStorage.startDate === 'string' 
    ? new Date(accountFromStorage.startDate) 
    : accountFromStorage.startDate || new Date();

  // Converte a data de fim, se existir
  const endDate = accountFromStorage.endDate 
    ? (typeof accountFromStorage.endDate === 'string' 
      ? new Date(accountFromStorage.endDate) 
      : accountFromStorage.endDate)
    : undefined;

  // Processa o status, se existir
  const status = accountFromStorage.status ? {
    ...accountFromStorage.status,
    // Converte Array de volta para Set
    daysTraded: Array.isArray(accountFromStorage.status.daysTraded)
      ? new Set(accountFromStorage.status.daysTraded)
      : new Set()
  } : null;

  // Garante que trades é um array
  const trades = Array.isArray(accountFromStorage.trades)
    ? accountFromStorage.trades
    : [];

  return {
    ...accountFromStorage,
    startDate,
    endDate,
    status,
    trades,
    // Garante que os campos obrigatórios existem
    name: accountFromStorage.name || 'Conta sem nome',
    type: accountFromStorage.type || 'personal_paper',
    importMethod: accountFromStorage.importMethod || 'manual',
    broker: accountFromStorage.broker || 'Desconhecido'
  };
}

// Função utilitária para verificar se um valor é um objeto simples
export function isPlainObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Set) && !(value instanceof Map);
} 