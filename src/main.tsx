import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n'; // Importando o arquivo de configuração
import LoadingSpinner from './components/LoadingSpinner'; // Importando o componente de loading

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
