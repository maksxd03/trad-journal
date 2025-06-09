/*
  # Create trades table

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `symbol` (text)
      - `type` (enum: long/short)
      - `entry_price` (decimal)
      - `exit_price` (decimal)
      - `quantity` (integer)
      - `pnl` (decimal)
      - `pnl_percentage` (decimal)
      - `setup` (text)
      - `notes` (text, nullable)
      - `tags` (text array)
      - `duration` (text)
      - `commission` (decimal)
      - `risk_reward_ratio` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `trades` table
    - Add policy for users to manage their own trades
*/

CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  symbol text NOT NULL,
  type text CHECK (type IN ('long', 'short')) NOT NULL,
  entry_price decimal(10,4) NOT NULL,
  exit_price decimal(10,4) NOT NULL,
  quantity integer NOT NULL,
  pnl decimal(10,2) NOT NULL,
  pnl_percentage decimal(8,4) NOT NULL,
  setup text NOT NULL,
  notes text,
  tags text[] DEFAULT '{}',
  duration text NOT NULL,
  commission decimal(8,2) DEFAULT 0,
  risk_reward_ratio decimal(8,4) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own trades"
  ON trades
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS trades_user_id_date_idx ON trades(user_id, date DESC);
CREATE INDEX IF NOT EXISTS trades_user_id_symbol_idx ON trades(user_id, symbol);