import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trade } from '../types/trade';

export const useTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedTrades: Trade[] = data.map(trade => ({
        id: trade.id,
        date: trade.date,
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entry_price,
        exitPrice: trade.exit_price,
        quantity: trade.quantity,
        pnl: trade.pnl,
        pnlPercentage: trade.pnl_percentage,
        setup: trade.setup,
        notes: trade.notes || '',
        tags: trade.tags || [],
        duration: trade.duration,
        commission: trade.commission,
        riskRewardRatio: trade.risk_reward_ratio
      }));

      setTrades(formattedTrades);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const addTrade = async (tradeData: Omit<Trade, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          date: tradeData.date,
          symbol: tradeData.symbol,
          type: tradeData.type,
          entry_price: tradeData.entryPrice,
          exit_price: tradeData.exitPrice,
          quantity: tradeData.quantity,
          pnl: tradeData.pnl,
          pnl_percentage: tradeData.pnlPercentage,
          setup: tradeData.setup,
          notes: tradeData.notes,
          tags: tradeData.tags,
          duration: tradeData.duration,
          commission: tradeData.commission,
          risk_reward_ratio: tradeData.riskRewardRatio
        })
        .select()
        .single();

      if (error) throw error;

      const newTrade: Trade = {
        id: data.id,
        date: data.date,
        symbol: data.symbol,
        type: data.type,
        entryPrice: data.entry_price,
        exitPrice: data.exit_price,
        quantity: data.quantity,
        pnl: data.pnl,
        pnlPercentage: data.pnl_percentage,
        setup: data.setup,
        notes: data.notes || '',
        tags: data.tags || [],
        duration: data.duration,
        commission: data.commission,
        riskRewardRatio: data.risk_reward_ratio
      };

      setTrades(prev => [newTrade, ...prev]);
      return newTrade;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add trade');
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .update({
          date: updates.date,
          symbol: updates.symbol,
          type: updates.type,
          entry_price: updates.entryPrice,
          exit_price: updates.exitPrice,
          quantity: updates.quantity,
          pnl: updates.pnl,
          pnl_percentage: updates.pnlPercentage,
          setup: updates.setup,
          notes: updates.notes,
          tags: updates.tags,
          duration: updates.duration,
          commission: updates.commission,
          risk_reward_ratio: updates.riskRewardRatio,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTrade: Trade = {
        id: data.id,
        date: data.date,
        symbol: data.symbol,
        type: data.type,
        entryPrice: data.entry_price,
        exitPrice: data.exit_price,
        quantity: data.quantity,
        pnl: data.pnl,
        pnlPercentage: data.pnl_percentage,
        setup: data.setup,
        notes: data.notes || '',
        tags: data.tags || [],
        duration: data.duration,
        commission: data.commission,
        riskRewardRatio: data.risk_reward_ratio
      };

      setTrades(prev => prev.map(trade => trade.id === id ? updatedTrade : trade));
      return updatedTrade;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update trade');
    }
  };

  const deleteTrade = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTrades(prev => prev.filter(trade => trade.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete trade');
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [user]);

  return {
    trades,
    loading,
    error,
    addTrade,
    updateTrade,
    deleteTrade,
    refetch: fetchTrades
  };
};