import React, { useMemo } from 'react';
import { useAccounts } from '../../context/AccountsContext';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AccountSelector: React.FC = () => {
  const { t } = useTranslation();
  const { accounts, selectedAccountId, selectAccount } = useAccounts();
  
  // Ordenar contas por nome para melhor usabilidade
  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts]);

  return (
    <div className="relative">
      <div className="flex items-center">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mr-2">
          {t('account')}:
        </span>
        <div className="relative">
          <select
            value={selectedAccountId || ''}
            onChange={(e) => selectAccount(e.target.value === '' ? null : e.target.value)}
            className="appearance-none bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md py-1 pl-3 pr-8 text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{t('all_accounts')}</option>
            {sortedAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSelector; 