-- Add account_id column to trades table if it doesn't exist
DO $$
BEGIN
    -- Check if account_id column exists in trades table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'trades' AND column_name = 'account_id') THEN
        -- Add account_id column
        ALTER TABLE trades ADD COLUMN account_id UUID;
        
        -- Add index for better performance
        CREATE INDEX idx_trades_account_id ON trades(account_id);
        
        -- Check if accounts table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
            -- Add foreign key constraint if accounts table exists
            ALTER TABLE trades 
            ADD CONSTRAINT fk_trades_account_id 
            FOREIGN KEY (account_id) 
            REFERENCES accounts(id) 
            ON DELETE SET NULL;
            
            RAISE NOTICE 'Added account_id column and foreign key constraint to trades table';
        ELSE
            RAISE NOTICE 'Added account_id column to trades table, but accounts table does not exist. Foreign key constraint not added.';
        END IF;
    ELSE
        RAISE NOTICE 'account_id column already exists in trades table';
    END IF;
    
    -- Fix the challenge_id foreign key constraint
    -- First, check if the constraint exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
              WHERE constraint_name = 'trades_challenge_id_fkey') THEN
        -- Drop the existing constraint
        ALTER TABLE trades DROP CONSTRAINT trades_challenge_id_fkey;
        RAISE NOTICE 'Dropped existing challenge_id foreign key constraint';
    END IF;
    
    -- Make challenge_id nullable if it's not already
    ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;
    
    -- Check if challenges table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'challenges') THEN
        -- Add the constraint back with ON DELETE SET NULL
        ALTER TABLE trades 
        ADD CONSTRAINT trades_challenge_id_fkey 
        FOREIGN KEY (challenge_id) 
        REFERENCES challenges(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added updated challenge_id foreign key constraint with ON DELETE SET NULL';
    ELSE
        RAISE NOTICE 'challenges table does not exist. Foreign key constraint not added.';
    END IF;
    
END $$; 