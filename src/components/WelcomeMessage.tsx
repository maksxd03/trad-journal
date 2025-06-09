import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, TrendingUp, Target, Calendar } from 'lucide-react';

const WelcomeMessage: React.FC = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Trader';
  };

  return (
    <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-4 left-8 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 border border-white/20 rounded-full"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-primary-100">
                {getGreeting()}
              </span>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {getUserName()}! 👋
            </h1>
            
            <p className="text-primary-100 mb-4 max-w-2xl">
              Ready to analyze your trading performance? Your dashboard is updated with the latest data 
              and AI-powered insights to help you make better trading decisions.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Performance Tracking</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">AI Insights</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Daily Journal</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;