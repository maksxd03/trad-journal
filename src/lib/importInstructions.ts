interface ImportInstructions {
  title: string;
  steps: string[];
  notes?: string[];
  supportedFormats: string[];
  sampleImage?: string;
}

type BrokerInstructions = {
  [key: string]: ImportInstructions;
};

const brokerInstructions: BrokerInstructions = {
  "apex": {
    title: "Como exportar seus trades do Apex Trader Funding",
    steps: [
      "Faça login na sua conta Apex Trader Funding",
      "No painel principal, clique em 'Reports' no menu superior",
      "Selecione 'Trade History'",
      "Defina o intervalo de datas que você deseja exportar",
      "Clique no botão 'Export to CSV' no canto superior direito",
      "Salve o arquivo no seu computador"
    ],
    notes: [
      "Certifique-se de que todos os trades estejam incluídos no período selecionado",
      "O arquivo CSV do Apex inclui todas as informações necessárias, incluindo P&L, horários e tamanhos de posição"
    ],
    supportedFormats: ["CSV"],
    sampleImage: "/images/import-samples/apex-sample.png"
  },
  "ftmo": {
    title: "Como exportar seus trades da FTMO",
    steps: [
      "Acesse sua conta FTMO e faça login",
      "No painel de controle, vá para 'Trading Performance'",
      "Clique na aba 'History'",
      "Defina o período de tempo desejado usando os filtros de data",
      "Clique no botão 'Export' no canto inferior direito",
      "Escolha o formato 'CSV' na caixa de diálogo",
      "Salve o arquivo no seu computador"
    ],
    notes: [
      "A FTMO permite exportar dados em CSV e Excel, recomendamos CSV para melhor compatibilidade",
      "Verifique se o relatório inclui todas as informações de trades, incluindo símbolos e timestamps"
    ],
    supportedFormats: ["CSV", "XLS"],
    sampleImage: "/images/import-samples/ftmo-sample.png"
  },
  "topstep": {
    title: "Como exportar seus trades do Topstep",
    steps: [
      "Faça login na sua conta Topstep",
      "Navegue até 'Performance' no menu principal",
      "Selecione 'Trade History'",
      "Ajuste os filtros para o período desejado",
      "Clique no botão 'Download CSV' no canto superior direito",
      "Escolha o local para salvar o arquivo no seu computador"
    ],
    notes: [
      "O Topstep fornece dados detalhados incluindo métricas de performance",
      "Se você tiver múltiplas contas, certifique-se de escolher a conta correta antes de exportar"
    ],
    supportedFormats: ["CSV"],
    sampleImage: "/images/import-samples/topstep-sample.png"
  },
  "tradovate": {
    title: "Como exportar seus trades do Tradovate",
    steps: [
      "Acesse sua conta Tradovate",
      "No menu lateral, clique em 'Reports'",
      "Selecione 'Trading Activity'",
      "Escolha o intervalo de datas para exportação",
      "Clique no botão 'Export' no canto inferior",
      "Selecione formato CSV na caixa de diálogo",
      "Salve o arquivo no local desejado"
    ],
    notes: [
      "O Tradovate permite exportação de vários tipos de relatórios, certifique-se de escolher 'Trading Activity' para dados completos",
      "Os arquivos exportados contêm todas as informações necessárias para análise detalhada"
    ],
    supportedFormats: ["CSV", "XLS"],
    sampleImage: "/images/import-samples/tradovate-sample.png"
  },
  "ninjatrader": {
    title: "Como exportar seus trades do NinjaTrader",
    steps: [
      "Abra o NinjaTrader em seu computador",
      "Vá para o menu 'Control Center'",
      "Clique em 'Account Performance'",
      "Selecione a conta e o período de tempo",
      "Clique em 'Export' e escolha 'Excel' ou 'CSV'",
      "Especifique o local para salvar o arquivo"
    ],
    notes: [
      "O NinjaTrader oferece vários relatórios detalhados, escolha 'Trade List' para ter dados completos de cada operação",
      "Para importação mais precisa, recomendamos usar o formato CSV"
    ],
    supportedFormats: ["CSV", "XLS"],
    sampleImage: "/images/import-samples/ninjatrader-sample.png"
  },
  "mt4": {
    title: "Como exportar seus trades do MetaTrader 4",
    steps: [
      "Abra sua plataforma MetaTrader 4",
      "Clique na guia 'Account History' no Terminal (Ctrl+T)",
      "Clique com o botão direito na lista de operações",
      "Selecione 'Save as Report' ou 'Save as Detailed Report'",
      "Escolha o formato 'HTML' na caixa de diálogo",
      "Depois, abra o arquivo HTML em um navegador e salve como CSV ou copie para Excel"
    ],
    notes: [
      "O MT4 não exporta diretamente para CSV, mas você pode facilmente converter o relatório HTML para CSV",
      "Certifique-se de que o relatório detalhado inclui todas as informações necessárias (entrada, saída, P&L, etc.)"
    ],
    supportedFormats: ["HTML → CSV"],
    sampleImage: "/images/import-samples/mt4-sample.png"
  },
  "mt5": {
    title: "Como exportar seus trades do MetaTrader 5",
    steps: [
      "Abra sua plataforma MetaTrader 5",
      "Acesse o Terminal (Ctrl+T) e clique na aba 'History'",
      "Clique com o botão direito na lista de operações",
      "Selecione 'Save as Report'",
      "Escolha o formato 'CSV' na caixa de diálogo",
      "Selecione o local para salvar o arquivo"
    ],
    notes: [
      "O MT5 permite exportação direta para CSV, facilitando a importação",
      "Verifique se o relatório contém todas as colunas necessárias antes de importar"
    ],
    supportedFormats: ["CSV"],
    sampleImage: "/images/import-samples/mt5-sample.png"
  },
  "ctrader": {
    title: "Como exportar seus trades do cTrader",
    steps: [
      "Abra a plataforma cTrader",
      "Clique na aba 'History' no painel inferior",
      "Defina o intervalo de datas desejado",
      "Clique no ícone de 'Export' (parece um disco ou seta para baixo)",
      "Selecione 'CSV' como formato de exportação",
      "Escolha onde salvar o arquivo no seu computador"
    ],
    notes: [
      "O cTrader exporta dados completos incluindo todos os detalhes de execução",
      "Para melhor compatibilidade, escolha o formato CSV"
    ],
    supportedFormats: ["CSV"],
    sampleImage: "/images/import-samples/ctrader-sample.png"
  },
  "generic": {
    title: "Formato genérico para importação de trades",
    steps: [
      "Prepare um arquivo CSV com as seguintes colunas: Data, Hora, Símbolo, Direção (Compra/Venda), Quantidade, Preço de Entrada, Preço de Saída, P&L",
      "Certifique-se de que as datas estão no formato selecionado no formulário",
      "Salve o arquivo como CSV (valores separados por vírgula)",
      "Selecione este arquivo para importação"
    ],
    notes: [
      "Se sua corretora não está listada, você pode formatar manualmente seu arquivo de acordo com este padrão",
      "Exemplo de linha: 12/01/2023,10:30:45,ES,Compra,1,4500.50,4510.25,9.75"
    ],
    supportedFormats: ["CSV", "XLS", "XLSX"],
    sampleImage: "/images/import-samples/generic-sample.png"
  }
};

