-- SOLUÇÃO SIMPLIFICADA PARA O BANCO DE DADOS
-- Este script corrige os problemas com as tabelas trades e challenges

-- 1. Remover restrições problemáticas
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_challenge_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS fk_trades_account;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS fk_trades_account_id;

-- 2. Adicionar coluna account_id se não existir
ALTER TABLE trades ADD COLUMN IF NOT EXISTS account_id UUID;

-- 3. Garantir que challenge_id seja nullable
ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;

-- 4. Criar a tabela challenges se não existir
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB DEFAULT '{}'::JSONB,
  status JSONB DEFAULT '{}'::JSONB
);

-- 5. Adicionar políticas de segurança (RLS) para a tabela challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar erros de duplicação
DROP POLICY IF EXISTS "Users can view their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can insert their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges;

-- Criar novas políticas
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

-- 6. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_challenge_id ON trades(challenge_id);

-- 7. Adicionar as restrições de chave estrangeira corretamente
ALTER TABLE trades 
ADD CONSTRAINT trades_challenge_id_fkey 
FOREIGN KEY (challenge_id) 
REFERENCES challenges(id) 
ON DELETE SET NULL;

-- 8. Adicionar restrição de chave estrangeira para account_id se a tabela accounts existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'accounts'
  ) THEN
    ALTER TABLE trades 
    ADD CONSTRAINT fk_trades_account_id 
    FOREIGN KEY (account_id) 
    REFERENCES accounts(id) 
    ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignora erros se a tabela accounts não existir
    RAISE NOTICE 'Não foi possível adicionar a restrição de chave estrangeira para account_id';
END $$;

-- 9. Inserir dados de exemplo na tabela challenges (opcional)
-- Descomente e substitua 'seu-user-id-aqui' pelo seu ID de usuário real
/*
INSERT INTO challenges (user_id, name, description, rules, status)
VALUES 
  ('seu-user-id-aqui', 'Desafio FTMO $10K', 'Desafio de prop firm FTMO', 
   '{"firmName": "FTMO", "accountSize": 10000, "profitTarget": 1000, "dailyDrawdown": 500, "overallDrawdown": 1000}'::JSONB,
   '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 10000}'::JSONB),
  
  ('seu-user-id-aqui', 'Desafio MyForexFunds $25K', 'Desafio de prop firm MyForexFunds', 
   '{"firmName": "MyForexFunds", "accountSize": 25000, "profitTarget": 2500, "dailyDrawdown": 1250, "overallDrawdown": 2500}'::JSONB,
   '{"isPassed": false, "isDailyDrawdownViolated": false, "isOverallDrawdownViolated": false, "currentEquity": 25000}'::JSONB);
*/ 