import React, { useState } from 'react';
import { X, TrendingUp, Target, BarChart3, Lightbulb, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const WelcomeMessage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Trader';
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 rounded-xl p-4 md:p-5 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border border-white/20 rounded-full"></div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              {t('dashboard.welcome_back', { name: getUserName() })}
            </h2>
            <p className="text-primary-100 mb-3 text-base">
              {t('dashboard.ready_to_analyze')}
            </p>
            <p className="text-primary-200 text-sm">
              {t('dashboard.journey_continues')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2 lg:mt-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <TrendingUp className="w-4 h-4 text-profit-300" />
                <div>
                  <div className="text-sm font-medium">{t('dashboard.performance')}</div>
                  <div className="text-xs text-primary-200">{t('dashboard.track_progress')}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Target className="w-4 h-4 text-secondary-300" />
                <div>
                  <div className="text-sm font-medium">{t('dashboard.goals')}</div>
                  <div className="text-xs text-primary-200">{t('dashboard.set_achieve')}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Lightbulb className="w-4 h-4 text-yellow-300" />
                <div>
                  <div className="text-sm font-medium">{t('dashboard.ai_insights')}</div>
                  <div className="text-xs text-primary-200">{t('dashboard.smart_recommendations')}</div>
                </div>
              </div>
            </div>

            <button className="flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors font-medium text-sm shadow-sm">
              <span>{t('dashboard.quick_start')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;