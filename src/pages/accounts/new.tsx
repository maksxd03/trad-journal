import React, { useState, useEffect } from 'react';
import { Grid, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImportAccountForm from '../../components/accounts/ImportAccountForm';
import ImportInstructions from '../../components/accounts/ImportInstructions';
import { useAccounts } from '../../context/AccountsContext';
import { 
  ArrowLeft, 
  Upload, 
  HelpCircle,
  FileText,
  Check
} from 'lucide-react';

// Tipos de conta disponíveis
const accountTypes = [
  { value: 'prop_firm_challenge', label: 'Desafio de Prop Firm' },
  { value: 'personal_live', label: 'Conta Pessoal Real' },
  { value: 'personal_paper', label: 'Conta Pessoal Demo' }
];

// Métodos de importação disponíveis
const importMethods = [
  { value: 'file_upload', label: 'Importação por Arquivo' },
  { value: 'manual', label: 'Entrada Manual' },
  // { value: 'auto_sync', label: 'Sincronização Automática' }, // Será implementado no futuro
];

// Lista de corretoras/plataformas suportadas
const brokerPlatforms = [
  { value: 'apex', label: 'Apex Trader Funding' },
  { value: 'ftmo', label: 'FTMO' },
  { value: 'topstep', label: 'Topstep' },
  { value: 'leeloo', label: 'Leeloo Trading' },
  { value: 'tradovate', label: 'Tradovate' },
  { value: 'ninjatrader', label: 'NinjaTrader' },
  { value: 'metatrader4', label: 'MetaTrader 4' },
  { value: 'metatrader5', label: 'MetaTrader 5' },
  { value: 'tradestation', label: 'TradeStation' },
  { value: 'thinkorswim', label: 'ThinkOrSwim' },
  { value: 'other', label: 'Outro' }
];

// Instruções de exportação por corretora
const exportInstructions: Record<string, React.ReactNode> = {
  apex: (
    <div>
      <h4 className="font-medium mb-2">Instruções para Apex Trader Funding</h4>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Faça login na sua conta Apex Trader Funding</li>
        <li>Vá para "Trade Performance" no menu lateral</li>
        <li>Clique em "Export" no canto superior direito</li>
        <li>Selecione o formato CSV</li>
        <li>Clique em "Download" e salve o arquivo</li>
      </ol>
    </div>
  ),
  ftmo: (
    <div>
      <h4 className="font-medium mb-2">Instruções para FTMO</h4>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Faça login no seu painel FTMO</li>
        <li>Acesse "Trading Performance"</li>
        <li>Clique no botão "Export" ou "Download"</li>
        <li>Selecione o formato CSV</li>
        <li>Salve o arquivo no seu computador</li>
      </ol>
    </div>
  ),
  metatrader4: (
    <div>
      <h4 className="font-medium mb-2">Instruções para MetaTrader 4</h4>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Abra o MetaTrader 4</li>
        <li>Vá para "Histórico de Conta" na guia "Terminal" (Ctrl+T)</li>
        <li>Clique com o botão direito e selecione "Salvar como Relatório"</li>
        <li>Escolha o formato HTML ou CSV</li>
        <li>Salve o arquivo no seu computador</li>
      </ol>
    </div>
  ),
  metatrader5: (
    <div>
      <h4 className="font-medium mb-2">Instruções para MetaTrader 5</h4>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Abra o MetaTrader 5</li>
        <li>Vá para "Histórico de Conta" na guia "Terminal" (Ctrl+T)</li>
        <li>Clique com o botão direito e selecione "Salvar como Relatório Detalhado"</li>
        <li>Escolha o formato HTML ou CSV</li>
        <li>Salve o arquivo no seu computador</li>
      </ol>
    </div>
  ),
  default: (
    <div>
      <h4 className="font-medium mb-2">Instruções Gerais</h4>
      <p className="mb-2">Para importar seus trades, você precisará de um arquivo CSV ou Excel com as seguintes colunas:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Data e hora do trade</li>
        <li>Símbolo/Instrumento</li>
        <li>Tipo (compra/venda)</li>
        <li>Preço de entrada</li>
        <li>Preço de saída</li>
        <li>Tamanho da posição</li>
        <li>Lucro/Prejuízo</li>
      </ul>
      <p className="mt-2">Exporte esse arquivo da sua plataforma de trading e faça o upload aqui.</p>
    </div>
  )
};

const NewAccountPage: React.FC = () => {
  const [selectedBroker, setSelectedBroker] = useState<string>('');
  const navigate = useNavigate();
  const { addAccount } = useAccounts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  
  // Estados do formulário
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('prop_firm_challenge');
  const [importMethod, setImportMethod] = useState('file_upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estados para regras de prop firm (apenas para desafios)
  const [accountSize, setAccountSize] = useState(100000);
  const [profitTarget, setProfitTarget] = useState(10000);
  const [maxDailyDrawdown, setMaxDailyDrawdown] = useState(5);
  const [maxOverallDrawdown, setMaxOverallDrawdown] = useState(10);
  const [drawdownType, setDrawdownType] = useState<'static' | 'trailing'>('static');
  const [minTradingDays, setMinTradingDays] = useState(0);
  
  // Efeito para redirecionar após a conta ser criada
  useEffect(() => {
    if (newlyCreatedId) {
      console.log('🎯 Redirecionando para a conta recém-criada:', newlyCreatedId);
      // Pequeno timeout para garantir que o estado foi atualizado
      const redirectTimer = setTimeout(() => {
        navigate(`/accounts/${newlyCreatedId}`);
      }, 100);
      
      // Limpar o timer se o componente for desmontado
      return () => clearTimeout(redirectTimer);
    }
  }, [newlyCreatedId, navigate]);
  
  // Função para lidar com a submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Criar objeto de regras para desafios de prop firm
      const rules = accountType === 'prop_firm_challenge' ? {
        firmName: selectedBroker,
        accountSize,
        profitTarget,
        maxDailyDrawdown,
        maxOverallDrawdown,
        drawdownType,
        minTradingDays
      } : undefined;
      
      // Criar nova conta
      const accountData = {
        name: accountName,
        type: accountType as 'prop_firm_challenge' | 'personal_live' | 'personal_paper',
        importMethod: importMethod as 'auto_sync' | 'file_upload' | 'manual',
        broker: selectedBroker,
        startDate: new Date(),
        rules
      };
      
      console.log('Criando nova conta:', accountData);
      
      // Adicionar a conta usando o contexto
      const accountId = addAccount(accountData);
      
      // Se houver um arquivo selecionado, processar a importação
      if (selectedFile) {
        console.log('Arquivo selecionado para importação:', selectedFile.name);
        // Aqui você implementaria a lógica de processamento do arquivo
        // Por enquanto, apenas simulamos o sucesso
        console.log('Processamento de arquivo simulado com sucesso');
      }
      
      console.log('✅ Conta criada com ID:', accountId);
      
      // Armazena o ID da conta criada para exibir o link
      setNewlyCreatedId(accountId);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Erro ao criar a conta:', error);
      alert('Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  };
  
  // Função para lidar com o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
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

  // Proxy para o evento de seleção de broker
  useEffect(() => {
    // Intercepta as mudanças nos selects do formulário após o componente montar
    setTimeout(() => {
      const selectElements = document.querySelectorAll('select[name="broker"]');
      
      selectElements.forEach(select => {
        select.addEventListener('change', (e) => {
          const target = e.target as HTMLSelectElement;
          if (target.name === 'broker') {
            setSelectedBroker(target.value);
          }
        });
      });
    }, 500); // Pequeno delay para garantir que os elementos estejam montados
  }, []);
  
  // --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL ---
  if (newlyCreatedId) {
    // Se uma conta acabou de ser criada, mostre a mensagem de sucesso com estado de carregamento
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
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
    <Container maxWidth="xl">
      <Box py={3}>
        <Grid container spacing={3}>
          {/* Coluna da esquerda - Formulário */}
          <Grid item xs={12} md={6}>
            <ImportAccountForm />
          </Grid>
          
          {/* Coluna da direita - Instruções */}
          <Grid item xs={12} md={6}>
            <ImportInstructions brokerKey={selectedBroker} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default NewAccountPage; 