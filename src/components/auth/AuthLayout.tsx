import React from 'react';
import { Activity, TrendingUp, BarChart3, Target } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border border-white/20 rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TraderLog Pro</h1>
              <p className="text-primary-100 text-sm">Professional Trading Journal</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-12">
            <h2 className="text-3xl font-bold leading-tight">
              Transform Your Trading<br />
              <span className="text-primary-200">Performance</span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              Advanced analytics, AI-powered insights, and comprehensive trade tracking 
              to help you become a consistently profitable trader.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              { icon: BarChart3, title: 'Advanced Analytics', desc: 'Deep insights into your trading performance' },
              { icon: TrendingUp, title: 'AI-Powered Insights', desc: 'Smart recommendations based on your data' },
              { icon: Target, title: 'Risk Management', desc: 'Tools to optimize your risk-reward ratio' }
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-primary-100 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;