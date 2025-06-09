export interface Database {
  public: {
    Tables: {
      trades: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          symbol: string;
          type: 'long' | 'short';
          entry_price: number;
          exit_price: number;
          quantity: number;
          pnl: number;
          pnl_percentage: number;
          setup: string;
          notes: string | null;
          tags: string[];
          duration: string;
          commission: number;
          risk_reward_ratio: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          symbol: string;
          type: 'long' | 'short';
          entry_price: number;
          exit_price: number;
          quantity: number;
          pnl: number;
          pnl_percentage: number;
          setup: string;
          notes?: string | null;
          tags?: string[];
          duration: string;
          commission: number;
          risk_reward_ratio: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          symbol?: string;
          type?: 'long' | 'short';
          entry_price?: number;
          exit_price?: number;
          quantity?: number;
          pnl?: number;
          pnl_percentage?: number;
          setup?: string;
          notes?: string | null;
          tags?: string[];
          duration?: string;
          commission?: number;
          risk_reward_ratio?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string | null;
          currency: string;
          initial_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          currency?: string;
          initial_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          currency?: string;
          initial_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}