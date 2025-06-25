import React, { useState, ChangeEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../../context/AccountsContext';
import { useTrades } from '../../contexts/TradesContext';
import { getSupportedBrokers, getDateFormats } from '../../lib/importInstructions';
import { parseTradeFile } from '../../lib/fileParser';
import { ArrowLeft, Upload, Save, Loader2, AlertTriangle } from 'lucide-react';
import ImportInstructions from './ImportInstructions';

interface FormData {
  name: string;
  type: string;
  broker: string;
  dateFormat: string;
  targetBalance?: number;
  maxDrawdown?: number;
  startDate?: string;
  endDate?: string;
  file: File | null;
  customBroker?: string;
}

const accountTypes = [
  { value: 'live', label: 'Conta Real' },
  { value: 'demo', label: 'Conta Demo' },
  { value: 'prop', label: 'Desafio de Prop Firm' },
];

const ImportAccountForm: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addAccount } = useAccounts();
  const { addTrades } = useTrades();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'live',
    broker: '',
    dateFormat: 'MM/DD/YYYY',
    file: null,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [parseProgress, setParseProgress] = useState<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Limpa o erro do campo quando o usuário faz uma alteração
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
    
    // Emite evento de mudança de broker para atualizar as instruções
    if (name === 'broker') {
      // Cria um evento customizado para notificar a mudança de broker
      const event = new CustomEvent('brokerChange', {
        detail: { broker: value }
      });
      window.dispatchEvent(event);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    
    if (file) {
      setFormData({
        ...formData,
        file,
      });
      
      if (formErrors.file) {
        setFormErrors({
          ...formErrors,
          file: '',
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nome da conta é obrigatório';
    }
    
    if (!formData.broker) {
      errors.broker = 'Selecione uma corretora';
    }
    
    if (!formData.file) {
      errors.file = 'Selecione um arquivo para importar';
    } else {
      const fileExt = formData.file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xls', 'xlsx', 'html'].includes(fileExt || '')) {
        errors.file = 'Formato de arquivo não suportado. Use CSV, XLS, XLSX ou HTML';
      }
    }
    
    if (formData.type === 'prop') {
      if (!formData.targetBalance) {
        errors.targetBalance = 'Meta de lucro é obrigatória para contas de desafio';
      }
      
      if (!formData.maxDrawdown) {
        errors.maxDrawdown = 'Drawdown máximo é obrigatório para contas de desafio';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setParseProgress(0);
    
    try {
      // Verificar se há um arquivo para processar
      if (!formData.file) {
        throw new Error('Nenhum arquivo selecionado');
      }
      
      // Processar o arquivo para extrair os trades
      setParseProgress(10);
      console.log('Iniciando processamento do arquivo:', formData.file.name);
      
      const parsedTrades = await parseTradeFile(
        formData.file,
        formData.broker === 'custom' ? formData.customBroker || 'custom' : formData.broker,
        formData.dateFormat
      );
      
      setParseProgress(50);
      console.log(`Processamento concluído. ${parsedTrades.length} trades encontrados.`);
      
      // Criar a conta com os dados do formulário
      const accountData = {
        name: formData.name,
        type: formData.type,
        broker: formData.broker === 'custom' ? formData.customBroker || 'Corretora Personalizada' : formData.broker,
        balance: 0, // O saldo será calculado com base nos trades importados
        currency: 'USD', // Isso poderia ser determinado a partir do arquivo ou ser um campo adicional
        // Adiciona os campos específicos para contas de desafio
        ...(formData.type === 'prop' && {
          rules: {
            firmName: formData.broker === 'custom' ? formData.customBroker || 'Corretora Personalizada' : formData.broker,
            accountSize: formData.targetBalance || 0,
            profitTarget: formData.targetBalance || 0,
            maxDailyDrawdown: formData.maxDrawdown || 5,
            maxOverallDrawdown: formData.maxDrawdown || 10,
            drawdownType: 'static',
            minTradingDays: 0,
          }
        }),
      };
      
      setParseProgress(75);
      console.log('Criando conta com os dados:', accountData);
      
      // Adicionar a conta e obter o ID
      const accountId = await addAccount(accountData);
      
      // Adicionar os trades associados à conta
      if (parsedTrades.length > 0) {
        // Associar os trades à conta recém-criada
        const tradesWithAccountId = parsedTrades.map(trade => ({
          ...trade,
          accountId
        }));
        
        // Adicionar os trades usando o contexto de trades
        await addTrades(tradesWithAccountId);
        console.log(`${tradesWithAccountId.length} trades adicionados à conta ${accountId}`);
      }
      
      setParseProgress(100);
      console.log('Conta criada com sucesso. ID:', accountId);
      
      // Navegar para a página da conta recém-criada
      navigate(`/accounts/${accountId}`);
    } catch (err: any) {
      console.error('Erro ao importar conta:', err);
      setError(`Ocorreu um erro ao processar o arquivo: ${err.message || 'Verifique o formato e tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const brokers = getSupportedBrokers();
  const dateFormats = getDateFormats();

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
          Adicionar Nova Conta via Importação
        </h2>
      </div>
      
      <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6"></div>

      {error && (
        <div className="mb-6 p-4 bg-loss-50 dark:bg-loss-900/20 border border-loss-200 dark:border-loss-800 rounded-lg text-loss-700 dark:text-loss-300">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Erro</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-primary-700 dark:text-primary-300">
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <p>Processando arquivo... {parseProgress}%</p>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${parseProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Nome da conta */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Nome da Conta *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                formErrors.name 
                  ? 'border-loss-500 dark:border-loss-500' 
                  : 'border-neutral-300 dark:border-neutral-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
              placeholder="Minha Conta de Trading"
            />
            {formErrors.name && (
              <p className="mt-1 text-sm text-loss-500">{formErrors.name}</p>
            )}
          </div>

          {/* Tipo de conta */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tipo de Conta *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
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
              Corretora *
            </label>
            <select
              id="broker"
              name="broker"
              value={formData.broker}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                formErrors.broker 
                  ? 'border-loss-500 dark:border-loss-500' 
                  : 'border-neutral-300 dark:border-neutral-600'
              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
            >
              <option value="">Selecione uma corretora</option>
              {brokers.map((broker) => (
                <option key={broker.value} value={broker.value}>
                  {broker.label}
                </option>
              ))}
              <option value="custom">Outra corretora</option>
            </select>
            {formErrors.broker && (
              <p className="mt-1 text-sm text-loss-500">{formErrors.broker}</p>
            )}
            
            {/* Instruções de importação */}
            <ImportInstructions broker={formData.broker} />
          </div>

          {/* Campo para corretora personalizada */}
          {formData.broker === 'custom' && (
            <div>
              <label htmlFor="customBroker" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nome da Corretora *
              </label>
              <input
                type="text"
                id="customBroker"
                name="customBroker"
                value={formData.customBroker || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
                placeholder="Nome da corretora"
              />
            </div>
          )}

          {/* Formato de data */}
          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Formato de Data *
            </label>
            <select
              id="dateFormat"
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent"
            >
              {dateFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campos específicos para contas de desafio (Prop Firm) */}
          {formData.type === 'prop' && (
            <>
              <div>
                <label htmlFor="targetBalance" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Meta de Lucro ($) *
                </label>
                <input
                  type="number"
                  id="targetBalance"
                  name="targetBalance"
                  value={formData.targetBalance || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                    formErrors.targetBalance 
                      ? 'border-loss-500 dark:border-loss-500' 
                      : 'border-neutral-300 dark:border-neutral-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
                  placeholder="Ex: 1000"
                />
                {formErrors.targetBalance && (
                  <p className="mt-1 text-sm text-loss-500">{formErrors.targetBalance}</p>
                )}
              </div>
              <div>
                <label htmlFor="maxDrawdown" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Drawdown Máximo (%) *
                </label>
                <input
                  type="number"
                  id="maxDrawdown"
                  name="maxDrawdown"
                  value={formData.maxDrawdown || ''}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-white dark:bg-neutral-800 border ${
                    formErrors.maxDrawdown 
                      ? 'border-loss-500 dark:border-loss-500' 
                      : 'border-neutral-300 dark:border-neutral-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent`}
                  placeholder="Ex: 5"
                />
                {formErrors.maxDrawdown && (
                  <p className="mt-1 text-sm text-loss-500">{formErrors.maxDrawdown}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Seção de upload de arquivo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Arquivo de Histórico de Trades *
          </label>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${
              formErrors.file 
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
            
            {formData.file ? (
              <div className="flex flex-col items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-2">
                  <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                  {formData.file.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {(formData.file.size / 1024).toFixed(2)} KB
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
          
          {formErrors.file && (
            <p className="mt-1 text-sm text-loss-500">{formErrors.file}</p>
          )}
          
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            O arquivo deve conter o histórico de trades exportado da sua corretora.
            Certifique-se de que o formato do arquivo corresponde à corretora selecionada.
          </p>
        </div>

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
                Importar Conta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportAccountForm; 