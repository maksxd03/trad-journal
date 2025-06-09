import React, { useState } from 'react';
import { X, TrendingUp, Target, BarChart3, Lightbulb, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const WelcomeMessage: React.FC = () => {
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
    <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 rounded-xl p-6 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-12 h-12 border border-white/20 rounded-full"></div>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {getUserName()}! 👋
            </h2>
            <p className="text-primary-100 mb-4 text-lg">
              Ready to analyze your trading performance and discover new insights?
            </p>
            <p className="text-primary-200 text-sm">
              Your trading journey continues here. Track your progress, learn from your trades, and optimize your strategy with AI-powered insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <TrendingUp className="w-5 h-5 text-profit-300" />
                <div>
                  <div className="text-sm font-medium">Performance</div>
                  <div className="text-xs text-primary-200">Track your progress</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Target className="w-5 h-5 text-secondary-300" />
                <div>
                  <div className="text-sm font-medium">Goals</div>
                  <div className="text-xs text-primary-200">Set & achieve targets</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                <Lightbulb className="w-5 h-5 text-yellow-300" />
                <div>
                  <div className="text-sm font-medium">AI Insights</div>
                  <div className="text-xs text-primary-200">Smart recommendations</div>
                </div>
              </div>
            </div>

            <button className="flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium shadow-lg">
              <span>Quick Start Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeMessage;