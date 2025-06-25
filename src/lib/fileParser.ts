import { Trade } from "../types/trade";
import { getBrokerConfig } from './importInstructions';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { processMetaTrader4File } from './brokers/metatrader4';
import { processMetaTrader5File } from './brokers/metatrader5';

/**
 * Processa um arquivo de histórico de trades e retorna um array de objetos Trade
 * 
 * @param file O arquivo a ser processado
 * @param broker O código da corretora
 * @param dateFormat O formato de data usado no arquivo
 * @returns Promise que resolve para um array de objetos Trade
 */
export async function parseTradeFile(
  file: File,
  broker: string,
  dateFormat: string
): Promise<Trade[]> {
  console.log(`Iniciando processamento do arquivo ${file.name} da corretora ${broker}`);
  
  // Obtém a configuração da corretora
  const brokerConfig = getBrokerConfig(broker);
  if (!brokerConfig) {
    throw new Error(`Corretora não suportada: ${broker}`);
  }
  
  // Determina o tipo de arquivo
  const fileType = getFileType(file);
  
  // Lê o conteúdo do arquivo
  const fileContent = await readFile(file, fileType);
  
  // Processa o conteúdo de acordo com o tipo de arquivo e corretora
  const parsedTrades = processTrades(fileContent, broker, dateFormat, fileType);
  
  console.log(`Processamento concluído. ${parsedTrades.length} trades encontrados.`);
  return parsedTrades;
}

/**
 * Determina o tipo de arquivo com base na extensão
 */
function getFileType(file: File): 'csv' | 'excel' | 'html' {
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.csv')) {
    return 'csv';
  } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    return 'excel';
  } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return 'html';
  }
  throw new Error(`Formato de arquivo não suportado: ${file.name}`);
}

/**
 * Lê o conteúdo do arquivo de acordo com seu tipo
 */
async function readFile(file: File, fileType: 'csv' | 'excel' | 'html'): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          reject(new Error('Falha ao ler o arquivo'));
          return;
        }
        
        switch (fileType) {
          case 'csv':
            // Para CSV, usamos o Papaparse
            Papa.parse(e.target.result as string, {
              header: true,
              complete: (results) => {
                resolve(results.data);
              },
              error: (error) => {
                reject(new Error(`Erro ao processar CSV: ${error}`));
              }
            });
            break;
            
          case 'excel':
            // Para Excel, usamos a biblioteca XLSX
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            resolve(json);
            break;
            
          case 'html':
            // Para HTML, extraímos as tabelas
            const htmlContent = e.target.result as string;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const tables = doc.querySelectorAll('table');
            
            if (tables.length === 0) {
              reject(new Error('Nenhuma tabela encontrada no arquivo HTML'));
              return;
            }
            
            // Assumimos que a primeira tabela contém os dados dos trades
            const table = tables[0];
            const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim() || '');
            const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Ignora a linha de cabeçalho
            
            const result = rows.map(row => {
              const cells = Array.from(row.querySelectorAll('td'));
              const rowData: Record<string, string> = {};
              
              headers.forEach((header, index) => {
                if (cells[index]) {
                  rowData[header] = cells[index].textContent?.trim() || '';
                }
              });
              
              return rowData;
            });
            
            resolve(result);
            break;
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    if (fileType === 'excel') {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  });
}

/**
 * Processa os trades de acordo com a corretora
 */
function processTrades(
  data: any[],
  broker: string,
  dateFormat: string,
  fileType: 'csv' | 'excel' | 'html'
): Trade[] {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Nenhum dado encontrado no arquivo');
  }
  
  console.log(`Processando ${data.length} linhas de dados para a corretora ${broker}`);
  
  try {
    // Escolhe o processador adequado com base na corretora
    let processedTrades: Omit<Trade, 'id'>[];
    
    switch (broker.toLowerCase()) {
      case 'metatrader4':
        processedTrades = processMetaTrader4File(data, dateFormat);
        break;
        
      case 'metatrader5':
        processedTrades = processMetaTrader5File(data, dateFormat);
        break;
        
      default:
        // Para corretoras sem processador específico, usa o processamento genérico
        processedTrades = processGenericFile(data, broker, dateFormat);
        break;
    }
    
    // Adiciona IDs aos trades processados
    return processedTrades.map(trade => ({
      ...trade,
      id: crypto.randomUUID()
    }));
  } catch (error) {
    console.error('Erro ao processar trades:', error);
    throw new Error(`Falha ao processar o arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Processamento genérico para corretoras sem processador específico
 */
function processGenericFile(
  data: any[],
  broker: string,
  dateFormat: string
): Omit<Trade, 'id'>[] {
  console.log(`Usando processamento genérico para a corretora ${broker}`);
  
  // Obtém a configuração da corretora
  const brokerConfig = getBrokerConfig(broker);
  if (!brokerConfig) {
    throw new Error(`Corretora não suportada: ${broker}`);
  }
  
  // Mapeia os dados para o formato Trade usando o mapeamento de campos da corretora
  return data.map((row, index) => {
    try {
      // Extrai os campos necessários de acordo com a configuração da corretora
      const mappedTrade = mapTradeFields(row, brokerConfig.fieldMapping);
      
      // Converte os tipos de dados
      return convertTradeTypes(mappedTrade, dateFormat);
    } catch (error) {
      console.error(`Erro ao processar linha ${index + 1}:`, error);
      throw new Error(`Erro ao processar linha ${index + 1}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }).filter(Boolean) as Omit<Trade, 'id'>[];
}

