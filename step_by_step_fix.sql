-- SOLUÇÃO PASSO A PASSO PARA O BANCO DE DADOS
-- Execute cada etapa separadamente para identificar possíveis erros

-- ETAPA 1: Remover restrições problemáticas
-- Execute esta etapa primeiro
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_challenge_id_fkey;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS fk_trades_account;
ALTER TABLE trades DROP CONSTRAINT IF EXISTS fk_trades_account_id;

-- ETAPA 2: Adicionar coluna account_id se não existir
-- Execute esta etapa em seguida
ALTER TABLE trades ADD COLUMN IF NOT EXISTS account_id UUID;

-- ETAPA 3: Garantir que challenge_id seja nullable
-- Execute esta etapa depois
ALTER TABLE trades ALTER COLUMN challenge_id DROP NOT NULL;

-- ETAPA 4: Criar a tabela challenges se não existir
-- Execute esta etapa em seguida
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

-- ETAPA 5: Configurar políticas de segurança (RLS) para a tabela challenges
-- Execute esta etapa em seguida
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own challenges" ON challenges;
CREATE POLICY "Users can view their own challenges" 
  ON challenges FOR SELECT 
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can insert their own challenges" ON challenges;
CREATE POLICY "Users can insert their own challenges" 
  ON challenges FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can update their own challenges" ON challenges;
CREATE POLICY "Users can update their own challenges" 
  ON challenges FOR UPDATE 
  USING (auth.uid() = user_id);
  
DROP POLICY IF EXISTS "Users can delete their own challenges" ON challenges;
CREATE POLICY "Users can delete their own challenges" 
  ON challenges FOR DELETE 
  USING (auth.uid() = user_id);

-- ETAPA 6: Adicionar índices para melhor performance
-- Execute esta etapa em seguida
CREATE INDEX IF NOT EXISTS idx_trades_account_id ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_challenge_id ON trades(challenge_id);

-- ETAPA 7: Adicionar a restrição de chave estrangeira para challenge_id
-- Execute esta etapa em seguida
ALTER TABLE trades 
ADD CONSTRAINT trades_challenge_id_fkey 
FOREIGN KEY (challenge_id) 
REFERENCES challenges(id) 
ON DELETE SET NULL;

-- ETAPA 8: Adicionar a restrição de chave estrangeira para account_id
-- Execute esta etapa por último
-- Se ocorrer um erro, verifique se a tabela accounts existe
ALTER TABLE trades 
ADD CONSTRAINT fk_trades_account_id 
FOREIGN KEY (account_id) 
REFERENCES accounts(id) 
ON DELETE SET NULL;

-- ETAPA 9 (OPCIONAL): Inserir dados de exemplo na tabela challenges
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