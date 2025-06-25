-- Quick fix for the trades table to allow creating new trades

-- 1. Add account_id column if it doesn't exist
ALTER TABLE trades ADD COLUMN IF NOT EXISTS account_id UUID;

-- 2. Drop the problematic foreign key constraint if it exists
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_challenge_id_fkey;

-- 3. Make challenge_id nullable
ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;

-- That's it! This should allow you to create trades without the foreign key constraint errors.
-- You can run the more comprehensive fix_trades_table.sql script later to set up proper constraints. 