export const getImportInstructions = (brokerKey: string): ImportInstructions => {
  // Tenta obter as instruções para a corretora específica
  const instructions = brokerInstructions[brokerKey.toLowerCase()];
  
  // Se não encontrar, retorna as instruções genéricas
  if (!instructions) {
    return brokerInstructions.generic;
  }
  
  return instructions;
};

export const getSupportedBrokers = (): { value: string; label: string }[] => {
  return [
    { value: "apex", label: "Apex Trader Funding" },
    { value: "ftmo", label: "FTMO" },
    { value: "topstep", label: "Topstep" },
    { value: "tradovate", label: "Tradovate" },
    { value: "ninjatrader", label: "NinjaTrader" },
    { value: "mt4", label: "MetaTrader 4" },
    { value: "mt5", label: "MetaTrader 5" },
    { value: "ctrader", label: "cTrader" },
    { value: "generic", label: "Outro / Genérico" }
  ];
};

export const getDateFormats = (): { value: string; label: string }[] => {
  return [
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (Ex: 01/31/2023)" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (Ex: 31/01/2023)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (Ex: 2023-01-31)" },
    { value: "MM-DD-YYYY", label: "MM-DD-YYYY (Ex: 01-31-2023)" },
    { value: "DD-MM-YYYY", label: "DD-MM-YYYY (Ex: 31-01-2023)" }
  ];
}; 