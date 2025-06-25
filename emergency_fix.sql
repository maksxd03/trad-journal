-- EMERGENCY FIX: Drop the foreign key constraint that's causing issues
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_challenge_id_fkey;

-- Make challenge_id nullable (if it's not already)
ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;

-- Add account_id column if it doesn't exist
ALTER TABLE trades ADD COLUMN IF NOT EXISTS account_id UUID;

-- IMPORTANT: After running this script, you should be able to create trades.
-- However, this is just a temporary fix. For a proper solution, you should:
-- 1. Create the challenges table
-- 2. Add proper foreign key constraints
-- 3. Run the full fix_trades_table.sql script 