import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Zap, CheckCircle } from 'lucide-react';

interface AIInsightsProps {
  insights: Array<{
    type: 'pattern' | 'alert' | 'suggestion' | 'benchmark';
    title: string;
    description: string;
    confidence: number;
    action?: string;
  }>;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return TrendingUp;
      case 'alert': return AlertTriangle;
      case 'suggestion': return Target;
      case 'benchmark': return CheckCircle;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800';
      case 'alert': return 'bg-loss-50 dark:bg-loss-900/30 text-loss-600 dark:text-loss-400 border-loss-200 dark:border-loss-800';
      case 'suggestion': return 'bg-secondary-50 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800';
      case 'benchmark': return 'bg-profit-50 dark:bg-profit-900/30 text-profit-600 dark:text-profit-400 border-profit-200 dark:border-profit-800';
      default: return 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-profit-600 dark:text-profit-400';
    if (confidence >= 60) return 'text-secondary-600 dark:text-secondary-400';
    return 'text-loss-600 dark:text-loss-400';
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            AI Insights
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Powered by machine learning analysis
          </p>
        </div>
        <div className="ml-auto">
          <div className="flex items-center space-x-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">AI</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 mb-3">{insight.description}</p>
                  {insight.action && (
                    <button className="text-xs font-medium px-3 py-1 bg-white dark:bg-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors">
                      {insight.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            AI Learning Status
          </span>
        </div>
        <div className="text-xs text-purple-600 dark:text-purple-400">
          Analyzing 156 trades • Pattern recognition: 94% • Next update in 2 hours
        </div>
      </div>
    </div>
  );
};

export default AIInsights;