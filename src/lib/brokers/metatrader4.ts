import { Trade } from '../../types/trade';

/**
 * Processa um arquivo CSV exportado do MetaTrader 4
 * 
 * @param data Array de objetos representando as linhas do arquivo CSV
 * @param dateFormat Formato de data usado no arquivo
 * @returns Array de objetos Trade
 */
export function processMetaTrader4File(data: any[], dateFormat: string): Omit<Trade, 'id'>[] {
  console.log('Processando arquivo do MetaTrader 4');
  
  // Filtra apenas as linhas que representam trades (podem haver linhas de depósito, saque, etc)
  const tradeRows = data.filter(row => {
    // Verifica se a linha tem os campos mínimos necessários
    const hasTicket = row.Ticket || row.Order || row['#'];
    const hasType = row.Type || row.Direction;
    const hasSymbol = row.Symbol || row.Item || row.Instrument;
    
    // Verifica se é um trade (buy/sell)
    const type = (row.Type || row.Direction || '').toLowerCase();
    const isTrade = type.includes('buy') || type.includes('sell');
    
    return hasTicket && hasType && hasSymbol && isTrade;
  });
  
  console.log(`Encontrados ${tradeRows.length} trades no arquivo`);
  
  // Mapeia as linhas para o formato Trade
  return tradeRows.map(row => {
    // Extrai os valores dos campos
    const ticket = row.Ticket || row.Order || row['#'] || '';
    const openTime = row['Open Time'] || row.Time || row.OpenTime || '';
    const closeTime = row['Close Time'] || row.CloseTime || '';
    const symbol = row.Symbol || row.Item || row.Instrument || '';
    const type = ((row.Type || row.Direction || '').toLowerCase().includes('buy')) ? 'buy' : 'sell';
    const volume = parseFloat(row.Volume || row.Size || row.Lots || '0');
    const openPrice = parseFloat(row['Open Price'] || row.Price || row.OpenPrice || '0');
    const closePrice = parseFloat(row['Close Price'] || row.ClosePrice || '0');
    const pnl = parseFloat(row.Profit || row['P/L'] || row['Profit/Loss'] || '0');
    const commission = parseFloat(row.Commission || row.Comm || '0');
    const swap = parseFloat(row.Swap || row.Rollover || '0');
    const comment = row.Comment || '';
    
    // Cria o objeto Trade
    return {
      ticket,
      symbol,
      type,
      openTime,
      closeTime,
      volume,
      openPrice,
      closePrice,
      pnl,
      commission,
      swap,
      comment,
      accountId: '',  // Será preenchido ao salvar o trade
      tags: [],
      setup: '',
      notes: '',
      screenshotUrl: '',
    };
  });
} 