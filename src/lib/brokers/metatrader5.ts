import { Trade } from '../../types/trade';

/**
 * Processa um arquivo CSV exportado do MetaTrader 5
 * 
 * @param data Array de objetos representando as linhas do arquivo CSV
 * @param dateFormat Formato de data usado no arquivo
 * @returns Array de objetos Trade
 */
export function processMetaTrader5File(data: any[], dateFormat: string): Omit<Trade, 'id'>[] {
  console.log('Processando arquivo do MetaTrader 5');
  
  // Filtra apenas as linhas que representam trades fechados
  const tradeRows = data.filter(row => {
    // Verifica se a linha tem os campos mínimos necessários
    const hasTicket = row.Ticket || row.Deal || row['#'];
    const hasType = row.Type || row.Direction || row.Action;
    const hasSymbol = row.Symbol || row.Instrument;
    
    // Verifica se é um trade fechado (in/out)
    const type = (row.Type || row.Direction || row.Action || '').toLowerCase();
    const isTrade = type.includes('buy') || type.includes('sell') || 
                    type.includes('in') || type.includes('out');
    
    // No MT5, trades podem ser identificados por "in" e "out" ou "buy" e "sell"
    return hasTicket && hasType && hasSymbol && isTrade;
  });
  
  console.log(`Encontrados ${tradeRows.length} registros de trades no arquivo`);
  
  // Agrupa os trades por ticket para combinar entradas e saídas
  const tradesByTicket: Record<string, any[]> = {};
  
  tradeRows.forEach(row => {
    const ticket = row.Position || row.Ticket || row.Deal || row['#'] || '';
    if (!tradesByTicket[ticket]) {
      tradesByTicket[ticket] = [];
    }
    tradesByTicket[ticket].push(row);
  });
  
  console.log(`Agrupados em ${Object.keys(tradesByTicket).length} trades únicos`);
  
  // Processa cada grupo de trades
  const trades: Omit<Trade, 'id'>[] = [];
  
  Object.entries(tradesByTicket).forEach(([ticket, rows]) => {
    // Se tiver apenas uma linha, é um trade simples
    if (rows.length === 1) {
      const row = rows[0];
      
      trades.push({
        ticket,
        symbol: row.Symbol || row.Instrument || '',
        type: ((row.Type || row.Direction || row.Action || '').toLowerCase().includes('buy')) ? 'buy' : 'sell',
        openTime: row.Time || row['Open Time'] || row.OpenTime || '',
        closeTime: row.Time || row['Close Time'] || row.CloseTime || '',
        volume: parseFloat(row.Volume || row.Size || row.Lots || '0'),
        openPrice: parseFloat(row.Price || row['Open Price'] || row.OpenPrice || '0'),
        closePrice: parseFloat(row.Price || row['Close Price'] || row.ClosePrice || '0'),
        pnl: parseFloat(row.Profit || row['P/L'] || row['Profit/Loss'] || '0'),
        commission: parseFloat(row.Commission || row.Comm || '0'),
        swap: parseFloat(row.Swap || row.Rollover || '0'),
        comment: row.Comment || '',
        accountId: '',
        tags: [],
        setup: '',
        notes: '',
        screenshotUrl: '',
      });
    } 
    // Se tiver duas linhas, provavelmente é um par entrada/saída
    else if (rows.length === 2) {
      // Tenta identificar qual é a entrada e qual é a saída
      const typeValues = rows.map(r => (r.Type || r.Direction || r.Action || '').toLowerCase());
      
      let entryRow, exitRow;
      
      if (typeValues[0].includes('in') || typeValues[0].includes('buy')) {
        entryRow = rows[0];
        exitRow = rows[1];
      } else {
        entryRow = rows[1];
        exitRow = rows[0];
      }
      
      trades.push({
        ticket,
        symbol: entryRow.Symbol || entryRow.Instrument || '',
        type: ((entryRow.Type || entryRow.Direction || entryRow.Action || '').toLowerCase().includes('buy')) ? 'buy' : 'sell',
        openTime: entryRow.Time || entryRow['Open Time'] || entryRow.OpenTime || '',
        closeTime: exitRow.Time || exitRow['Close Time'] || exitRow.CloseTime || '',
        volume: parseFloat(entryRow.Volume || entryRow.Size || entryRow.Lots || '0'),
        openPrice: parseFloat(entryRow.Price || entryRow['Open Price'] || entryRow.OpenPrice || '0'),
        closePrice: parseFloat(exitRow.Price || exitRow['Close Price'] || exitRow.ClosePrice || '0'),
        pnl: parseFloat(exitRow.Profit || exitRow['P/L'] || exitRow['Profit/Loss'] || '0'),
        commission: parseFloat(entryRow.Commission || entryRow.Comm || '0') + parseFloat(exitRow.Commission || exitRow.Comm || '0'),
        swap: parseFloat(entryRow.Swap || entryRow.Rollover || '0') + parseFloat(exitRow.Swap || exitRow.Rollover || '0'),
        comment: `${entryRow.Comment || ''} ${exitRow.Comment || ''}`.trim(),
        accountId: '',
        tags: [],
        setup: '',
        notes: '',
        screenshotUrl: '',
      });
    }
    // Se tiver mais de duas linhas, pode ser um trade parcial ou complexo
    else {
      // Implementação simplificada para trades complexos
      // Em uma implementação real, seria necessário um algoritmo mais sofisticado
      // para lidar com trades parciais, hedging, etc.
      
      // Encontra a primeira entrada
      const entryRow = rows.find(r => {
        const type = (r.Type || r.Direction || r.Action || '').toLowerCase();
        return type.includes('in') || type.includes('buy') || type.includes('sell');
      }) || rows[0];
      
      // Calcula valores agregados
      let totalPnL = 0;
      let totalCommission = 0;
      let totalSwap = 0;
      let lastCloseTime = '';
      
      rows.forEach(row => {
        totalPnL += parseFloat(row.Profit || row['P/L'] || row['Profit/Loss'] || '0');
        totalCommission += parseFloat(row.Commission || row.Comm || '0');
        totalSwap += parseFloat(row.Swap || row.Rollover || '0');
        
        // Pega o timestamp mais recente como horário de fechamento
        const closeTime = row.Time || row['Close Time'] || row.CloseTime || '';
        if (closeTime && (!lastCloseTime || closeTime > lastCloseTime)) {
          lastCloseTime = closeTime;
        }
      });
      
      trades.push({
        ticket,
        symbol: entryRow.Symbol || entryRow.Instrument || '',
        type: ((entryRow.Type || entryRow.Direction || entryRow.Action || '').toLowerCase().includes('buy')) ? 'buy' : 'sell',
        openTime: entryRow.Time || entryRow['Open Time'] || entryRow.OpenTime || '',
        closeTime: lastCloseTime,
        volume: parseFloat(entryRow.Volume || entryRow.Size || entryRow.Lots || '0'),
        openPrice: parseFloat(entryRow.Price || entryRow['Open Price'] || entryRow.OpenPrice || '0'),
        closePrice: 0, // Não é possível determinar com precisão em trades complexos
        pnl: totalPnL,
        commission: totalCommission,
        swap: totalSwap,
        comment: `Trade complexo com ${rows.length} operações`,
        accountId: '',
        tags: [],
        setup: '',
        notes: '',
        screenshotUrl: '',
      });
    }
  });
  
  console.log(`Processados ${trades.length} trades`);
  return trades;
} 