/**
 * Mapeia os campos do arquivo para os campos do objeto Trade
 */
function mapTradeFields(row: Record<string, any>, fieldMapping: Record<string, string | string[] | ((row: any) => any)>): Partial<Trade> {
  const mappedTrade: Partial<Trade> = {};
  
  // Para cada campo no mapeamento, tenta extrair o valor correspondente do row
  Object.entries(fieldMapping).forEach(([tradeField, sourceField]) => {
    // Se o sourceField for uma função, chama a função para obter o valor
    if (typeof sourceField === 'function') {
      mappedTrade[tradeField as keyof Trade] = sourceField(row);
      return;
    }
    
    // Se o sourceField for um array, tenta cada campo até encontrar um valor
    if (Array.isArray(sourceField)) {
      for (const field of sourceField) {
        if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
          mappedTrade[tradeField as keyof Trade] = row[field];
          return;
        }
      }
      return;
    }
    
    // Caso contrário, assume que sourceField é uma string
    if (row[sourceField] !== undefined) {
      mappedTrade[tradeField as keyof Trade] = row[sourceField];
    }
  });
  
  return mappedTrade;
}

/**
 * Converte os tipos de dados para os tipos corretos
 */
function convertTradeTypes(trade: Partial<Trade>, dateFormat: string): Omit<Trade, 'id'> {
  // Converte as datas
  let openTime = null;
  let closeTime = null;
  
  if (trade.openTime) {
    openTime = parseDate(trade.openTime.toString(), dateFormat);
  }
  
  if (trade.closeTime) {
    closeTime = parseDate(trade.closeTime.toString(), dateFormat);
  }
  
  // Converte valores numéricos
  const volume = parseFloat(trade.volume?.toString() || '0');
  const openPrice = parseFloat(trade.openPrice?.toString() || '0');
  const closePrice = parseFloat(trade.closePrice?.toString() || '0');
  const pnl = parseFloat(trade.pnl?.toString() || '0');
  const commission = parseFloat(trade.commission?.toString() || '0');
  const swap = parseFloat(trade.swap?.toString() || '0');
  
  // Retorna o objeto Trade completo
  return {
    ticket: trade.ticket?.toString() || '',
    symbol: trade.symbol?.toString() || '',
    type: (trade.type?.toString().toLowerCase() === 'buy' || trade.type?.toString().toLowerCase() === 'long') ? 'buy' : 'sell',
    openTime: openTime ? openTime.toISOString() : new Date().toISOString(),
    closeTime: closeTime ? closeTime.toISOString() : new Date().toISOString(),
    volume,
    openPrice,
    closePrice,
    pnl,
    commission,
    swap: swap || 0,
    comment: trade.comment?.toString() || '',
    accountId: '',  // Será preenchido ao salvar o trade
    tags: [],
    setup: '',
    notes: '',
    screenshotUrl: '',
  };
}

/**
 * Converte uma string de data para um objeto Date
 */
function parseDate(dateString: string, format: string): Date {
  // Implementação simplificada - em uma aplicação real, usaríamos uma biblioteca como date-fns
  // para lidar com diferentes formatos de data
  try {
    // Tenta converter diretamente
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Se falhar, tenta interpretar o formato
    // Esta é uma implementação básica que deve ser expandida para lidar com mais formatos
    let day, month, year, hours, minutes, seconds;
    
    switch (format) {
      case 'DD/MM/YYYY':
        [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
        
      case 'MM/DD/YYYY':
        [month, day, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
        
      case 'YYYY-MM-DD':
        [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
        
      default:
        // Tenta mais algumas conversões comuns
        // Formato ISO
        if (dateString.includes('T')) {
          return new Date(dateString);
        }
        
        // Formato com barras
        if (dateString.includes('/')) {
          const parts = dateString.split(' ');
          const dateParts = parts[0].split('/');
          
          if (dateParts.length === 3) {
            // Assume MM/DD/YYYY por padrão
            [month, day, year] = dateParts.map(Number);
            
            // Se o ano tem 2 dígitos, ajusta para o século atual
            if (year < 100) {
              year += 2000;
            }
            
            // Se tem informação de hora
            if (parts.length > 1 && parts[1].includes(':')) {
              const timeParts = parts[1].split(':');
              hours = parseInt(timeParts[0], 10);
              minutes = parseInt(timeParts[1], 10);
              seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
              
              return new Date(year, month - 1, day, hours, minutes, seconds);
            }
            
            return new Date(year, month - 1, day);
          }
        }
        
        // Se tudo falhar, retorna a data atual
        console.warn(`Formato de data não reconhecido: ${dateString}`);
        return new Date();
    }
  } catch (error) {
    console.error(`Erro ao converter data ${dateString}:`, error);
    return new Date();
  }
} 