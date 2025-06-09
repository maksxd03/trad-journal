import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Globe, 
  DollarSign, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface UserProfile {
  full_name: string;
  timezone: string;
  currency: string;
  initial_balance: number;
}

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    timezone: '',
    currency: 'USD',
    initial_balance: 10000
  });

  const [notifications, setNotifications] = useState({
    email_alerts: true,
    trade_reminders: true,
    performance_reports: false,
    ai_insights: true
  });

  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    show_current: false,
    show_new: false,
    show_confirm: false
  });

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          timezone: data.timezone || '',
          currency: data.currency || 'USD',
          initial_balance: data.initial_balance || 10000
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          timezone: profile.timezone,
          currency: profile.currency,
          initial_balance: profile.initial_balance,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (security.new_password !== security.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: security.new_password
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setSecurity({
        current_password: '',
        new_password: '',
        confirm_password: '',
        show_current: false,
        show_new: false,
        show_confirm: false
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implementation for data export
    setMessage({ type: 'success', text: 'Data export started. You will receive an email when ready.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implementation for account deletion
      setMessage({ type: 'error', text: 'Account deletion is not available yet. Please contact support.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Download }
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF'];
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-profit-50 dark:bg-profit-900/30 border-profit-200 dark:border-profit-800'
            : 'bg-loss-50 dark:bg-loss-900/30 border-loss-200 dark:border-loss-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-profit-600 dark:text-profit-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-loss-600 dark:text-loss-400" />
            )}
            <span className={`text-sm font-medium ${
              message.type === 'success'
                ? 'text-profit-700 dark:text-profit-300'
                : 'text-loss-700 dark:text-loss-300'
            }`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Profile Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Select timezone</option>
                        {timezones.map(tz => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={profile.currency}
                        onChange={(e) => setProfile(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {currencies.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Initial Balance
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                          type="number"
                          value={profile.initial_balance}
                          onChange={(e) => setProfile(prev => ({ ...prev, initial_balance: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-10 pr-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="10000"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={updateProfile}
                    disabled={loading}
                    className="mt-4 flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Appearance & Preferences
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-white">Dark Mode</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Switch between light and dark themes
                        </p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDark ? 'bg-primary-500' : 'bg-neutral-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDark ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Security Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={security.show_new ? 'text' : 'password'}
                          value={security.new_password}
                          onChange={(e) => setSecurity(prev => ({ ...prev, new_password: e.target.value }))}
                          className="w-full pr-10 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setSecurity(prev => ({ ...prev, show_new: !prev.show_new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                        >
                          {security.show_new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={security.show_confirm ? 'text' : 'password'}
                          value={security.confirm_password}
                          onChange={(e) => setSecurity(prev => ({ ...prev, confirm_password: e.target.value }))}
                          className="w-full pr-10 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setSecurity(prev => ({ ...prev, show_confirm: !prev.show_confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                        >
                          {security.show_confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={updatePassword}
                      disabled={loading || !security.new_password || !security.confirm_password}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Privacy Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Data & Privacy
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Export Data</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        Download all your trading data in CSV format
                      </p>
                      <button
                        onClick={exportData}
                        className="flex items-center space-x-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                      </button>
                    </div>

                    <div className="p-4 border border-loss-200 dark:border-loss-800 rounded-lg bg-loss-50 dark:bg-loss-900/30">
                      <h3 className="font-medium text-loss-700 dark:text-loss-300 mb-2">Delete Account</h3>
                      <p className="text-sm text-loss-600 dark:text-loss-400 mb-3">
                        Permanently delete your account and all associated data
                      </p>
                      <button
                        onClick={deleteAccount}
                        className="flex items-center space-x-2 px-4 py-2 bg-loss-500 text-white rounded-lg hover:bg-loss-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;