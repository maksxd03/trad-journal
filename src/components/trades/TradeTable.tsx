import React, { useState, useRef } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, MessageSquare, Tag, MoreVertical, Edit, Eye, Trash2, X, Loader2, Image } from 'lucide-react';
import { Trade } from '../../types/trade';
import { format } from 'date-fns';
import { useFloating, offset, flip, shift, autoUpdate, FloatingPortal, useInteractions, useClick, useDismiss, useRole, arrow, FloatingArrow } from '@floating-ui/react';

interface TradeTableProps {
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
  onTagClick?: (tag: string) => void;
  isLoading?: boolean;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (trade: Trade) => void;
}

const TradeTable: React.FC<TradeTableProps> = ({ trades, onTradeClick, onTagClick, isLoading = false, onEditTrade, onDeleteTrade }) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const arrowRef = useRef(null);

  // Configuração do Floating UI
  const { refs, floatingStyles, context } = useFloating({
    open: !!actionMenuOpen,
    onOpenChange: (open) => {
      if (!open) setActionMenuOpen(null);
    },
    middleware: [
      offset(8),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef })
    ],
    whileElementsMounted: autoUpdate
  });

  // Interações do Floating UI
  const click = useClick(context);
  const dismiss = useDismiss(context, {
    outsidePress: true,
    referencePress: false
  });
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleActionClick = (e: React.MouseEvent, tradeId: string) => {
    e.stopPropagation();
    if (actionMenuOpen === tradeId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(tradeId);
      
      if (refs.setReference && e.currentTarget) {
        refs.setReference(e.currentTarget);
      }
    }
  };

  const handleScreenshotClick = (e: React.MouseEvent, trade: Trade) => {
    e.stopPropagation();
    console.log('🖼️ Visualizando screenshot do trade:', trade.id);
    console.log('🔗 URL do screenshot:', trade.screenshotUrl);
    
    if (!trade.screenshotUrl) {
      console.error('❌ Este trade não possui screenshot definido!');
      alert('Este trade não possui um screenshot associado.');
      return;
    }
    
    // Verificar se a URL é válida
    try {
      new URL(trade.screenshotUrl);
      console.log('✅ URL do screenshot válida');
    } catch (e) {
      console.error('❌ URL do screenshot inválida:', trade.screenshotUrl);
      alert('A URL do screenshot parece ser inválida. Por favor, verifique o console para mais detalhes.');
      return;
    }
    
    setSelectedTrade(trade);
    setShowScreenshot(true);
    setActionMenuOpen(null);
  };

  const handleEditClick = (e: React.MouseEvent, trade: Trade) => {
    e.stopPropagation();
    console.log(`✅ Função handleEditClick chamada para o trade ID: ${trade.id}`, trade);
    
    // Fechar o menu de ações
    setActionMenuOpen(null);
    
    // Se o componente pai forneceu um manipulador de edição, use-o
    if (onEditTrade) {
      onEditTrade(trade);
      return;
    }
    
    // Caso contrário, use a lógica de edição interna
    setTradeToEdit(trade);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, trade: Trade) => {
    e.stopPropagation();
    console.log('Delete trade', trade.id);
    setActionMenuOpen(null);
    
    // Chamar o callback onDeleteTrade se fornecido
    if (onDeleteTrade) {
      onDeleteTrade(trade);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  // Empty state
  if (trades.length === 0 && !isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
        <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
          No trades found
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Try adjusting your filters or add some trades to get started
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-12 text-center">
        <Loader2 className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
          Loading trades...
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Please wait while we fetch your trading data
        </p>
      </div>
    );
  }

  // Encontre o trade atual para o qual o menu está aberto
  const currentTrade = trades.find(trade => trade.id === actionMenuOpen);

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Date & Symbol
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Type & Setup
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Exit Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  R:R Ratio
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {trades.map((trade) => {
                const isProfitable = trade.pnl > 0;
                
                return (
                  <tr 
                    key={trade.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    onClick={() => onTradeClick?.(trade)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {trade.symbol}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {format(new Date(trade.date), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1 rounded ${
                          trade.type === 'long' 
                            ? 'bg-profit-100 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400'
                            : 'bg-loss-100 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400'
                        }`}>
                          {trade.type === 'long' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-white">
                            {trade.type.toUpperCase()}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {trade.setup}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {formatCurrency(trade.entryPrice)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {formatCurrency(trade.exitPrice)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {trade.quantity.toLocaleString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className={`text-sm font-medium ${
                          isProfitable 
                            ? 'text-profit-600 dark:text-profit-400' 
                            : 'text-loss-600 dark:text-loss-400'
                        }`}>
                          {formatCurrency(trade.pnl)}
                        </div>
                        <div className={`text-sm ${
                          isProfitable 
                            ? 'text-profit-600 dark:text-profit-400' 
                            : 'text-loss-600 dark:text-loss-400'
                        }`}>
                          {formatPercentage(trade.pnlPercentage)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {trade.riskRewardRatio.toFixed(2)}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {trade.tags.slice(0, 2).map(tag => (
                          <button
                            key={tag}
                            onClick={(e) => handleTagClick(e, tag)}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-neutral-100 hover:bg-primary-100 dark:bg-neutral-800 dark:hover:bg-primary-900/20 text-neutral-600 dark:text-neutral-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </button>
                        ))}
                        {trade.tags.length > 2 && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            +{trade.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative flex items-center justify-end space-x-2">
                        {trade.notes && (
                          <MessageSquare className="w-4 h-4 text-neutral-400" />
                        )}
                        {trade.screenshotUrl && (
                          <Image 
                            className="w-4 h-4 text-primary-400 cursor-pointer" 
                            onClick={(e) => handleScreenshotClick(e, trade)}
                            title="Ver Screenshot"
                          />
                        )}
                        <button
                          onClick={(e) => handleActionClick(e, trade.id)}
                          ref={actionMenuOpen === trade.id ? refs.setReference : null}
                          {...(actionMenuOpen === trade.id ? getReferenceProps() : {})}
                          className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Menu de Ações renderizado através de Portal */}
      {actionMenuOpen && currentTrade && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg z-[999] overflow-hidden"
          >
            <FloatingArrow ref={arrowRef} context={context} fill={document.documentElement.classList.contains('dark') ? '#262626' : '#ffffff'} stroke={document.documentElement.classList.contains('dark') ? '#404040' : '#e5e5e5'} />
            <button
              onClick={(e) => handleEditClick(e, currentTrade)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center space-x-2"
            >
              <Edit className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>Edit Trade</span>
            </button>
            {currentTrade.screenshotUrl && (
              <button
                onClick={(e) => handleScreenshotClick(e, currentTrade)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center space-x-2"
              >
                <Eye className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span>View Screenshot</span>
              </button>
            )}
            <button
              onClick={(e) => handleDeleteClick(e, currentTrade)}
              className="w-full text-left px-4 py-2.5 text-sm text-loss-600 hover:bg-loss-50 dark:hover:bg-loss-900/10 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4 text-loss-600" />
              <span>Delete Trade</span>
            </button>
          </div>
        </FloatingPortal>
      )}

      {/* Screenshot Modal */}
      {showScreenshot && selectedTrade && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                {selectedTrade.symbol} - {format(new Date(selectedTrade.date), 'MMMM dd, yyyy')}
              </h3>
              <button
                onClick={() => setShowScreenshot(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {selectedTrade.screenshotUrl ? (
                <div className="overflow-hidden rounded-md">
                  <img 
                    src={selectedTrade.screenshotUrl} 
                    alt={`Screenshot of ${selectedTrade.symbol} trade`}
                    className="w-full h-auto object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Eye className="w-12 h-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-700 dark:text-neutral-300">
                    No screenshot available for this trade.
                  </p>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Type:</span>
                    <span className={`font-medium ${
                      selectedTrade.type === 'long'
                        ? 'text-profit-600 dark:text-profit-400'
                        : 'text-loss-600 dark:text-loss-400'
                    }`}>
                      {selectedTrade.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Setup:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedTrade.setup}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Entry Price:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(selectedTrade.entryPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Exit Price:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(selectedTrade.exitPrice)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">P&L:</span>
                    <span className={`font-medium ${
                      selectedTrade.pnl > 0
                        ? 'text-profit-600 dark:text-profit-400'
                        : 'text-loss-600 dark:text-loss-400'
                    }`}>
                      {formatCurrency(selectedTrade.pnl)} ({formatPercentage(selectedTrade.pnlPercentage)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Quantity:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedTrade.quantity.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">R:R Ratio:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedTrade.riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">Duration:</span>
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedTrade.duration}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedTrade.notes && (
                <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Notes:</div>
                  <p className="text-neutral-800 dark:text-neutral-200">
                    {selectedTrade.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && tradeToEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Edit Trade: {tradeToEdit.symbol}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Formulário de edição - Implementação básica */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Symbol
                    </label>
                    <input 
                      type="text" 
                      defaultValue={tradeToEdit.symbol}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Type
                    </label>
                    <select 
                      defaultValue={tradeToEdit.type}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    >
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Setup
                    </label>
                    <input 
                      type="text" 
                      defaultValue={tradeToEdit.setup}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Date
                    </label>
                    <input 
                      type="date" 
                      defaultValue={new Date(tradeToEdit.date).toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Entry Price
                    </label>
                    <input 
                      type="number" 
                      defaultValue={tradeToEdit.entryPrice}
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Exit Price
                    </label>
                    <input 
                      type="number" 
                      defaultValue={tradeToEdit.exitPrice}
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Quantity
                    </label>
                    <input 
                      type="number" 
                      defaultValue={tradeToEdit.quantity}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Risk/Reward Ratio
                    </label>
                    <input 
                      type="number" 
                      defaultValue={tradeToEdit.riskRewardRatio}
                      step="0.01"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Tags (comma separated)
                </label>
                <input 
                  type="text" 
                  defaultValue={tradeToEdit.tags.join(', ')}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Notes
                </label>
                <textarea 
                  defaultValue={tradeToEdit.notes || ''}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md dark:bg-neutral-800"
                />
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Save changes clicked for trade:', tradeToEdit.id);
                    // Aqui implementaríamos a lógica para salvar as alterações
                    // Por enquanto, apenas fechamos o modal
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TradeTable;