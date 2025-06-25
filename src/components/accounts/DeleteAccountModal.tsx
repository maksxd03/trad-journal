import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteAccountModalProps {
  onClose: () => void;
  onConfirm: () => void;
  accountName: string;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ onClose, onConfirm, accountName }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 w-full max-w-md">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
            <Trash2 className="w-5 h-5 mr-2 text-loss-500" />
            {t('delete')} {accountName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 bg-loss-100 dark:bg-loss-900/30 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-loss-600 dark:text-loss-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                {t('confirm_delete')}
              </h3>
            </div>
          </div>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Esta ação irá remover permanentemente a conta <strong>{accountName}</strong> e todos os dados associados a ela. Esta operação não pode ser desfeita.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-loss-600 text-white rounded-md hover:bg-loss-700 transition-colors"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal; 