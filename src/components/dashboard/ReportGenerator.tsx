import React, { useState } from 'react';
import { X, FileText, Download, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccounts } from '../../context/AccountsContext';

interface ReportOptions {
  reportType: 'performance' | 'transactions' | 'summary';
  format: 'pdf' | 'excel' | 'csv';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  accountId: string | null;
  includeCharts: boolean;
  includeNotes: boolean;
}

interface ReportGeneratorProps {
  onClose: () => void;
  initialOptions?: Partial<ReportOptions>;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
  onClose,
  initialOptions = {}
}) => {
  const { t } = useTranslation();
  const { accounts } = useAccounts();
  
  const [options, setOptions] = useState<ReportOptions>({
    reportType: initialOptions.reportType || 'performance',
    format: initialOptions.format || 'pdf',
    dateRange: initialOptions.dateRange || {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    accountId: initialOptions.accountId || null,
    includeCharts: initialOptions.includeCharts !== undefined ? initialOptions.includeCharts : true,
    includeNotes: initialOptions.includeNotes !== undefined ? initialOptions.includeNotes : true
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulação de geração de relatório
    setTimeout(() => {
      setIsGenerating(false);
      // Aqui seria implementada a lógica real de geração e download do relatório
      console.log('Generating report with options:', options);
      
      // Simular download do arquivo
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', `trading-report-${new Date().toISOString().slice(0, 10)}.${options.format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onClose();
    }, 2000);
  };
  
  const reportTypes = [
    { id: 'performance', label: t('reports.types.performance') },
    { id: 'transactions', label: t('reports.types.transactions') },
    { id: 'summary', label: t('reports.types.summary') }
  ];
  
  const formats = [
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'excel', label: 'Excel', icon: '📊' },
    { id: 'csv', label: 'CSV', icon: '📋' }
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-lg">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {t('dashboard.buttons.generate_report')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Report Type */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('reports.type')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {reportTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setOptions(prev => ({ ...prev, reportType: type.id as any }))}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                    options.reportType === type.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Format */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('reports.format')}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {formats.map(format => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => setOptions(prev => ({ ...prev, format: format.id as any }))}
                  className={`px-3 py-2 text-sm border rounded-lg transition-colors flex items-center justify-center ${
                    options.format === format.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="mr-2">{format.icon}</span>
                  {format.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('reports.date_range')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {t('filters.start_date')}
                </label>
                <input
                  type="date"
                  value={options.dateRange.startDate}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, startDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  {t('filters.end_date')}
                </label>
                <input
                  type="date"
                  value={options.dateRange.endDate}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, endDate: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* Account */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('account')}
            </h3>
            <select
              value={options.accountId || ''}
              onChange={(e) => setOptions(prev => ({ ...prev, accountId: e.target.value || null }))}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">{t('all_accounts')}</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
          </div>
          
          {/* Options */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('reports.options')}
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeCharts}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-500 focus:ring-primary-500 dark:bg-neutral-800"
                />
                <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {t('reports.include_charts')}
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeNotes}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-500 focus:ring-primary-500 dark:bg-neutral-800"
                />
                <span className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {t('reports.include_notes')}
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('reports.generating')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {t('reports.generate')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator; 