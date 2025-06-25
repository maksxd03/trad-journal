/**
 * Este arquivo contém as configurações e instruções para importação de arquivos
 * de diferentes corretoras.
 */

interface BrokerConfig {
  value: string;
  label: string;
  instructions: string;
  fieldMapping: Record<string, string | string[] | ((row: any) => any)>;
  fileTypes: string[];
}

interface DateFormat {
  value: string;
  label: string;
}

/**
 * Retorna a lista de corretoras suportadas
 */
export function getSupportedBrokers() {
  return brokerConfigs.map(broker => ({
    value: broker.value,
    label: broker.label
  }));
}

/**
 * Retorna a configuração de uma corretora específica
 */
export function getBrokerConfig(brokerCode: string): BrokerConfig | null {
  return brokerConfigs.find(broker => broker.value === brokerCode) || null;
}

/**
 * Retorna os formatos de data suportados
 */
export function getDateFormats(): DateFormat[] {
  return [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (ex: 01/31/2023)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (ex: 31/01/2023)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ex: 2023-01-31)' }
  ];
}

/**
 * Configurações das corretoras suportadas
 */
const brokerConfigs: BrokerConfig[] = [
  {
    value: 'metatrader4',
    label: 'MetaTrader 4',
    instructions: `
      # Instruções para exportar histórico do MetaTrader 4
      
      1. Abra o MetaTrader 4
      2. Acesse o "Terminal" (Ctrl+T)
      3. Vá para a aba "Histórico de Conta"
      4. Clique com o botão direito e selecione "Salvar como Relatório" ou "Salvar como Detalhado"
      5. Escolha o formato CSV ou HTML
      6. Salve o arquivo e importe-o aqui
    `,
    fieldMapping: {
      ticket: ['Ticket', 'Order', '#'],
      openTime: ['Open Time', 'Time', 'OpenTime'],
      type: ['Type', 'Direction'],
      volume: ['Size', 'Volume', 'Lots'],
      symbol: ['Symbol', 'Item', 'Instrument'],
      openPrice: ['Price', 'Open Price', 'OpenPrice'],
      closeTime: ['Close Time', 'CloseTime'],
      closePrice: ['Close Price', 'ClosePrice'],
      pnl: ['Profit', 'P/L', 'Profit/Loss'],
      commission: ['Commission', 'Comm'],
      swap: ['Swap', 'Rollover'],
      comment: ['Comment']
    },
    fileTypes: ['csv', 'html']
  },
  {
    value: 'metatrader5',
    label: 'MetaTrader 5',
    instructions: `
      # Instruções para exportar histórico do MetaTrader 5
      
      1. Abra o MetaTrader 5
      2. Acesse o "Terminal" (Ctrl+T)
      3. Vá para a aba "Histórico de Conta"
      4. Clique com o botão direito e selecione "Salvar como Relatório" ou "Salvar como Detalhado"
      5. Escolha o formato CSV ou HTML
      6. Salve o arquivo e importe-o aqui
    `,
    fieldMapping: {
      ticket: ['Ticket', 'Deal', '#'],
      openTime: ['Time', 'Open Time', 'OpenTime'],
      type: ['Type', 'Direction'],
      volume: ['Volume', 'Size', 'Lots'],
      symbol: ['Symbol', 'Instrument'],
      openPrice: ['Price', 'Open Price', 'OpenPrice'],
      closeTime: ['Close Time', 'CloseTime'],
      closePrice: ['Close Price', 'ClosePrice'],
      pnl: ['Profit', 'P/L', 'Profit/Loss'],
      commission: ['Commission', 'Comm'],
      swap: ['Swap', 'Rollover'],
      comment: ['Comment']
    },
    fileTypes: ['csv', 'html']
  },
  {
    value: 'tradingview',
    label: 'TradingView',
    instructions: `
      # Instruções para exportar histórico do TradingView
      
      1. Abra o TradingView e acesse sua conta
      2. Vá para "Histórico de Negociações" (Trading History)
      3. Clique no botão "Exportar" ou "Download"
      4. Escolha o formato CSV
      5. Salve o arquivo e importe-o aqui
    `,
    fieldMapping: {
      ticket: 'ID',
      openTime: 'Open Time',
      closeTime: 'Close Time',
      symbol: 'Symbol',
      type: 'Side',
      volume: 'Amount',
      openPrice: 'Entry Price',
      closePrice: 'Exit Price',
      pnl: 'Profit/Loss',
      commission: 'Commission',
      swap: 'Swap',
      comment: 'Notes'
    },
    fileTypes: ['csv']
  },
  {
    value: 'ftmo',
    label: 'FTMO',
    instructions: `
      # Instruções para exportar histórico do FTMO
      
      1. Acesse sua conta FTMO
      2. Vá para a seção "Trading History" ou "Histórico de Trades"
      3. Clique no botão "Export" ou "Download"
      4. Escolha o formato CSV ou XLSX
      5. Salve o arquivo e importe-o aqui
    `,
    fieldMapping: {
      ticket: 'Ticket',
      openTime: 'Open Time',
      closeTime: 'Close Time',
      symbol: 'Symbol',
      type: 'Type',
      volume: 'Size',
      openPrice: 'Open Price',
      closePrice: 'Close Price',
      pnl: 'Profit',
      commission: 'Commission',
      swap: 'Swap',
      comment: 'Comment'
    },
    fileTypes: ['csv', 'xlsx']
  },
  {
    value: 'ninjatrader',
    label: 'NinjaTrader',
    instructions: `
      # Instruções para exportar histórico do NinjaTrader
      
      1. Abra o NinjaTrader
      2. Vá para "Control Center" > "Trade Performance"
      3. Selecione o período desejado
      4. Clique em "Export" e escolha CSV
      5. Salve o arquivo e importe-o aqui
    `,
    fieldMapping: {
      ticket: 'Order ID',
      openTime: 'Entry Time',
      closeTime: 'Exit Time',
      symbol: 'Instrument',
      type: 'Direction',
      volume: 'Quantity',
      openPrice: 'Entry Price',
      closePrice: 'Exit Price',
      pnl: 'Profit',
      commission: 'Commission',
      comment: 'Notes'
    },
    fileTypes: ['csv']
  },
  {
    value: 'ib',
    label: 'Interactive Brokers',
    instructions: `
      # Instruções para exportar histórico do Interactive Brokers
      
      1. Acesse o Portal do Cliente ou o TWS
      2. Vá para "Reports" > "Flex Queries"
      3. Crie uma nova consulta incluindo "Trades"
      4. Execute a consulta e baixe o arquivo CSV
      5. Importe o arquivo aqui
    `,
    fieldMapping: {
      ticket: 'Exec ID',
      openTime: 'Date/Time',
      symbol: 'Symbol',
      type: 'Buy/Sell',
      volume: 'Quantity',
      openPrice: 'Price',
      pnl: 'Realized P/L',
      commission: 'Commission'
    },
    fileTypes: ['csv', 'xlsx']
  }
]; 