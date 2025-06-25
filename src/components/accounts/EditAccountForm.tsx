import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { ArrowLeft, Upload, Save, Loader2 } from 'lucide-react';

// Lista de corretoras/plataformas suportadas
const brokerPlatforms = [
  { value: 'apex', label: 'Apex Trader Funding' },
  { value: 'ftmo', label: 'FTMO' },
  { value: 'topstep', label: 'Topstep' },
  { value: 'leeloo', label: 'Leeloo Trading' },
  { value: 'myforexfunds', label: 'My Forex Funds' },
  { value: 'fundedNext', label: 'Funded Next' },
  { value: 'theFundedTrader', label: 'The Funded Trader' },
  { value: 'tradovate', label: 'Tradovate' },
  { value: 'ninjatrader', label: 'NinjaTrader' },
  { value: 'metatrader4', label: 'MetaTrader 4' },
  { value: 'metatrader5', label: 'MetaTrader 5' },
  { value: 'tradestation', label: 'TradeStation' },
  { value: 'thinkorswim', label: 'ThinkOrSwim' },
  { value: 'other', label: 'Outro' }
];

// Tipos de conta disponíveis
const accountTypes = [
  { value: 'prop_firm_challenge', label: 'Desafio de Prop Firm' },
  { value: 'personal_live', label: 'Conta Pessoal Real' },
  { value: 'personal_paper', label: 'Conta Pessoal Demo' }
];

// Métodos de importação disponíveis
const importMethods = [
  { value: 'manual', label: 'Entrada Manual' },
  { value: 'file_upload', label: 'Importação por Arquivo' },
  // { value: 'auto_sync', label: 'Sincronização Automática' }, // Será implementado no futuro
];

const EditAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getAccount, updateAccount } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [accountLoaded, setAccountLoaded] = useState(false);
  
  // Estados do formulário
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('prop_firm_challenge');
  const [broker, setBroker] = useState('');
  const [customBroker, setCustomBroker] = useState('');
  const [importMethod, setImportMethod] = useState('manual');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estados para regras de prop firm (apenas para desafios)
  const [accountSize, setAccountSize] = useState(100000);
  const [profitTarget, setProfitTarget] = useState(10000);
  const [maxDailyDrawdown, setMaxDailyDrawdown] = useState(5);
  const [maxOverallDrawdown, setMaxOverallDrawdown] = useState(10);
  const [drawdownType, setDrawdownType] = useState<'static' | 'trailing'>('static');
  const [minTradingDays, setMinTradingDays] = useState(0);
  
  // Estado para validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados da conta existente
  useEffect(() => {
    if (accountId) {
      const account = getAccount(accountId);
      if (account) {
        setAccountName(account.name);
        setAccountType(account.type);
        setBroker(account.broker);
        
        if (!brokerPlatforms.some(bp => bp.value === account.broker)) {
          setBroker('other');
          setCustomBroker(account.broker);
        }
        
        setImportMethod(account.importMethod);
        
        if (account.rules) {
          setAccountSize(account.rules.accountSize);
          setProfitTarget(account.rules.profitTarget);
          setMaxDailyDrawdown(account.rules.maxDailyDrawdown);
          setMaxOverallDrawdown(account.rules.maxOverallDrawdown);
          setDrawdownType(account.rules.drawdownType);
          setMinTradingDays(account.rules.minTradingDays || 0);
        }
        
        setAccountLoaded(true);
      } else {
        // Conta não encontrada, redirecionar para a lista de contas
        navigate('/accounts');
      }
    }
  }, [accountId, getAccount, navigate]);

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!accountName.trim()) {
      newErrors.accountName = 'Nome da conta é obrigatório';
    }
    
    if (accountType === 'prop_firm_challenge') {
      if (!broker) {
        newErrors.broker = 'Selecione uma corretora';
      }
      
      if (broker === 'other' && !customBroker.trim()) {
        newErrors.customBroker = 'Nome da corretora é obrigatório';
      }
      
      if (!accountSize || accountSize <= 0) {
        newErrors.accountSize = 'Tamanho da conta deve ser maior que zero';
      }
      
      if (!profitTarget || profitTarget <= 0) {
        newErrors.profitTarget = 'Meta de lucro deve ser maior que zero';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para lidar com a submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !accountId) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Criar objeto de regras para desafios de prop firm
      const rules = accountType === 'prop_firm_challenge' ? {
        firmName: broker === 'other' ? customBroker : broker,
        accountSize,
        profitTarget,
        maxDailyDrawdown,
        maxOverallDrawdown,
        drawdownType,
        minTradingDays
      } : undefined;
      
      // Obter a conta atual para manter os dados que não estamos alterando
      const currentAccount = getAccount(accountId);
      
      if (!currentAccount) {
        throw new Error('Conta não encontrada');
      }
      
      // Atualizar conta
      const accountData = {
        ...currentAccount,
        name: accountName,
        type: accountType as 'prop_firm_challenge' | 'personal_live' | 'personal_paper',
        importMethod: importMethod as 'auto_sync' | 'file_upload' | 'manual',
        broker: broker === 'other' ? customBroker : broker,
        rules,
      };
      
      // Atualizar a conta usando o contexto
      updateAccount(accountId, accountData);
      
      // Se houver um arquivo selecionado, processar a importação
      if (importMethod === 'file_upload' && selectedFile) {
        console.log('Arquivo selecionado para importação:', selectedFile.name);
        // Aqui você implementaria a lógica de processamento do arquivo
        // Por enquanto, apenas simulamos o sucesso
        console.log('Processamento de arquivo simulado com sucesso');
      }
      
      // Navegar de volta para a página da conta
      navigate(`/accounts/${accountId}`);
    } catch (error) {
      console.error('Erro ao atualizar a conta:', error);
      alert('Ocorreu um erro ao atualizar a conta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para lidar com o upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Emitir evento de mudança de broker para atualizar as instruções
  const handleBrokerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setBroker(value);
    
    // Emitir evento customizado para atualizar as instruções
    const event = new CustomEvent('brokerChange', {
      detail: { broker: value }
    });
    window.dispatchEvent(event);
  };

  if (!accountLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/accounts')}
          className="mr-3 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Editar Conta
        </h2>
      </div>
      
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6"></div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Nome da conta */}
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Nome da Conta *
            </label>
            <input
              type="text"
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                errors.accountName 
                  ? 'border-loss-500 dark:border-loss-500' 
                  : 'border-neutral-300 dark:border-neutral-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
              placeholder="Minha Conta de Trading"
            />
            {errors.accountName && (
              <p className="mt-1 text-sm text-loss-500">{errors.accountName}</p>
            )}
          </div>

          {/* Tipo de conta */}
          <div>
            <label htmlFor="accountType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tipo de Conta *
            </label>
            <select
              id="accountType"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Corretora */}
          <div>
            <label htmlFor="broker" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Corretora {accountType === 'prop_firm_challenge' ? '*' : ''}
            </label>
            <select
              id="broker"
              name="broker"
              value={broker}
              onChange={handleBrokerChange}
              className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                errors.broker 
                  ? 'border-loss-500 dark:border-loss-500' 
                  : 'border-neutral-300 dark:border-neutral-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
            >
              <option value="">Selecione uma corretora</option>
              {brokerPlatforms.map((brokerOption) => (
                <option key={brokerOption.value} value={brokerOption.value}>
                  {brokerOption.label}
                </option>
              ))}
            </select>
            {errors.broker && (
              <p className="mt-1 text-sm text-loss-500">{errors.broker}</p>
            )}
          </div>

          {/* Campo para corretora personalizada */}
          {broker === 'other' && (
            <div>
              <label htmlFor="customBroker" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nome da Corretora *
              </label>
              <input
                type="text"
                id="customBroker"
                value={customBroker}
                onChange={(e) => setCustomBroker(e.target.value)}
                className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                  errors.customBroker 
                    ? 'border-loss-500 dark:border-loss-500' 
                    : 'border-neutral-300 dark:border-neutral-600'
                } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
                placeholder="Nome da corretora"
              />
              {errors.customBroker && (
                <p className="mt-1 text-sm text-loss-500">{errors.customBroker}</p>
              )}
            </div>
          )}

          {/* Método de importação */}
          <div>
            <label htmlFor="importMethod" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Método de Importação *
            </label>
            <select
              id="importMethod"
              value={importMethod}
              onChange={(e) => setImportMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            >
              {importMethods.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campos específicos para contas de desafio (Prop Firm) */}
          {accountType === 'prop_firm_challenge' && (
            <>
              <div>
                <label htmlFor="accountSize" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tamanho da Conta ($) *
                </label>
                <input
                  type="number"
                  id="accountSize"
                  value={accountSize}
                  onChange={(e) => setAccountSize(Number(e.target.value))}
                  className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                    errors.accountSize 
                      ? 'border-loss-500 dark:border-loss-500' 
                      : 'border-neutral-300 dark:border-neutral-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
                  placeholder="Ex: 100000"
                />
                {errors.accountSize && (
                  <p className="mt-1 text-sm text-loss-500">{errors.accountSize}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="profitTarget" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Meta de Lucro ($) *
                </label>
                <input
                  type="number"
                  id="profitTarget"
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(Number(e.target.value))}
                  className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                    errors.profitTarget 
                      ? 'border-loss-500 dark:border-loss-500' 
                      : 'border-neutral-300 dark:border-neutral-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
                  placeholder="Ex: 10000"
                />
                {errors.profitTarget && (
                  <p className="mt-1 text-sm text-loss-500">{errors.profitTarget}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="maxDailyDrawdown" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Drawdown Diário Máx. (%) *
                </label>
                <input
                  type="number"
                  id="maxDailyDrawdown"
                  value={maxDailyDrawdown}
                  onChange={(e) => setMaxDailyDrawdown(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  placeholder="Ex: 5"
                />
              </div>
              
              <div>
                <label htmlFor="maxOverallDrawdown" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Drawdown Total Máx. (%) *
                </label>
                <input
                  type="number"
                  id="maxOverallDrawdown"
                  value={maxOverallDrawdown}
                  onChange={(e) => setMaxOverallDrawdown(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  placeholder="Ex: 10"
                />
              </div>
              
              <div>
                <label htmlFor="drawdownType" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tipo de Drawdown
                </label>
                <select
                  id="drawdownType"
                  value={drawdownType}
                  onChange={(e) => setDrawdownType(e.target.value as 'static' | 'trailing')}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                >
                  <option value="static">Estático</option>
                  <option value="trailing">Trailing</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="minTradingDays" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Dias Mínimos de Trading
                </label>
                <input
                  type="number"
                  id="minTradingDays"
                  value={minTradingDays}
                  onChange={(e) => setMinTradingDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                  placeholder="Ex: 0"
                />
              </div>
            </>
          )}
        </div>

        {/* Seção de upload de arquivo (condicional) */}
        {importMethod === 'file_upload' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Arquivo de Histórico de Trades
            </label>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
                errors.file 
                  ? 'border-loss-500 dark:border-loss-500' 
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv,.xls,.xlsx,.html"
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-2">
                    <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-2">
                    <Upload className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                    Clique para selecionar um arquivo
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Formatos suportados: CSV, XLS, XLSX, HTML
                  </p>
                </div>
              )}
            </div>
            
            {errors.file && (
              <p className="mt-1 text-sm text-loss-500">{errors.file}</p>
            )}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/accounts')}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAccountForm; 