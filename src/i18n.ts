import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Carrega traduções de um servidor/pasta pública
  .use(LanguageDetector) // Detecta o idioma do usuário
  .use(initReactI18next) // Passa a instância do i18n para o react-i18next
  .init({
    supportedLngs: ['pt', 'pt-BR', 'en', 'en-US'],
    fallbackLng: 'pt-BR', // Idioma padrão caso a detecção falhe
    debug: process.env.NODE_ENV === 'development', // Ativa logs no modo de desenvolvimento
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Caminho para os arquivos de tradução
    },
    react: {
      useSuspense: true, // Necessário para carregar traduções de forma assíncrona
    },
    // Mapeamento de idiomas para direcionar códigos genéricos para específicos
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    // Quando o navegador detectar 'pt', use as traduções de 'pt-BR'
    // Quando detectar 'en', use as traduções de 'en-US'
    languageResolver: (lng, ns) => {
      if (lng === 'pt') return 'pt-BR';
      if (lng === 'en') return 'en-US';
      return lng;
    }
  });

export default i18n; 