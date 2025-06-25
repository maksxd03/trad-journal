import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountsContext';
import { useTrades } from '../contexts/TradesContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Loader2,
  PlusCircle,
  Wallet,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import ProgressBar from '../components/ui/ProgressBar';

const AccountsPage: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, loading } = useAccounts();
  const { trades } = useTrades();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [customBroker, setCustomBroker] = useState('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'live',
    broker: '',
    balance: '',
    currency: 'USD',
    notes: ''
  });
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Verificar se os dados das contas estão sendo carregados corretamente
  useEffect(() => {
    console.log('Contas carregadas:', accounts);
    if (accounts && accounts.length > 0) {
      console.log('Exemplo da estrutura de uma conta:', accounts[0]);
    }
  }, [accounts]);

  // Adicionar um useEffect para monitorar mudanças no estado 'open'
  useEffect(() => {
    console.log('Estado do modal atualizado:', open ? 'Aberto' : 'Fechado');
    if (open && editMode && currentAccount) {
      console.log('Modal aberto em modo de edição para a conta:', currentAccount);
      console.log('Dados do formulário definidos:', formData);
      console.log('Campo customBroker:', customBroker);
      
      // Se o broker está definido como "Personalizado" mas customBroker está vazio,
      // e a conta tem um valor de broker, definir customBroker com esse valor
      if ((formData.broker === 'Personalizado' || formData.broker === 'Outra') && 
          !customBroker && currentAccount.broker) {
        console.log('Definindo customBroker com o valor original da conta:', currentAccount.broker);
        setCustomBroker(currentAccount.broker);
      }
    }
  }, [open, editMode, currentAccount, formData, customBroker]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpen = (account?: any) => {
    console.log('Tentando abrir modal para a conta:', account);
    
    if (account) {
      console.log('Modo de edição ativado.');
      setEditMode(true);
      setCurrentAccount(account);

      // Verificar a estrutura do objeto account
      console.log('Estrutura do objeto account:', Object.keys(account));
      console.log('Valores do objeto account:', account);
      
      // Lista de corretoras pré-definidas para verificar
      const predefinedBrokers = [
        "FTMO", "MyForexFunds", "Apex Trader Funding", "The Funded Trader", 
        "True Forex Funds", "E8 Funding", "City Traders Imperium", "Fidelcrest",
        "MetaTrader 4", "MetaTrader 5", "cTrader", "TradingView", "NinjaTrader"
      ];
      
      // Verifica se a corretora está na lista pré-definida
      const brokerValue = account.broker || '';
      const isPredefinedBroker = predefinedBrokers.includes(brokerValue);
      
      // Definir os dados do formulário
      const formDataToSet = {
        name: account.name || '',
        type: account.type || 'live',
        broker: isPredefinedBroker ? brokerValue : 'Personalizado',
        balance: account.balance !== undefined ? account.balance.toString() : '',
        currency: account.currency || 'USD',
        notes: account.notes || ''
      };
      
      // Se não estiver na lista e não for vazio, define como personalizado no dropdown
      // e coloca o valor real no campo customBroker
      if (!isPredefinedBroker && brokerValue) {
        console.log('Corretora personalizada detectada:', brokerValue);
        setCustomBroker(brokerValue);
      } else {
        setCustomBroker('');
      }
      
      console.log('Definindo dados do formulário com:', formDataToSet);
      console.log('Campo broker (dropdown):', formDataToSet.broker);
      console.log('Campo customBroker (texto):', brokerValue);
      
      setFormData(formDataToSet);
    } else {
      console.log('Modo de criação ativado.');
      setEditMode(false);
      setCurrentAccount(null);
      setCustomBroker('');
      setFormData({
        name: '',
        type: 'live',
        broker: '',
        balance: '',
        currency: 'USD',
        notes: ''
      });
    }
    
    console.log('Abrindo o modal...');
    setOpen(true);
  };

  const handleClose = () => {
    console.log('Fechando o modal...');
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as { name: string; value: string };
    console.log(`Campo alterado: ${name}, valor: ${value}`);
    
    // Tratamento especial para o campo broker
    if (name === 'broker') {
      if (value === 'Personalizado' || value === 'Outra') {
        // Se selecionar "Personalizado" ou "Outra", mantém essa seleção no dropdown
        setFormData(prevData => ({
          ...prevData,
          [name]: value
        }));
        
        // Limpar o campo customBroker para o usuário digitar
        // Apenas limpar se não estiver em modo de edição ou se estiver mudando de opção
        if (!editMode || (editMode && formData.broker !== value)) {
          setCustomBroker('');
          console.log('Campo customBroker limpo para entrada de texto');
        }
      } else {
        // Para outras opções do dropdown, atualiza normalmente
        setFormData(prevData => ({
          ...prevData,
          [name]: value
        }));
        
        // Limpar o campo customBroker já que não é mais necessário
        setCustomBroker('');
      }
    } else if (name === 'customBroker') {
      // Atualiza o campo customBroker
      setCustomBroker(value);
      console.log('Campo customBroker atualizado para:', value);
      
      // Não atualizamos o formData.broker aqui para manter "Personalizado" no dropdown
      // O valor real será usado apenas no momento do submit
    } else {
      // Para outros campos, atualiza normalmente
      setFormData(prevData => {
        const newData = {
          ...prevData,
          [name]: value
        };
        console.log('Novos dados do formulário:', newData);
        return newData;
      });
    }
  };

  const handleSubmit = () => {
    console.log('Submetendo formulário com dados:', formData);
    
    // Validar dados do formulário
    if (!formData.name) {
      console.error('Dados do formulário incompletos. Nome é obrigatório.');
      alert('Por favor, preencha o nome da conta.');
      return;
    }
    
    // Validar o campo de corretora
    if (!formData.broker) {
      console.error('Dados do formulário incompletos. Corretora é obrigatória.');
      alert('Por favor, selecione ou digite o nome da corretora.');
      return;
    }
    
    // Preparar os dados finais da conta
    let finalBroker = formData.broker;
    
    // Se for "Personalizado" ou "Outra", usar o valor do campo customBroker
    if (formData.broker === 'Personalizado' || formData.broker === 'Outra') {
      if (!customBroker) {
        console.error('Corretora personalizada não especificada.');
        alert('Por favor, digite o nome da corretora personalizada.');
        return;
      }
      finalBroker = customBroker;
    }
    
    const accountData = {
      ...formData,
      broker: finalBroker, // Usar o valor correto da corretora
      balance: parseFloat(formData.balance) || 0
    };
    
    console.log('Dados finais da conta para submissão:', accountData);
    
    if (editMode && currentAccount) {
      console.log('Atualizando conta existente:', currentAccount.id, 'com dados:', accountData);
      updateAccount(currentAccount.id, accountData);
    } else {
      console.log('Adicionando nova conta com dados:', accountData);
      addAccount(accountData);
    }
    
    console.log('Fechando o modal após submissão bem-sucedida');
    handleClose();
  };

  const handleDelete = () => {
    if (accountToDelete) {
      deleteAccount(accountToDelete);
      setShowDeleteModal(false);
      setAccountToDelete(null);
    }
  };

  // Método dedicado para editar uma conta
  const handleEditAccount = (e: React.MouseEvent, account: any) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Método handleEditAccount chamado com a conta:', account);
    
    // Garantir que temos todos os dados necessários
    if (!account || !account.id) {
      console.error('Tentativa de editar conta sem ID válido:', account);
      return;
    }
    
    // Forçar a atualização do estado para garantir que o modal seja aberto
    console.log('Definindo modo de edição como true');
    setEditMode(true);
    
    console.log('Definindo conta atual:', account);
    setCurrentAccount(account);
    
    // Lista de corretoras pré-definidas para verificar
    const predefinedBrokers = [
      "FTMO", "MyForexFunds", "Apex Trader Funding", "The Funded Trader", 
      "True Forex Funds", "E8 Funding", "City Traders Imperium", "Fidelcrest",
      "MetaTrader 4", "MetaTrader 5", "cTrader", "TradingView", "NinjaTrader"
    ];
    
    // Verifica se a corretora está na lista pré-definida
    const brokerValue = account.broker || '';
    const isPredefinedBroker = predefinedBrokers.includes(brokerValue);
    
    // Definir os dados do formulário com verificações de segurança
    const formDataToSet = {
      name: account.name || '',
      type: account.type || 'live',
      broker: isPredefinedBroker ? brokerValue : 'Personalizado',
      balance: account.balance !== undefined ? account.balance.toString() : '0',
      currency: account.currency || 'USD',
      notes: account.notes || ''
    };
    
    // Se não estiver na lista e não for vazio, define como personalizado no dropdown
    // e coloca o valor real no campo customBroker
    if (!isPredefinedBroker && brokerValue) {
      console.log('Corretora personalizada detectada:', brokerValue);
      setCustomBroker(brokerValue);
    } else {
      setCustomBroker('');
    }
    
    console.log('Definindo dados do formulário para edição:', formDataToSet);
    console.log('Campo broker (dropdown):', formDataToSet.broker);
    console.log('Campo customBroker (texto):', brokerValue);
    
    // Atualizar o estado do formulário
    setFormData(formDataToSet);
    
    // Abrir o modal imediatamente
    console.log('Abrindo o modal...');
    setOpen(true);
    
    // Verificar após um momento se o modal foi aberto corretamente
    setTimeout(() => {
      console.log('Verificação após timeout - Estado do modal:', open ? 'Aberto' : 'Fechado');
      console.log('Verificação após timeout - Modo de edição:', editMode ? 'Ativo' : 'Inativo');
      console.log('Verificação após timeout - Conta atual:', currentAccount);
      console.log('Verificação após timeout - Dados do formulário:', formData);
      console.log('Verificação após timeout - Campo broker (dropdown):', formData.broker);
      console.log('Verificação após timeout - Campo customBroker (texto):', customBroker);
    }, 100);
  };

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  // Função para classificar contas
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a];
      let bValue: any = b[sortField as keyof typeof b];
      
      // Tratamento especial para campos aninhados
      if (sortField === 'balance' || sortField === 'currentEquity') {
        aValue = a.status?.currentEquity || 0;
        bValue = b.status?.currentEquity || 0;
      }
      
      if (aValue === bValue) return 0;
      
      const result = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? result : -result;
    });
  }, [accounts, sortField, sortDirection]);

  // Filtrar contas com base no filtro ativo
  const filteredAccounts = useMemo(() => {
    if (!activeFilter) return sortedAccounts;
    return sortedAccounts.filter(account => account.type === activeFilter);
  }, [sortedAccounts, activeFilter]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    // Saldo Total Consolidado
    const totalBalance = accounts.reduce((sum, account) => 
      sum + (account.status?.currentEquity || 0), 0);
    
    // P&L Total (Mês)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.closeTime || trade.openTime);
      return tradeDate.getMonth() === currentMonth && 
             tradeDate.getFullYear() === currentYear;
    });
    
    const monthlyPnL = monthTrades.reduce((sum, trade) => 
      sum + (trade.pnl || 0), 0);
    
    // Contas Ativas (não concluídas ou falhas)
    const activeAccounts = accounts.filter(account => 
      !(account.status?.isPassed || account.status?.isOverallDrawdownViolated)).length;
    
    return {
      totalBalance,
      monthlyPnL,
      activeAccounts
    };
  }, [accounts, trades]);

  // Função para alternar a classificação
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para confirmar exclusão
  const confirmDelete = (accountId: string) => {
    setAccountToDelete(accountId);
    setShowDeleteModal(true);
  };

  // Renderização do ícone de classificação
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Minhas Contas</h1>
        <Link
          to="/accounts/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Nova Conta
        </Link>
      </div>

      {/* Painel de KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPICard 
          title="Saldo Total Consolidado" 
          value={formatCurrency(kpis.totalBalance)}
          icon={Wallet}
        />
        <KPICard 
          title="P&L Total (Mês Atual)" 
          value={formatCurrency(kpis.monthlyPnL)}
          icon={TrendingUp}
          trend={kpis.monthlyPnL > 0 
            ? { value: Math.abs(kpis.monthlyPnL / 100), isPositive: true }
            : { value: Math.abs(kpis.monthlyPnL / 100), isPositive: false }
          }
        />
        <KPICard 
          title="Contas Ativas" 
          value={kpis.activeAccounts}
          icon={Users}
        />
      </div>

      {/* Filtros de tipo de conta */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === null
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveFilter('live')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'live'
              ? 'bg-profit-600 text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          Contas Reais
        </button>
        <button
          onClick={() => setActiveFilter('prop_firm_challenge')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'prop_firm_challenge'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          Desafios
        </button>
        <button
          onClick={() => setActiveFilter('demo')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeFilter === 'demo'
              ? 'bg-neutral-600 text-white'
              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
          }`}
        >
          Contas Demo
        </button>
      </div>

      {/* Tabela de Contas */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-800">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center">
                    Nome da Conta
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('type')}
                >
                  <div className="flex items-center">
                    Tipo
                    {renderSortIcon('type')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('broker')}
                >
                  <div className="flex items-center">
                    Corretora
                    {renderSortIcon('broker')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('currentEquity')}
                >
                  <div className="flex items-center">
                    Saldo
                    {renderSortIcon('currentEquity')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                    Nenhuma conta encontrada. Clique em "Nova Conta" para adicionar.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr 
                    key={account.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {account.name}
                        </div>
                        
                        {/* Barra de progresso para contas de desafio */}
                        {account.type === 'prop_firm_challenge' && account.rules && (
                          <div className="mt-1">
                            <ProgressBar 
                              value={(account.status?.currentEquity || 0) - (account.rules.accountSize || 0)}
                              max={account.rules.profitTarget || 1000}
                              size="xs"
                              color={
                                account.status?.isPassed ? 'profit' : 
                                account.status?.isOverallDrawdownViolated ? 'loss' : 
                                'primary'
                              }
                              className="mt-1 w-32"
                            />
                            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {formatCurrency((account.status?.currentEquity || 0) - (account.rules.accountSize || 0))} / {formatCurrency(account.rules.profitTarget || 0)}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.type === 'prop_firm_challenge' 
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' 
                          : account.type === 'demo'
                            ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300'
                            : 'bg-profit-100 text-profit-800 dark:bg-profit-900/30 dark:text-profit-300'
                      }`}>
                        {account.type === 'prop_firm_challenge' ? 'Desafio' : account.type === 'demo' ? 'Demo' : 'Real'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700 dark:text-neutral-300">
                      {account.broker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        (account.status?.currentEquity || 0) > 0
                          ? 'text-profit-600 dark:text-profit-400'
                          : (account.status?.currentEquity || 0) < 0
                            ? 'text-loss-600 dark:text-loss-400'
                            : 'text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {formatCurrency(account.status?.currentEquity || 0, account.currency || 'USD')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleEditAccount(e, account)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Editar</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(account.id)}
                          className="text-loss-600 hover:text-loss-900 dark:text-loss-400 dark:hover:text-loss-300 p-2 hover:bg-loss-50 dark:hover:bg-loss-900/20 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Confirmar exclusão</h3>
            <p className="text-neutral-700 dark:text-neutral-300 mb-6">
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-loss-600 text-white rounded-md hover:bg-loss-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar/Editar Conta */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-neutral-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                  {editMode ? `Editar Conta: ${currentAccount?.name}` : 'Adicionar Nova Conta'}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nome da Conta
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Tipo de Conta
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="live">Conta Real</option>
                      <option value="demo">Conta Demo</option>
                      <option value="prop_firm_challenge">Prop Firm</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="broker" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Corretora
                    </label>
                    <select
                      id="broker"
                      name="broker"
                      value={formData.broker}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma corretora</option>
                      <option value="Personalizado">Personalizado</option>
                      <option value="FTMO">FTMO</option>
                      <option value="MyForexFunds">MyForexFunds</option>
                      <option value="Apex Trader Funding">Apex Trader Funding</option>
                      <option value="The Funded Trader">The Funded Trader</option>
                      <option value="True Forex Funds">True Forex Funds</option>
                      <option value="E8 Funding">E8 Funding</option>
                      <option value="City Traders Imperium">City Traders Imperium</option>
                      <option value="Fidelcrest">Fidelcrest</option>
                      <option value="MetaTrader 4">MetaTrader 4</option>
                      <option value="MetaTrader 5">MetaTrader 5</option>
                      <option value="cTrader">cTrader</option>
                      <option value="TradingView">TradingView</option>
                      <option value="NinjaTrader">NinjaTrader</option>
                      <option value="Outra">Outra</option>
                    </select>
                    
                    {(formData.broker === 'Personalizado' || formData.broker === 'Outra') && (
                      <div className="mt-2">
                        <input
                          type="text"
                          id="customBroker"
                          name="customBroker"
                          value={customBroker}
                          onChange={handleChange}
                          placeholder={formData.broker === 'Personalizado' ? "Digite o nome da corretora" : "Digite o nome da plataforma"}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          autoComplete="off"
                          autoFocus
                        />
                        {!customBroker && (
                          <p className="mt-1 text-xs text-amber-500">
                            Por favor, digite o nome da {formData.broker === 'Personalizado' ? "corretora" : "plataforma"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="balance" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Saldo
                      </label>
                      <input
                        type="number"
                        id="balance"
                        name="balance"
                        value={formData.balance}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Moeda
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="JPY">JPY</option>
                        <option value="BRL">BRL</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Notas
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 flex justify-between">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  {editMode ? 'Atualizar' : 'Adicionar'} Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage; 