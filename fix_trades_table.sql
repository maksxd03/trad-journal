-- Fix the trades table schema issues

-- 1. First check if the account_id column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trades' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE trades ADD COLUMN account_id UUID;
    RAISE NOTICE 'Added account_id column to trades table';
  ELSE
    RAISE NOTICE 'account_id column already exists in trades table';
  END IF;
END $$;

-- 2. Fix the challenge_id foreign key constraint
DO $$
BEGIN
  -- First check if the constraint exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trades_challenge_id_fkey'
  ) THEN
    -- Drop the existing constraint
    ALTER TABLE trades DROP CONSTRAINT trades_challenge_id_fkey;
    RAISE NOTICE 'Dropped existing challenge_id foreign key constraint';
  ELSE
    RAISE NOTICE 'No existing challenge_id foreign key constraint found';
  END IF;
  
  -- Make challenge_id nullable
  ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;
  RAISE NOTICE 'Made challenge_id column nullable';
END $$;

-- 3. Create the challenges table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'challenges'
  ) THEN
    CREATE TABLE challenges (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      name TEXT NOT NULL,
      description TEXT,
      status JSONB DEFAULT '{}'::JSONB
    );
    
    -- Add RLS policies for the challenges table
    ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own challenges" 
      ON challenges FOR SELECT 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert their own challenges" 
      ON challenges FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own challenges" 
      ON challenges FOR UPDATE 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can delete their own challenges" 
      ON challenges FOR DELETE 
      USING (auth.uid() = user_id);
      
    RAISE NOTICE 'Created challenges table with RLS policies';
  ELSE
    RAISE NOTICE 'challenges table already exists';
  END IF;
END $$;

-- 4. Re-add the foreign key constraint for challenge_id
DO $$
BEGIN
  -- Check if challenges table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'challenges'
  ) THEN
    -- Add the constraint with ON DELETE SET NULL
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

-- 5. Add foreign key constraint for account_id if accounts table exists
DO $$
BEGIN
  -- Check if accounts table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'accounts'
  ) THEN
    -- Check if constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_trades_account_id'
    ) THEN
      ALTER TABLE trades 
      ADD CONSTRAINT fk_trades_account_id 
      FOREIGN KEY (account_id) 
      REFERENCES accounts(id) 
      ON DELETE SET NULL;
      
      RAISE NOTICE 'Added foreign key constraint for account_id';
    ELSE
      RAISE NOTICE 'Foreign key constraint for account_id already exists';
    END IF;
  ELSE
    RAISE NOTICE 'accounts table does not exist. Foreign key constraint for account_id not added.';
  END IF;
END $$;

-- 6. Create index on account_id for better performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_trades_account_id'
  ) THEN
    CREATE INDEX idx_trades_account_id ON trades(account_id);
    RAISE NOTICE 'Created index on account_id column';
  ELSE
    RAISE NOTICE 'Index on account_id column already exists';
  END IF;
END $$; 