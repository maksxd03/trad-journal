import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Tag, DollarSign, TrendingUp, TrendingDown, Calendar, Clock, Image, Upload } from 'lucide-react';
import { Trade } from '../../types/trade';
import { useChallenges } from '../../context/ChallengesContext';
import { useAccounts } from '../../context/AccountsContext';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id'>) => void;
  onCancel: () => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onCancel }) => {
  const { challenges } = useChallenges();
  const { accounts, syncWithDatabase, selectedAccountId } = useAccounts();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    symbol: '',
    type: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    setup: '',
    notes: '',
    tags: [] as string[],
    commission: '2.50',
    challengeId: '',
    accountId: selectedAccountId || ''
  });
  
  // Efeito para sincronizar contas ao abrir o formulário
  useEffect(() => {
    const loadData = async () => {
      try {
        await syncWithDatabase();
        console.log('✅ TradeForm: Contas sincronizadas com sucesso');
      } catch (error) {
        console.error('❌ TradeForm: Falha ao sincronizar contas', error);
      }
    };
    
    loadData();
  }, [syncWithDatabase]);
  
  // Se o selectedAccountId mudar após o componente ser montado, atualizar o formulário
  useEffect(() => {
    if (selectedAccountId) {
      setFormData(prev => ({
        ...prev,
        accountId: selectedAccountId
      }));
    }
  }, [selectedAccountId]);
  
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newTag, setNewTag] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = parseFloat(formData.exitPrice);
    const quantity = parseInt(formData.quantity);
    const commission = parseFloat(formData.commission);
    
    const pnl = formData.type === 'long' 
      ? (exitPrice - entryPrice) * quantity - commission
      : (entryPrice - exitPrice) * quantity - commission;
    
    const pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
    const riskRewardRatio = Math.abs(pnl / (entryPrice * quantity * 0.02)); // Assuming 2% risk

    const trade: Omit<Trade, 'id'> = {
      date: formData.date,
      symbol: formData.symbol.toUpperCase(),
      type: formData.type,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      pnlPercentage: formData.type === 'long' ? pnlPercentage : -pnlPercentage,
      setup: formData.setup,
      notes: formData.notes,
      tags: formData.tags,
      duration: '1h 30m', // Placeholder
      commission,
      riskRewardRatio,
      challengeId: formData.challengeId || undefined,
      accountId: formData.accountId || undefined,
      screenshot: screenshot // Pass the screenshot file to the onSubmit handler
    };

    onSubmit(trade);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const setupOptions = [
    'Breakout', 'Pullback', 'Reversal', 'Gap Fill', 'Momentum', 
    'Support/Resistance', 'Flag', 'Triangle', 'Channel', 'Other'
  ];

  // Obter todas as contas e desafios, sem filtrar pelo status
  const allAccounts = accounts;
  
  // Para compatibilidade com código legado, converter contas do tipo prop_firm_challenge para desafios
  const propFirmAccounts = accounts.filter(account => account.type === 'prop_firm_challenge');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setScreenshot(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Add New Trade
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Symbol and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Symbol
              </label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                placeholder="AAPL, TSLA, SPY..."
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Position Type
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'long' }))}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border transition-colors ${
                    formData.type === 'long'
                      ? 'bg-profit-500 text-white border-profit-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Long
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'short' }))}
                  className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg border transition-colors ${
                    formData.type === 'short'
                      ? 'bg-loss-500 text-white border-loss-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Short
                </button>
              </div>
            </div>
          </div>

          {/* Prices and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Entry Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.entryPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Exit Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.exitPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, exitPrice: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Setup */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Setup/Strategy
            </label>
            <select
              value={formData.setup}
              onChange={(e) => setFormData(prev => ({ ...prev, setup: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a setup...</option>
              {setupOptions.map(setup => (
                <option key={setup} value={setup}>{setup}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Notes & Lessons
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Trade analysis, lessons learned, market conditions..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Image className="w-4 h-4 inline mr-2" />
              Screenshot do Gráfico (Opcional)
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="relative w-full">
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeScreenshot();
                    }}
                    className="absolute top-2 right-2 bg-white dark:bg-neutral-800 rounded-full p-1 shadow-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  </button>
                  <img 
                    src={previewUrl} 
                    alt="Screenshot preview" 
                    className="w-full h-48 object-contain rounded-lg" 
                  />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                    {screenshot?.name} ({Math.round(screenshot?.size / 1024)}KB)
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-neutral-400 mb-2" />
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Arraste e solte uma imagem ou clique para selecionar
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    PNG, JPG ou GIF (max. 5MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Commission and Account/Challenge Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Commission
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Account Selection Dropdown */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Associar à Conta
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData(prev => ({ ...prev, accountId: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Nenhuma (Trade Pessoal)</option>
                {allAccounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.broker}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Challenge Selection */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Associar ao Desafio (Legado)
              </label>
              <select
                value={formData.challengeId}
                onChange={(e) => setFormData(prev => ({ ...prev, challengeId: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Nenhum (Conta Pessoal)</option>
                {propFirmAccounts.length > 0 ? (
                  propFirmAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.broker} {account.rules?.accountSize ? `$${account.rules.accountSize}` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Nenhum desafio disponível</option>
                )}
              </select>
              {propFirmAccounts.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  Não há desafios disponíveis. Crie um desafio antes de associar trades.
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Add Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;