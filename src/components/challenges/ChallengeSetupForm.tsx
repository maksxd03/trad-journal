import React, { useState, useEffect } from 'react';
import { PropFirmRules, DrawdownType } from '../../types/propFirmChallenge';
import { getPredefinedRules, supportedPropFirms, percentToAmount, amountToPercent } from '../../lib/propFirms';

interface ChallengeSetupFormProps {
  onSubmit: (rules: PropFirmRules) => void;
  initialRules?: Partial<PropFirmRules>;
}

const ChallengeSetupForm: React.FC<ChallengeSetupFormProps> = ({ 
  onSubmit,
  initialRules
}) => {
  // Estado para armazenar os valores do formulário
  const [formValues, setFormValues] = useState<PropFirmRules>({
    firmName: initialRules?.firmName || 'FTMO',
    accountSize: initialRules?.accountSize || 100000,
    profitTarget: initialRules?.profitTarget || 10000, // 10% padrão
    maxDailyDrawdown: initialRules?.maxDailyDrawdown || 5, // 5% padrão
    maxOverallDrawdown: initialRules?.maxOverallDrawdown || 10, // 10% padrão
    drawdownType: initialRules?.drawdownType || 'static',
    minTradingDays: initialRules?.minTradingDays || 0,
    consistencyRulePercentage: initialRules?.consistencyRulePercentage,
    otherRules: initialRules?.otherRules || ''
  });

  // Estados para controlar como os valores são exibidos (em valor absoluto ou percentual)
  const [profitTargetAsPercentage, setProfitTargetAsPercentage] = useState(false);
  const [drawdownAsPercentage, setDrawdownAsPercentage] = useState(true);
  
  // Estado para controlar o valor do dropdown da prop firm
  const [selectedFirm, setSelectedFirm] = useState<string>(formValues.firmName);

  // Efeito para atualizar o estado local quando o formValues mudar
  useEffect(() => {
    setSelectedFirm(formValues.firmName);
  }, [formValues.firmName]);

  // Efeito para carregar as regras predefinidas quando a prop firm mudar
  const handleFirmChange = (firmName: string) => {
    // Atualiza o estado local do dropdown primeiro
    setSelectedFirm(firmName);
    
    // Busca as regras predefinidas
    const predefinedRules = getPredefinedRules(firmName);
    
    // Atualiza o formValues com as regras predefinidas
    setFormValues(prev => ({
      ...prev,
      firmName, // Importante: armazena o nome da firma aqui
      ...predefinedRules
    }));
  };

  // Manipuladores de eventos para os campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Tratamento especial para o campo firmName
    if (name === 'firmName') {
      handleFirmChange(value);
      return;
    }
    
    // Para campos numéricos, convertemos o valor para número
    if (['accountSize', 'profitTarget', 'maxDailyDrawdown', 'maxOverallDrawdown', 'minTradingDays', 'consistencyRulePercentage'].includes(name)) {
      setFormValues(prev => ({
        ...prev,
        [name]: name === 'minTradingDays' ? parseInt(value) : parseFloat(value)
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manipulador para o tipo de drawdown (static ou trailing)
  const handleDrawdownTypeChange = (type: DrawdownType) => {
    setFormValues(prev => ({
      ...prev,
      drawdownType: type
    }));
  };

  // Manipuladores para alternar entre porcentagem e valor absoluto
  const toggleProfitTargetFormat = () => {
    if (profitTargetAsPercentage) {
      // Converter de porcentagem para valor absoluto
      const amount = percentToAmount(formValues.accountSize, formValues.profitTarget);
      setFormValues(prev => ({
        ...prev,
        profitTarget: amount
      }));
    } else {
      // Converter de valor absoluto para porcentagem
      const percentage = amountToPercent(formValues.accountSize, formValues.profitTarget);
      setFormValues(prev => ({
        ...prev,
        profitTarget: percentage
      }));
    }
    setProfitTargetAsPercentage(!profitTargetAsPercentage);
  };

  // Função para validar o formulário antes de submeter
  const validateForm = (): boolean => {
    if (!formValues.firmName) return false;
    if (formValues.accountSize <= 0) return false;
    if (formValues.profitTarget <= 0) return false;
    if (formValues.maxDailyDrawdown <= 0) return false;
    if (formValues.maxOverallDrawdown <= 0) return false;
    if (formValues.minTradingDays < 0) return false;
    
    return true;
  };

  // Manipulador para submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }

    // Converter valores de porcentagem para absoluto antes de submeter, se necessário
    let finalRules = { ...formValues };
    if (profitTargetAsPercentage) {
      finalRules.profitTarget = percentToAmount(formValues.accountSize, formValues.profitTarget);
    }

    onSubmit(finalRules);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Configurar Novo Desafio
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Preencha os detalhes do seu desafio de prop firm para começar a rastrear seu progresso.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prop Firm */}
        <div>
          <label htmlFor="firmName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Prop Firm
          </label>
          <select
            id="firmName"
            name="firmName"
            value={selectedFirm}
            onChange={(e) => handleFirmChange(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
          >
            {supportedPropFirms.map(firm => (
              <option key={firm.value} value={firm.label}>
                {firm.label}
              </option>
            ))}
          </select>
          
          {/* Indicador de depuração - remover antes de produção */}
          <div className="text-xs text-neutral-500 mt-1">
            Selecionado: {selectedFirm} | Valor no form: {formValues.firmName}
          </div>
        </div>
        
        {/* Tamanho da Conta */}
        <div>
          <label htmlFor="accountSize" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Tamanho da Conta
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              $
            </span>
            <input
              type="number"
              id="accountSize"
              name="accountSize"
              value={formValues.accountSize}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
              min="1000"
              step="1000"
              required
            />
          </div>
        </div>

        {/* Meta de Lucro */}
        <div>
          <div className="flex justify-between mb-1">
            <label htmlFor="profitTarget" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Meta de Lucro
            </label>
            <button
              type="button"
              onClick={toggleProfitTargetFormat}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Mostrar em {profitTargetAsPercentage ? 'valor ($)' : 'porcentagem (%)'}
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              {profitTargetAsPercentage ? '%' : '$'}
            </span>
            <input
              type="number"
              id="profitTarget"
              name="profitTarget"
              value={formValues.profitTarget}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
              min="0"
              step={profitTargetAsPercentage ? "0.1" : "100"}
              required
            />
          </div>
        </div>
        
        {/* Máximo Drawdown Diário */}
        <div>
          <label htmlFor="maxDailyDrawdown" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Máximo Drawdown Diário (%)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              %
            </span>
            <input
              type="number"
              id="maxDailyDrawdown"
              name="maxDailyDrawdown"
              value={formValues.maxDailyDrawdown}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* Máximo Drawdown Total */}
        <div>
          <label htmlFor="maxOverallDrawdown" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Máximo Drawdown Total (%)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              %
            </span>
            <input
              type="number"
              id="maxOverallDrawdown"
              name="maxOverallDrawdown"
              value={formValues.maxOverallDrawdown}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </div>
        </div>

        {/* Tipo de Drawdown */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Tipo de Drawdown
          </label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="drawdownTypeStatic"
                name="drawdownType"
                checked={formValues.drawdownType === 'static'}
                onChange={() => handleDrawdownTypeChange('static')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700"
              />
              <label htmlFor="drawdownTypeStatic" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                Estático
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="drawdownTypeTrailing"
                name="drawdownType"
                checked={formValues.drawdownType === 'trailing'}
                onChange={() => handleDrawdownTypeChange('trailing')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 dark:border-neutral-700"
              />
              <label htmlFor="drawdownTypeTrailing" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                Trailing
              </label>
            </div>
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {formValues.drawdownType === 'static' 
              ? 'Estático: O drawdown é calculado a partir do saldo inicial da conta.' 
              : 'Trailing: O drawdown é calculado a partir do saldo máximo atingido (high water mark).'}
          </p>
        </div>

        {/* Dias Mínimos de Trading */}
        <div>
          <label htmlFor="minTradingDays" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Dias Mínimos de Trading
          </label>
          <input
            type="number"
            id="minTradingDays"
            name="minTradingDays"
            value={formValues.minTradingDays}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
            min="0"
          />
        </div>

        {/* Regra de Consistência (%) - Opcional */}
        <div>
          <div className="flex justify-between mb-1">
            <label htmlFor="consistencyRulePercentage" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Regra de Consistência (%) - Opcional
            </label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 dark:text-neutral-400">
              %
            </span>
            <input
              type="number"
              id="consistencyRulePercentage"
              name="consistencyRulePercentage"
              value={formValues.consistencyRulePercentage || ''}
              onChange={handleInputChange}
              placeholder="Deixe em branco se não aplicável"
              className="w-full pl-8 pr-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        {/* Outras Regras - Campo de texto livre */}
        <div className="md:col-span-2">
          <label htmlFor="otherRules" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Outras Regras (opcional)
          </label>
          <textarea
            id="otherRules"
            name="otherRules"
            value={formValues.otherRules || ''}
            onChange={handleInputChange}
            placeholder="Ex: Horário de trading permitido, instrumentos específicos, etc."
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800 text-neutral-900 dark:text-white"
          />
        </div>
      </div>
      
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-md font-medium transition-colors"
        >
          Iniciar Desafio
        </button>
      </div>
    </form>
  );
};

export default ChallengeSetupForm; 