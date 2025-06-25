import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChallengesProvider } from './context/ChallengesContext';
import { AccountsProvider } from './context/AccountsContext';
import { TradesProvider } from './contexts/TradesContext';
import AuthPage from './components/auth/AuthPage';
import LoadingSpinner from './components/LoadingSpinner';
import MainApp from './components/MainApp';
import HomePage from './pages/HomePage';
import AIInsightsPage from './pages/AIInsightsPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Simple router to handle our routes
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  // Se o usuário está autenticado, renderize o MainApp que tem sua própria lógica de roteamento
  return <MainApp />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChallengesProvider>
          <AccountsProvider>
            <TradesProvider>
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/*" element={<AppContent />} />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '10px',
                  },
                }}
              />
            </TradesProvider>
          </AccountsProvider>
        </ChallengesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;