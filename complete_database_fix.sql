-- SOLUÇÃO DEFINITIVA PARA O BANCO DE DADOS
-- Este script cria a tabela challenges, adiciona a coluna account_id à tabela trades
-- e configura corretamente todas as restrições de chave estrangeira

-- 1. Primeiro, remover as restrições de chave estrangeira existentes que estão causando problemas
DO $$
BEGIN
  -- Remover a restrição de chave estrangeira trades_challenge_id_fkey se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'trades_challenge_id_fkey'
  ) THEN
    ALTER TABLE trades DROP CONSTRAINT trades_challenge_id_fkey;
    RAISE NOTICE 'Restrição trades_challenge_id_fkey removida com sucesso';
  END IF;

  -- Remover a restrição de chave estrangeira fk_trades_account se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_trades_account'
  ) THEN
    ALTER TABLE trades DROP CONSTRAINT fk_trades_account;
    RAISE NOTICE 'Restrição fk_trades_account removida com sucesso';
  END IF;

  -- Remover a restrição de chave estrangeira fk_trades_account_id se existir
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_trades_account_id'
  ) THEN
    ALTER TABLE trades DROP CONSTRAINT fk_trades_account_id;
    RAISE NOTICE 'Restrição fk_trades_account_id removida com sucesso';
  END IF;
END $$;

-- 2. Criar a tabela challenges se ela não existir
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
      rules JSONB DEFAULT '{}'::JSONB,
      status JSONB DEFAULT '{}'::JSONB
    );
    
    -- Adicionar políticas de segurança (RLS) para a tabela challenges
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
    
    RAISE NOTICE 'Tabela challenges criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela challenges já existe';
  END IF;
END $$;

-- 3. Adicionar a coluna account_id à tabela trades se ela não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trades' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE trades ADD COLUMN account_id UUID;
    RAISE NOTICE 'Coluna account_id adicionada à tabela trades';
  ELSE
    RAISE NOTICE 'Coluna account_id já existe na tabela trades';
  END IF;
END $$;

-- 4. Garantir que challenge_id seja nullable
DO $$
BEGIN
  ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;
  RAISE NOTICE 'Coluna challenge_id agora é nullable';
END $$;

-- 5. Adicionar índices para melhor performance
DO $$
BEGIN
  -- Índice para account_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_trades_account_id'
  ) THEN
    CREATE INDEX idx_trades_account_id ON trades(account_id);
    RAISE NOTICE 'Índice idx_trades_account_id criado';
  ELSE
    RAISE NOTICE 'Índice idx_trades_account_id já existe';
  END IF;
  
  -- Índice para challenge_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_trades_challenge_id'
  ) THEN
    CREATE INDEX idx_trades_challenge_id ON trades(challenge_id);
    RAISE NOTICE 'Índice idx_trades_challenge_id criado';
  ELSE
    RAISE NOTICE 'Índice idx_trades_challenge_id já existe';
  END IF;
END $$;

-- 6. Adicionar as restrições de chave estrangeira corretamente
DO $$
BEGIN
  -- Adicionar restrição de chave estrangeira para challenge_id
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'challenges'
  ) THEN
    ALTER TABLE trades 
    ADD CONSTRAINT trades_challenge_id_fkey 
    FOREIGN KEY (challenge_id) 
    REFERENCES challenges(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Restrição trades_challenge_id_fkey adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela challenges não existe, restrição de chave estrangeira não adicionada';
  END IF;
  
  -- Adicionar restrição de chave estrangeira para account_id
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'accounts'
  ) THEN
    ALTER TABLE trades 
    ADD CONSTRAINT fk_trades_account_id 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE SET NULL;
    
    RAISE NOTICE 'Restrição fk_trades_account_id adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela accounts não existe, restrição de chave estrangeira não adicionada';
  END IF;
END $$;

-- 7. Inserir alguns dados de exemplo na tabela challenges (opcional)
-- Descomente e modifique conforme necessário
/*
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Substitua pelo ID do usuário real
  user_id := 'seu-user-id-aqui';
  
  INSERT INTO challenges (user_id, name, description, rules, status)
  VALUES 
    (user_id, 'Desafio FTMO $10K', 'Desafio de prop firm FTMO', 
     '{"firmName": "FTMO", "accountSize": 10000, "profitTarget": 1000, "dailyDrawdown": 500, "overallDrawdown": 1000}'::JSONB,
     '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 10000}'::JSONB),
    
    (user_id, 'Desafio MyForexFunds $25K', 'Desafio de prop firm MyForexFunds', 
     '{"firmName": "MyForexFunds", "accountSize": 25000, "profitTarget": 2500, "dailyDrawdown": 1250, "overallDrawdown": 2500}'::JSONB,
     '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 25000}'::JSONB);
     
  RAISE NOTICE 'Dados de exemplo inseridos na tabela challenges';
END $$;
*/

-- Confirmação de conclusão
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'CONFIGURAÇÃO DO BANCO DE DADOS CONCLUÍDA COM SUCESSO';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Agora você deve ser capaz de:';
  RAISE NOTICE '1. Criar novos trades sem erros de restrição de chave estrangeira';
  RAISE NOTICE '2. Associar trades a desafios e contas';
  RAISE NOTICE '3. Utilizar todas as funcionalidades do aplicativo normalmente';
  RAISE NOTICE '=================================================';
END $$; 