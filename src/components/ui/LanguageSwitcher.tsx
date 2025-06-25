import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('pt-BR')}
        className={`px-2 py-1 rounded transition-colors ${i18n.language.startsWith('pt') 
          ? 'font-bold text-primary-500 dark:text-primary-400' 
          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
      >
        PT
      </button>
      <span className="text-neutral-400">|</span>
      <button
        onClick={() => changeLanguage('en-US')}
        className={`px-2 py-1 rounded transition-colors ${i18n.language.startsWith('en') 
          ? 'font-bold text-primary-500 dark:text-primary-400' 
          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'}`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher; 