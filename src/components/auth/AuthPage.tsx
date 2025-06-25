import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password';

interface AuthPageProps {
  redirectTo?: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ redirectTo }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  const renderForm = () => {
    switch (mode) {
      case 'signup':
        return <SignUpForm onToggleMode={() => setMode('login')} redirectTo={redirectTo} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setMode('login')} />;
      default:
        return (
          <LoginForm
            onToggleMode={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot-password')}
            redirectTo={redirectTo}
          />
        );
    }
  };

  return (
    <AuthLayout>
      {renderForm()}
      <div className="text-center mt-6 space-y-2">
        <a 
          href="/home" 
          className="block text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm transition-colors"
        >
          Voltar para a página inicial
        </a>
        <a 
          href="/ai-insights" 
          className="block text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm transition-colors"
        >
          Acessar AI Insights
        </a>
      </div>
    </AuthLayout>
  );
};

export default AuthPage;